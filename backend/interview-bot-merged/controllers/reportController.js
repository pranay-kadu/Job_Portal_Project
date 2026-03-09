import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import reportService from '../services/reportService.js';
import pdfService from '../services/pdfService.js';

import fs from 'fs';

const reportController = {
  /**
   * Get report by session ID
   * GET /api/report/:sessionId
   */
  async getBySession(req, res, next) {
    try {
      const { sessionId } = req.params;
      const report = await reportService.getReport(sessionId);

      res.json({
        success: true,
        report,
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  },

  /**
   * Generate and download PDF report
   * GET /api/report/:sessionId/pdf
   */
  async downloadPDF(req, res, next) {
    try {
      const { sessionId } = req.params;
      const report = await reportService.getReport(sessionId);

      // Check if PDF already exists
      const existingPdfPath = path.join(__dirname, '..', 'reports', `report_${sessionId}.pdf`);
      
      let pdfPath;
      if (fs.existsSync(existingPdfPath)) {
        pdfPath = existingPdfPath;
      } else {
        // Generate new PDF
        pdfPath = await pdfService.generatePDF(sessionId, report);
      }

      if (req.query.download === 'true') {
        res.download(pdfPath, `interview_report_${sessionId}.pdf`);
      } else {
        // Send as inline (will open in browser/new tab)
        res.sendFile(pdfPath);
      }
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  },

  /**
   * Get all reports for dashboard
   * GET /api/dashboard/reports
   */
  async getUserReports(req, res, next) {
    try {
      const userId = req.id || req.userId || '00000000-0000-0000-0000-000000000001';
      console.log('DASHBOARD DEBUG: Current UserID from JWT:', userId);
      
      const reports = await reportService.getUserReports(userId);
      console.log(`DASHBOARD DEBUG: Found ${reports.length} reports for this UserID.`);

      // Check for reports under the "default" ID to see if they were orphaned
      const defaultReports = await reportService.getUserReports('00000000-0000-0000-0000-000000000001');
      console.log(`DASHBOARD DEBUG: Found ${defaultReports.length} reports for fallback/default UserID.`);

      res.json({
        success: true,
        userId: userId,
        reports,
      });
    } catch (error) {
      console.error('DASHBOARD DEBUG ERROR:', error);
      next(error);
    }
  },

  /**
   * DEBUG: Get all reports regardless of user
   */
  async getAllSystemReports(req, res, next) {
    try {
      const InterviewReport = (await import('../models/InterviewReport.js')).default;
      const allReports = await InterviewReport.find({}).sort({ generated_at: -1 }).limit(50);
      
      res.json({
        success: true,
        count: allReports.length,
        reports: allReports,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Generate report for a session (manual trigger)
   * POST /api/report/:sessionId/generate
   */
  async generateReport(req, res, next) {
    try {
      const { sessionId } = req.params;
      const report = await reportService.generateReport(sessionId);

      res.json({
        success: true,
        report,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default reportController;
