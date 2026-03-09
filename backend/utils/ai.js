import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config({ override: true });

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

const aiModel = {
  async generateContent(prompt) {
    try {
      const completion = await openai.chat.completions.create({
        model: 'google/gemini-2.0-flash-001',
        messages: [{ role: 'user', content: prompt }],
      });

      const text = completion.choices[0].message.content;

      return {
        response: {
          text: () => text
        }
      };
    } catch (error) {
      console.error('OpenRouter API Error:', error.message);
      throw error;
    }
  }
};

export default aiModel;