import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewAPI } from '../../services/api';
import { useInterview } from '../../context/InterviewContext';
import { useVoice } from '../../hooks/useVoice';
import { useWebSocket } from '../../hooks/useWebSocket';
import VideoMonitor from './VideoMonitor';
import AlertBanner from './AlertBanner';
import { Mic, MicOff, Send, Volume2, VolumeX, Loader, Clock } from 'lucide-react';
import Navbar from '../shared/Navbar';
import Footer from '../Footer';

export default function InterviewRoom() {
  const { configId } = useParams();
  const navigate = useNavigate();
  const {
    session,
    currentQuestion,
    questionNumber,
    totalQuestions,
    alerts,
    isComplete,
    startSession,
    updateQuestion,
    completeInterview,
    addAlert,
  } = useInterview();

  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [error, setError] = useState(null);
  const questionStartTime = useRef(Date.now());
  const timerRef = useRef(null);

  const {
    isListening,
    isSpeaking,
    transcript,
    interimTranscript,
    fullTranscript,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    resetTranscript,
    isSupported: voiceSupported,
  } = useVoice();

  // WebSocket handlers
  const handleAlert = useCallback((alert) => {
    addAlert(alert);
  }, [addAlert]);

  const handleNewQuestion = useCallback((data) => {
    updateQuestion(data);
    questionStartTime.current = Date.now();
    if (autoSpeak && data.question) {
      speak(data.question);
    }
  }, [updateQuestion, autoSpeak, speak]);

  const handleTerminated = useCallback((data) => {
    setError(`Interview terminated: ${data.message}`);
    setTimeout(() => navigate('/'), 3000);
  }, [navigate]);

  const { sendTabSwitch } = useWebSocket(session?.sessionId, {
    onAlert: handleAlert,
    onQuestion: handleNewQuestion,
    onTerminated: handleTerminated,
  });

  // Ref for tab switch tracking
  const lastSwitchTime = useRef(0);
  const sessionIdRef = useRef(session?.sessionId);

  // Sync ref when session updates
  useEffect(() => {
    sessionIdRef.current = session?.sessionId;
  }, [session?.sessionId]);

  // Reliable tab visibility & focus detection
  useEffect(() => {
    if (!isStarted || isComplete) return;

    const triggerAlert = () => {
      const now = Date.now();
      // 2-second cooldown to prevent duplicate alerts from blur + visibilitychange
      if (now - lastSwitchTime.current < 2000) return;

      const currentSessionId = sessionIdRef.current;
      if (currentSessionId) {
        lastSwitchTime.current = now;
        console.log('TAB SWITCH DETECTED: reporting alert for session', currentSessionId);

        sendTabSwitch();
        // Remove local addAlert here, wait for backend broadcast to avoid double alerts
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('Visibility state changed to hidden');
        triggerAlert();
      }
    };

    const handleBlur = () => {
      console.log('Window blur event triggered');
      triggerAlert();
    };

    // Add listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isStarted, isComplete, sendTabSwitch, addAlert]);

  // Timer
  useEffect(() => {
    if (isStarted && !isComplete) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isStarted, isComplete]);

  // Sync transcript to answer text
  useEffect(() => {
    if (fullTranscript) {
      setAnswerText(fullTranscript);
    }
  }, [fullTranscript]);

  const startInterview = async () => {
    setIsLoading(true);
    setError(null);

    console.log('Starting interview with configId:', configId);

    try {
      const response = await interviewAPI.start(configId);
      console.log('Interview started:', response.data);

      startSession({
        sessionId: response.data.sessionId,
        question: response.data.question,
        questionNumber: response.data.questionNumber,
        totalQuestions: response.data.totalQuestions,
      });
      setIsStarted(true);
      questionStartTime.current = Date.now();

      if (autoSpeak && response.data.question) {
        setTimeout(() => speak(response.data.question), 500);
      }
    } catch (err) {
      console.error('Failed to start interview:', err);
      const errorMsg = err.response?.data?.error?.message
        || err.response?.data?.error
        || err.message
        || 'Failed to start interview. Make sure backend is running.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answerText.trim()) {
      setError('Please provide an answer');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    const responseTime = Math.round((Date.now() - questionStartTime.current) / 1000);

    try {
      const response = await interviewAPI.submitAnswer(
        session.sessionId,
        answerText.trim(),
        responseTime
      );

      if (response.data.complete) {
        completeInterview();
        navigate(`/report/${session.sessionId}`);
      } else {
        updateQuestion({
          question: response.data.question,
          questionNumber: response.data.questionNumber,
          totalQuestions: response.data.totalQuestions,
        });
        setAnswerText('');
        resetTranscript();
        questionStartTime.current = Date.now();

        if (autoSpeak && response.data.question) {
          speak(response.data.question);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || err.response?.data?.error || 'Failed to submit answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleRecording = () => {
    if (isListening) {
      const result = stopListening();
      setAnswerText(result.text);
    } else {
      resetTranscript();
      startListening();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isStarted) {
    return (
      <div className="interview-room-layout">
        <Navbar />
        <div className="interview-room">
          <div className="pre-interview">
            <h1>Ready to Start Your Interview?</h1>
            <div className="pre-interview-checks">
              <h3>Before you begin, please ensure:</h3>
              <ul>
                <li>Your webcam is working and you are clearly visible</li>
                <li>You are in a quiet environment</li>
                <li>You will not switch tabs during the interview</li>
                <li>Your microphone is enabled (for voice responses)</li>
              </ul>
            </div>
            <VideoMonitor sessionId={null} onAlert={addAlert} previewMode />
            {error && <div className="error-banner">{error}</div>}
            <button className="start-btn large" onClick={startInterview} disabled={isLoading}>
              {isLoading ? <><Loader className="spin" size={20} /> Starting...</> : 'Begin Interview'}
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="interview-room-layout">
      <Navbar />
      <div className="interview-room">
        <AlertBanner alerts={alerts} />

        <div className="interview-header">
          <div className="progress-info">
            <span className="question-counter">
              Question {questionNumber} of {totalQuestions}
            </span>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
              />
            </div>
          </div>
          <div className="timer">
            <Clock size={18} />
            <span>{formatTime(elapsedTime)}</span>
          </div>
        </div>

        <div className="interview-content">
          <div className="video-section">
            <VideoMonitor sessionId={session?.sessionId} onAlert={handleAlert} />
          </div>

          <div className="qa-section">
            <div className="question-box">
              <div className="question-header">
                <h2>Question {questionNumber}</h2>
                <button
                  className={`audio-toggle ${isSpeaking ? 'speaking' : ''}`}
                  onClick={() => isSpeaking ? stopSpeaking() : speak(currentQuestion)}
                  title={isSpeaking ? 'Stop speaking' : 'Read question'}
                >
                  {isSpeaking ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
              </div>
              <p className="question-text">{currentQuestion}</p>
            </div>

            <div className="answer-box">
              <div className="answer-header">
                <h3>Your Answer</h3>
                {voiceSupported && (
                  <button
                    className={`mic-btn ${isListening ? 'recording' : ''}`}
                    onClick={toggleRecording}
                    disabled={isSubmitting}
                  >
                    {isListening ? (
                      <><MicOff size={18} /> Stop Recording</>
                    ) : (
                      <><Mic size={18} /> Start Recording</>
                    )}
                  </button>
                )}
              </div>

              <textarea
                className="answer-input"
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder={isListening ? 'Listening...' : 'Type your answer here or use the microphone...'}
                disabled={isSubmitting}
                rows={6}
              />

              {isListening && interimTranscript && (
                <div className="interim-transcript">
                  <span className="interim-label">Hearing:</span> {interimTranscript}
                </div>
              )}

              {error && <div className="error-message">{error}</div>}

              <button
                className="submit-btn"
                onClick={submitAnswer}
                disabled={isSubmitting || !answerText.trim()}
              >
                {isSubmitting ? (
                  <><Loader className="spin" size={18} /> Submitting...</>
                ) : (
                  <><Send size={18} /> Submit Answer</>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="interview-footer">
          <label className="auto-speak-toggle">
            <input
              type="checkbox"
              checked={autoSpeak}
              onChange={(e) => setAutoSpeak(e.target.checked)}
            />
            Auto-read questions
          </label>
        </div>
      </div>
      <Footer />
    </div>
  );
}
