import express from 'express';
const router = express.Router();
import monitoringController from '../controllers/monitoringController.js';

// Create monitoring alert (from Python service)
router.post('/alert', monitoringController.createAlert);

// Get alerts for session
router.get('/:sessionId/alerts', monitoringController.getAlerts);

export default router;
