import express from "express";
import OpenAI from "openai";

const router = express.Router();
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/ask", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ reply: "Prompt missing." });
    }

    // use latest model
    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "user", content: prompt }
      ],
    });

    const reply = response.choices[0].message.content;

    res.json({ reply });
  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({
      reply: "AI Error. Please try again.",
      error: error.message,
    });
  }
});

export default router;
