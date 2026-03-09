import InterviewConfig from '../models/InterviewConfig.js';
import InterviewSession from '../models/InterviewSession.js';
import ConversationHistory from '../models/ConversationHistory.js';
import MonitoringAlert from '../models/MonitoringAlert.js';
import aiService from './aiService.js';
import { emitToSession } from '../config/websocket.js';

const interviewService = {
  /**
   * Start a new interview session
   */
  async startInterview(configId, userId) {
    // Get config
    const config = await InterviewConfig.findById(configId);
    if (!config) {
      throw new Error('Interview configuration not found');
    }

    // Create session
    const session = await InterviewSession.create({
      config_id: configId,
      user_id: userId || config.user_id,
    });

    // Update config status
    await InterviewConfig.updateStatus(configId, 'active');

    // Generate first question
    const aiResponse = await aiService.generateQuestion({
      questionCount: config.question_count,
      selectedTopics: config.selected_topics,
      difficultyLevel: config.difficulty_level,
      conversationHistory: [],
      currentQuestionNumber: 1,
    });

    // Save first question to history
    await ConversationHistory.create({
      session_id: session.id,
      question_number: 1,
      question_text: aiResponse.question,
      topic: aiResponse.topic,
      is_followup: false,
    });

    // Increment question count
    await InterviewSession.incrementQuestionCount(session.id);

    return {
      sessionId: session.id,
      question: aiResponse.question,
      questionNumber: 1,
      topic: aiResponse.topic,
      totalQuestions: config.question_count,
      status: 'in_progress',
    };
  },

  /**
   * Process candidate's answer and get next question
   */
  async processAnswer(sessionId, { answerText, responseTimeSeconds }) {
    // Get session with config
    const session = await InterviewSession.findByIdWithConfig(sessionId);
    if (!session) {
      throw new Error('Interview session not found');
    }

    if (session.status !== 'in_progress') {
      throw new Error('Interview is not in progress');
    }

    // Get conversation history
    const conversationHistory = await ConversationHistory.findBySessionId(sessionId);
    const lastQuestion = conversationHistory[conversationHistory.length - 1];

    if (!lastQuestion) {
      throw new Error('No question found to answer');
    }

    // Update the last question with the answer
    await ConversationHistory.updateAnswer(lastQuestion.id, {
      candidateAnswer: answerText,
      responseTimeSeconds,
    });

    // Evaluate the answer
    const evaluation = await aiService.evaluateAnswer({
      question: lastQuestion.question_text,
      answer: answerText,
      conversationHistory,
      difficultyLevel: session.difficulty_level,
    });

    // Get updated history
    const updatedHistory = await ConversationHistory.findBySessionId(sessionId);
    const mainQuestionsAsked = await ConversationHistory.getQuestionCount(sessionId);

    // Check if interview should end immediately based on strict question count limits
    if (mainQuestionsAsked >= session.question_count) {
      // Interview complete - generate feedback
      return {
        complete: true,
        message: 'Interview completed. Generating your feedback report...',
        sessionId,
      };
    }

    // Generate next main question
    const aiResponse = await aiService.generateQuestion({
      questionCount: session.question_count,
      selectedTopics: session.selected_topics,
      difficultyLevel: session.difficulty_level,
      conversationHistory: updatedHistory,
      currentQuestionNumber: mainQuestionsAsked + 1,
    });

    if (aiResponse.complete) {
      return {
        complete: true,
        message: aiResponse.message || 'Interview completed. Generating your feedback report...',
        sessionId,
      };
    }

    const nextQuestion = aiResponse.question;
    
    // Save new question
    await ConversationHistory.create({
      session_id: sessionId,
      question_number: mainQuestionsAsked + 1,
      question_text: nextQuestion,
      topic: aiResponse.topic,
      is_followup: false,
    });

    await InterviewSession.incrementQuestionCount(sessionId);

    // Emit to WebSocket
    emitToSession(sessionId, 'ai_response_ready', {
      question: nextQuestion,
      isFollowUp: false,
      questionNumber: mainQuestionsAsked + 1,
    });

    return {
      complete: false,
      question: nextQuestion,
      isFollowUp: false,
      questionNumber: mainQuestionsAsked + 1,
      totalQuestions: session.question_count,
      questionsAsked: mainQuestionsAsked + 1,
      evaluation: {
        quality: evaluation.quality,
        keyPointsCovered: evaluation.keyPointsCovered,
      },
    };
  },

  /**
   * End interview session
   */
  async endInterview(sessionId, reason = 'completed') {
    const session = await InterviewSession.findByIdWithConfig(sessionId);
    if (!session) {
      throw new Error('Interview session not found');
    }

    // Update session status
    const status = reason === 'terminated' ? 'terminated' : 'completed';
    await InterviewSession.updateStatus(sessionId, status);

    // Update config status
    await InterviewConfig.updateStatus(session.config_id, 'completed');

    // Emit termination event if needed
    if (reason === 'terminated') {
      emitToSession(sessionId, 'interview_terminated', {
        reason,
        message: 'Interview has been terminated.',
      });
    }

    return { sessionId, status, reason };
  },

  /**
   * Get interview status
   */
  async getStatus(sessionId) {
    const session = await InterviewSession.findByIdWithConfig(sessionId);
    if (!session) {
      throw new Error('Interview session not found');
    }

    const questionsAsked = await ConversationHistory.getQuestionCount(sessionId);
    const alerts = await MonitoringAlert.getAlertCounts(sessionId);

    return {
      sessionId,
      status: session.status,
      currentQuestion: questionsAsked,
      totalQuestions: session.question_count,
      topics: session.selected_topics,
      startedAt: session.started_at,
      alertCounts: alerts,
    };
  },
};

export default interviewService;
