import MonitoringAlert from '../models/MonitoringAlert.js';
import { emitToSession } from '../config/websocket.js';

const monitoringController = {
  /**
   * Log monitoring alert from Python service
   * POST /api/monitoring/alert
   */
  async createAlert(req, res, next) {
    try {
      const { sessionId, alertType, severity, description } = req.body;

      if (!sessionId || !alertType) {
        return res.status(400).json({ error: 'Session ID and alert type are required' });
      }

      const validAlertTypes = ['no_face', 'multiple_faces', 'tab_switch', 'audio_noise'];
      if (!validAlertTypes.includes(alertType)) {
        return res.status(400).json({ error: `Invalid alert type. Valid types: ${validAlertTypes.join(', ')}` });
      }

      // Save alert to database
      const alert = await MonitoringAlert.create({
        session_id: sessionId,
        alert_type: alertType,
        severity: severity || 'warning',
        description: description || getAlertDescription(alertType),
      });

      // Emit alert to frontend via WebSocket
      emitToSession(sessionId, 'monitoring_alert', {
        alertType,
        severity: alert.severity,
        message: alert.description,
        timestamp: alert.timestamp,
      });

      res.status(201).json({
        success: true,
        alertId: alert.id,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get alerts for a session
   * GET /api/monitoring/:sessionId/alerts
   */
  async getAlerts(req, res, next) {
    try {
      const { sessionId } = req.params;
      const alerts = await MonitoringAlert.findBySessionId(sessionId);

      res.json({
        success: true,
        alerts,
        summary: await MonitoringAlert.getAlertCounts(sessionId),
      });
    } catch (error) {
      next(error);
    }
  },
};

function getAlertDescription(alertType) {
  const descriptions = {
    no_face: 'No face detected in the frame. Please ensure you are visible to the camera.',
    multiple_faces: 'Multiple faces detected. Please ensure you are alone during the interview.',
    looking_away: 'You appear to be looking away from the screen. Please focus on the interview.',
    tab_switch: 'Tab switch detected. Please stay on the interview page.',
    audio_noise: 'Background noise detected. Please ensure a quiet environment.',
  };
  return descriptions[alertType] || 'Monitoring alert triggered.';
}

export default monitoringController;
