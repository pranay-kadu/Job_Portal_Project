import gemini from '../config/gemini.js';
import { getInterviewerPrompt, getEvaluationPrompt, getFeedbackPrompt } from '../ai/promptTemplates.js';

const aiService = {
  /**
   * Generate the next interview question
   */
  async generateQuestion({ questionCount, selectedTopics, difficultyLevel, conversationHistory, currentQuestionNumber }) {
    const prompt = getInterviewerPrompt({
      questionCount,
      selectedTopics,
      difficultyLevel,
      conversationHistory,
    });

    const userContent = currentQuestionNumber === 1 
      ? 'Start the interview with your first question.'
      : 'Based on the conversation history, provide the next appropriate question or indicate if the interview is complete.';

    try {
      const fullPrompt = `${prompt}\n\nCandidate interaction: ${userContent}`;
      const result = await gemini.generateContent(fullPrompt);
      const response = result.response;
      const text = response.text();
      
      console.log('Gemini raw response for generateQuestion:', text);
      
      try {
        return JSON.parse(text);
      } catch (e) {
        // Fallback: clean markdown if present
        const cleaned = text.replace(/```json|```/g, '').trim();
        return JSON.parse(cleaned);
      }
    } catch (error) {
      console.error('Gemini generateQuestion error:', error.message);
      if (error.message.includes('quota') || error.message.includes('429')) {
        throw new Error('Gemini Quota Exceeded. Please check your billing/plan.');
      }
      throw new Error(`Failed to generate interview question: ${error.message}`);
    }
  },

  /**
   * Evaluate candidate's answer and decide if follow-up needed
   */
  async evaluateAnswer({ question, answer, conversationHistory, difficultyLevel }) {
    const prompt = getEvaluationPrompt({ question, answer, conversationHistory, difficultyLevel });

    try {
      const fullPrompt = `You are an expert technical interview evaluator. Respond only with valid JSON.\n\n${prompt}`;
      const result = await gemini.generateContent(fullPrompt);
      const response = result.response;
      const text = response.text();
      
      try {
        return JSON.parse(text);
      } catch (e) {
        const cleaned = text.replace(/```json|```/g, '').trim();
        return JSON.parse(cleaned);
      }
    } catch (error) {
      console.error('Gemini evaluateAnswer error:', error.message);
      // Default to accepting answer if evaluation fails to avoid blocking the interview
      return { isComplete: true, shouldFollowUp: false, quality: 'acceptable' };
    }
  },

  /**
   * Generate comprehensive feedback report
   */
  async generateFeedback({ conversationHistory, monitoringAlerts, selectedTopics, difficultyLevel }) {
    const prompt = getFeedbackPrompt({ conversationHistory, monitoringAlerts, selectedTopics, difficultyLevel });

    try {
      const fullPrompt = `You are an expert HR and technical interviewer generating interview feedback. Respond only with valid JSON.\n\n${prompt}`;
      const result = await gemini.generateContent(fullPrompt);
      const response = result.response;
      const text = response.text();
      
      try {
        return JSON.parse(text);
      } catch (e) {
        const cleaned = text.replace(/```json|```/g, '').trim();
        return JSON.parse(cleaned);
      }
    } catch (error) {
      console.error('Gemini generateFeedback error:', error.message);
      if (error.message.includes('quota') || error.message.includes('429')) {
        throw new Error('Gemini Quota Exceeded. Cannot generate report.');
      }
      throw new Error('Failed to generate interview feedback');
    }
  },

  /**
   * Generate a follow-up question based on incomplete answer
   */
  async generateFollowUp({ originalQuestion, answer, reason, topic }) {
    try {
      const fullPrompt = `You are a technical interviewer. Generate a single follow-up question to probe deeper into an incomplete answer. Be specific and focused.\n\nOriginal Question: ${originalQuestion}\n\nCandidate's Answer: ${answer}\n\nReason for follow-up: ${reason}\n\nTopic: ${topic}\n\nGenerate ONE follow-up question that addresses the gaps in the answer. Return as a JSON object with a single key "followUpQuestion".`;
      
      const result = await gemini.generateContent(fullPrompt);
      const response = result.response;
      const text = response.text();
      
      try {
        const json = JSON.parse(text);
        return json.followUpQuestion || json.question || json.followUp || text;
      } catch (e) {
        return text.trim();
      }
    } catch (error) {
      console.error('Gemini generateFollowUp error:', error.message);
      return 'Can you elaborate more on your answer?';
    }
  },
};

export default aiService;
