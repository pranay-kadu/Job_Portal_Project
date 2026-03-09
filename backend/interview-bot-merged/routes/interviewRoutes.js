import express from 'express';
const router = express.Router();
import interviewController from '../controllers/interviewController.js';

// Start new interview
router.post('/start', interviewController.start);

// Submit answer
router.post('/:sessionId/answer', interviewController.answer);

// End interview
router.post('/:sessionId/end', interviewController.end);

// Get interview status
router.get('/:sessionId/status', interviewController.getStatus);

export default router;
