import { createContext, useContext, useState, useCallback } from 'react';

const InterviewContext = createContext(null);

export function InterviewProvider({ children }) {
  const [config, setConfig] = useState(null);
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const updateConfig = useCallback((newConfig) => {
    setConfig(newConfig);
  }, []);

  const startSession = useCallback((sessionData) => {
    setSession(sessionData);
    setCurrentQuestion(sessionData.question);
    setQuestionNumber(sessionData.questionNumber);
    setTotalQuestions(sessionData.totalQuestions);
    setIsComplete(false);
    setAlerts([]);
  }, []);

  const updateQuestion = useCallback((questionData) => {
    setCurrentQuestion(questionData.question);
    setQuestionNumber(questionData.questionNumber);
    if (questionData.totalQuestions) {
      setTotalQuestions(questionData.totalQuestions);
    }
  }, []);

  const completeInterview = useCallback(() => {
    setIsComplete(true);
  }, []);

  const addAlert = useCallback((alert) => {
    if (alert.alertType === 'background_clear') {
      setAlerts(prev => prev.filter(a => !['multiple_faces', 'mobile_detected', 'no_face'].includes(a.alertType)));
      return;
    }

    const isPersistent = ['multiple_faces', 'mobile_detected', 'no_face'].includes(alert.alertType);
    const alertId = Date.now();

    setAlerts(prev => {
      // Prevent duplicate alerts of same type
      if (prev.some(a => a.alertType === alert.alertType)) {
        return prev;
      }
      return [...prev, { ...alert, id: alertId }];
    });

    if (!isPersistent) {
      setTimeout(() => {
        setAlerts(prev => prev.filter(a => a.id !== alertId));
      }, 5000);
    }
  }, []);

  const removeAlert = useCallback((alertType) => {
    setAlerts(prev => prev.filter(a => a.alertType !== alertType));
  }, []);

  const resetInterview = useCallback(() => {
    setConfig(null);
    setSession(null);
    setCurrentQuestion(null);
    setQuestionNumber(0);
    setTotalQuestions(0);
    setIsComplete(false);
    setAlerts([]);
  }, []);

  return (
    <InterviewContext.Provider
      value={{
        config,
        session,
        currentQuestion,
        questionNumber,
        totalQuestions,
        isComplete,
        alerts,
        isLoading,
        setIsLoading,
        updateConfig,
        startSession,
        updateQuestion,
        completeInterview,
        addAlert,
        removeAlert,
        resetInterview,
      }}
    >
      {children}
    </InterviewContext.Provider>
  );
}

export function useInterview() {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error('useInterview must be used within InterviewProvider');
  }
  return context;
}
