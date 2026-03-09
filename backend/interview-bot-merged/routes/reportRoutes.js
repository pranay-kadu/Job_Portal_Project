import express from 'express';
const router = express.Router();
import reportController from '../controllers/reportController.js';

// Get all user reports (dashboard)
router.get('/dashboard', reportController.getUserReports);

// Generate report manually
router.post('/:sessionId/generate', reportController.generateReport);

// Debug: Get ALL reports in the system
router.get('/debug/all', reportController.getAllSystemReports);

// Get report by session ID
router.get('/:sessionId', reportController.getBySession);

// Download PDF report
router.get('/:sessionId/pdf', reportController.downloadPDF);

export default router;
