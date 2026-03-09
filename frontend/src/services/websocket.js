import { io } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

let socket = null;

export const connectSocket = () => {
  if (!socket) {
    socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('WebSocket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinInterview = (sessionId) => {
  if (socket) {
    socket.emit('join_interview', { sessionId });
  }
};

export const leaveInterview = (sessionId) => {
  if (socket) {
    socket.emit('leave_interview', { sessionId });
  }
};

export const reportTabSwitch = (sessionId) => {
  if (socket) {
    socket.emit('tab_switch_detected', { sessionId, timestamp: new Date().toISOString() });
  }
};

export const onMonitoringAlert = (callback) => {
  if (socket) {
    socket.on('monitoring_alert', callback);
  }
};

export const onAIResponseReady = (callback) => {
  if (socket) {
    socket.on('ai_response_ready', callback);
  }
};

export const onInterviewTerminated = (callback) => {
  if (socket) {
    socket.on('interview_terminated', callback);
  }
};

export const removeSocketListeners = () => {
  if (socket) {
    socket.off('monitoring_alert');
    socket.off('ai_response_ready');
    socket.off('interview_terminated');
  }
};

export const getSocket = () => socket;
