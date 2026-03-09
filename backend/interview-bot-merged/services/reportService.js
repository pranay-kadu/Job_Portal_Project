import InterviewReport from '../models/InterviewReport.js';
import InterviewSession from '../models/InterviewSession.js';
import ConversationHistory from '../models/ConversationHistory.js';
import MonitoringAlert from '../models/MonitoringAlert.js';
import aiService from './aiService.js';

const reportService = {
  /**
   * Generate feedback report for completed interview
   */
  async generateReport(sessionId) {
    // Check if report already exists
    const existingReport = await InterviewReport.findBySessionId(sessionId);
    if (existingReport) {
      return existingReport;
    }

    // Get session data
    const session = await InterviewSession.findByIdWithConfig(sessionId);
    if (!session) {
      throw new Error('Interview session not found');
    }

    // Get conversation history
    const conversationHistory = await ConversationHistory.findBySessionId(sessionId);
    if (conversationHistory.length === 0) {
      throw new Error('No conversation history found for this session');
    }

    // Get monitoring alerts
    const monitoringAlerts = await MonitoringAlert.findBySessionId(sessionId);

    // Generate feedback using OpenAI
    const feedback = await aiService.generateFeedback({
      conversationHistory,
      monitoringAlerts,
      selectedTopics: session.selected_topics,
      difficultyLevel: session.difficulty_level,
    });

    // Sanitize topic performance keys (MongoDB doesn't allow dots in keys)
    const sanitizedTopicPerformance = {};
    if (feedback.topicPerformance && typeof feedback.topicPerformance === 'object') {
      Object.entries(feedback.topicPerformance).forEach(([topic, score]) => {
        const safeTopic = topic.replace(/\./g, '_');
        sanitizedTopicPerformance[safeTopic] = Number(score) || 0;
      });
    }

    const sessionUserId = session.user_id?.toString() || '00000000-0000-0000-0000-000000000001';
    console.log(`REPORT SERVICE: Generating report. Session ${sessionId}, User: ${sessionUserId}`);

    // Create report in database with sanitized data
    const report = await InterviewReport.create({
      session_id: sessionId,
      user_id: sessionUserId,
      technical_score: Number(feedback.technicalScore) || 0,
      communication_score: Number(feedback.communicationScore) || 0,
      problem_solving_score: Number(feedback.problemSolvingScore) || 0,
      strengths: Array.isArray(feedback.strengths) ? feedback.strengths : [],
      improvements: Array.isArray(feedback.improvements) ? feedback.improvements : [],
      topic_performance: sanitizedTopicPerformance,
      verdict: feedback.verdict || 'needs_improvement',
      detailed_feedback: feedback.detailedFeedback || 'Report generated successfully.',
    });

    console.log(`REPORT SERVICE: Successfully saved report ${report._id} for user ${sessionUserId}`);

    console.log(`REPORT SERVICE: Report created successfully with ID: ${report._id}`);

    const reportObj = report.toObject();

    return {
      ...reportObj,
      strengths: reportObj.strengths,
      improvements: reportObj.improvements,
      topicPerformance: sanitizedTopicPerformance,
    };
  },

  /**
   * Get report by session ID
   */
  async getReport(sessionId) {
    const report = await InterviewReport.findBySessionId(sessionId);
    if (!report) {
      throw new Error('Report not found. Interview may not be completed yet.');
    }

    // Get additional session data
    const session = await InterviewSession.findByIdWithConfig(sessionId);
    const conversationHistory = await ConversationHistory.findBySessionId(sessionId);
    const alerts = await MonitoringAlert.findBySessionId(sessionId);

    const reportData = report.toObject();
    
    return {
      ...reportData,
      session: {
        startedAt: session.started_at,
        endedAt: session.ended_at,
        totalQuestions: session.question_count,
        topics: session.selected_topics,
      },
      questionsAnswered: conversationHistory.length,
      alertCount: alerts.length,
    };
  },

  /**
   * Get all reports for a user
   */
  async getUserReports(userId) {
    const searchId = userId?.toString();
    console.log(`REPORT SERVICE: Fetching for user "${searchId}"`);
    
    // Flexible search for hex string casing differences
    const reports = await InterviewReport.find({ 
      user_id: { $regex: new RegExp(`^${searchId}$`, 'i') } 
    }).sort({ generated_at: -1 }).populate('session_id');

    console.log(`REPORT SERVICE: Query matched ${reports.length} reports.`);
    console.log(`REPORT SERVICE: Found ${reports.length} reports for user`);

    return reports.map(report => {
      const reportData = report.toObject();
      const session = reportData.session_id || {};
      
      // Ensure we have a valid session ID for the link
      const sId = typeof session === 'object' && session._id 
        ? (session.id || session._id.toString()) 
        : (reportData.session_id ? reportData.session_id.toString() : '');

      return {
        id: reportData.id || reportData._id.toString(),
        sessionId: sId,
        overallScore: reportData.overall_score || 0,
        verdict: reportData.verdict || 'pending',
        generatedAt: reportData.generated_at || reportData.createdAt || new Date(),
        startedAt: session.started_at || reportData.generated_at,
        endedAt: session.ended_at,
      };
    });
  },
};

export default reportService;
