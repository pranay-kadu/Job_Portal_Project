import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config({ override: true });

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

const model = {
  /**
   * Wrapper to maintain compatibility with the existing .generateContent() calls
   */
  async generateContent(prompt) {
    try {
      const completion = await openai.chat.completions.create({
        model: 'google/gemini-2.0-flash-001', // OpenRouter model ID
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });

      const text = completion.choices[0].message.content;

      // Wrap in a response object that mimics Google SDK's structure
      return {
        response: {
          text: () => text
        }
      };
    } catch (error) {
      console.error('OpenRouter/OpenAI API Error:', error.message);
      throw error;
    }
  }
};

export default model;
