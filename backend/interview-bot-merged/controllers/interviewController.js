import interviewService from '../services/interviewService.js';
import reportService from '../services/reportService.js';

const interviewController = {
  /**
   * Start a new interview
   * POST /api/interview/start
   */
  async start(req, res, next) {
    try {
      const { configId } = req.body;

      if (!configId) {
        return res.status(400).json({ error: 'Configuration ID is required' });
      }

      const result = await interviewService.startInterview(configId, req.id || req.userId);

      res.status(201).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Submit answer and get next question
   * POST /api/interview/:sessionId/answer
   */
  async answer(req, res, next) {
    try {
      const { sessionId } = req.params;
      const { answerText, responseTimeSeconds } = req.body;

      if (!answerText || answerText.trim().length === 0) {
        return res.status(400).json({ error: 'Answer text is required' });
      }

      const result = await interviewService.processAnswer(sessionId, {
        answerText: answerText.trim(),
        responseTimeSeconds,
      });

      // If interview is complete, trigger report generation
      if (result.complete) {
        try {
          await interviewService.endInterview(sessionId, 'completed');
          const report = await reportService.generateReport(sessionId);
          return res.json({
            success: true,
            complete: true,
            message: result.message,
            reportId: report.id,
            sessionId,
          });
        } catch (reportError) {
          console.error('Report generation error:', reportError);
          return res.json({
            success: true,
            complete: true,
            message: result.message,
            sessionId,
            reportError: 'Report will be generated shortly',
          });
        }
      }

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * End interview session
   * POST /api/interview/:sessionId/end
   */
  async end(req, res, next) {
    try {
      const { sessionId } = req.params;
      const { reason } = req.body;

      const result = await interviewService.endInterview(sessionId, reason || 'completed');

      // Generate report
      let report = null;
      try {
        report = await reportService.generateReport(sessionId);
      } catch (reportError) {
        console.error('Report generation error:', reportError);
      }

      res.json({
        success: true,
        ...result,
        reportId: report?.id,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get interview status
   * GET /api/interview/:sessionId/status
   */
  async getStatus(req, res, next) {
    try {
      const { sessionId } = req.params;
      const status = await interviewService.getStatus(sessionId);

      res.json({
        success: true,
        ...status,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default interviewController;
