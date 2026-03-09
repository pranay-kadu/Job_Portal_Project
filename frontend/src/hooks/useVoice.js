import { useState, useEffect, useRef, useCallback } from 'react';
import { speechRecognition, textToSpeech } from '../services/speechServices';

export function useVoice() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    // Initialize speech recognition
    speechRecognition.init();
    
    speechRecognition.setCallbacks({
      onResult: ({ final, interim }) => {
        setTranscript(final);
        setInterimTranscript(interim);
      },
      onEnd: (finalText) => {
        setIsListening(false);
        setTranscript(finalText);
        setInterimTranscript('');
      },
      onError: (err) => {
        setError(err);
        setIsListening(false);
      },
    });

    return () => {
      speechRecognition.stop();
      textToSpeech.stop();
    };
  }, []);

  const startListening = useCallback(() => {
    setError(null);
    setTranscript('');
    setInterimTranscript('');
    startTimeRef.current = Date.now();
    
    const started = speechRecognition.start();
    if (started) {
      setIsListening(true);
    } else {
      setError('Failed to start speech recognition');
    }
    return started;
  }, []);

  const stopListening = useCallback(() => {
    const finalText = speechRecognition.stop();
    setIsListening(false);
    const duration = startTimeRef.current ? Math.round((Date.now() - startTimeRef.current) / 1000) : 0;
    return { text: finalText || transcript, duration };
  }, [transcript]);

  const speak = useCallback(async (text) => {
    setIsSpeaking(true);
    try {
      await textToSpeech.speak(text);
    } catch (err) {
      console.error('TTS error:', err);
    } finally {
      setIsSpeaking(false);
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    textToSpeech.stop();
    setIsSpeaking(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    speechRecognition.reset();
  }, []);

  return {
    isListening,
    isSpeaking,
    transcript,
    interimTranscript,
    fullTranscript: transcript + (interimTranscript ? ' ' + interimTranscript : ''),
    error,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    resetTranscript,
    isSupported: speechRecognition.isSupported() && textToSpeech.isSupported(),
  };
}
