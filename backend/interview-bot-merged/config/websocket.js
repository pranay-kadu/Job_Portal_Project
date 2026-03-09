import { Server } from 'socket.io';

let io;

const initializeWebSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join_interview', ({ sessionId }) => {
      socket.join(`interview_${sessionId}`);
      console.log(`Socket ${socket.id} joined interview_${sessionId}`);
    });

    socket.on('leave_interview', ({ sessionId }) => {
      socket.leave(`interview_${sessionId}`);
      console.log(`Socket ${socket.id} left interview_${sessionId}`);
    });

    socket.on('tab_switch_detected', async ({ sessionId, timestamp }) => {
      console.log(`[SOCKET] Tab switch detected for session: ${sessionId} at ${timestamp}`);
      // Save alert to database
      try {
        const MonitoringAlert = (await import('../models/MonitoringAlert.js')).default;
        const newAlert = await MonitoringAlert.create({
          session_id: sessionId,
          alert_type: 'tab_switch',
          severity: 'warning',
          description: 'Tab/App switch detected. Candidate moved away from the interview.',
          timestamp: timestamp || new Date()
        });
        console.log(`[DB] Tab switch alert saved: ${newAlert._id}`);
      } catch (e) {
        console.error('[DB ERROR] Failed to log tab switch:', e.message);
      }

      // Forward alert update to the session room
      io.to(`interview_${sessionId}`).emit('monitoring_alert', {
        alertType: 'tab_switch',
        severity: 'warning',
        message: 'Tab switch detected. Please stay focused on the interview.',
        timestamp: timestamp || new Date(),
      });
      console.log(`[SOCKET] Broadcasted tab_switch alert to session room interview_${sessionId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

const emitToSession = (sessionId, event, data) => {
  if (io) {
    io.to(`interview_${sessionId}`).emit(event, data);
  }
};

export {
  initializeWebSocket,
  getIO,
  emitToSession,
};
