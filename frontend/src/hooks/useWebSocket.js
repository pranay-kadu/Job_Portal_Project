import { useEffect, useCallback, useRef } from 'react';
import {
  connectSocket,
  disconnectSocket,
  joinInterview,
  leaveInterview,
  reportTabSwitch,
  onMonitoringAlert,
  onAIResponseReady,
  onInterviewTerminated,
  removeSocketListeners,
} from '../services/websocket';

export function useWebSocket(sessionId, callbacks = {}) {
  const { onAlert, onQuestion, onTerminated } = callbacks;
  const callbacksRef = useRef({ onAlert, onQuestion, onTerminated });

  // Update refs when callbacks change
  useEffect(() => {
    callbacksRef.current = { onAlert, onQuestion, onTerminated };
  }, [onAlert, onQuestion, onTerminated]);

  useEffect(() => {
    if (!sessionId) return;

    const socket = connectSocket();

    // Join interview room
    joinInterview(sessionId);

    // Set up listeners
    onMonitoringAlert((alert) => {
      if (callbacksRef.current.onAlert) {
        callbacksRef.current.onAlert(alert);
      }
    });

    onAIResponseReady((data) => {
      if (callbacksRef.current.onQuestion) {
        callbacksRef.current.onQuestion(data);
      }
    });

    onInterviewTerminated((data) => {
      if (callbacksRef.current.onTerminated) {
        callbacksRef.current.onTerminated(data);
      }
    });

    // Cleanup
    return () => {
      leaveInterview(sessionId);
      removeSocketListeners();
    };
  }, [sessionId]);

  const sendTabSwitch = useCallback(() => {
    if (sessionId) {
      reportTabSwitch(sessionId);
    }
  }, [sessionId]);

  const disconnect = useCallback(() => {
    disconnectSocket();
  }, []);

  return {
    sendTabSwitch,
    disconnect,
  };
}
