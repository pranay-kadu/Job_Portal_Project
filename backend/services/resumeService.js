import fs from 'fs';
import { createRequire } from 'module';
import OpenAI from 'openai';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

// Initialize OpenAI client configured for OpenRouter/Gemini
const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

/**
 * Extract text from PDF file
 */
export async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    throw new Error(`Error reading PDF: ${error.message}`);
  }
}

/**
 * Analyze resume using Gemini (via OpenRouter)
 */
export async function analyzeResumeWithATS(text) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'google/gemini-2.0-flash-001', // Using the same model as Interview Bot
      messages: [
        {
          role: 'system',
          content: `You are an ATS resume analyzer. Analyze the resume and provide output in the following exact format:

**ATS Score:**
[Provide a score out of 100, e.g., "75/100"]

**ATS Score Feedback:**
[Provide feedback about the ATS score in 2-3 short bullet points, explaining strengths and areas for improvement based on factors like: keyword optimization, formatting, structure, completeness, etc.]

**Education:**
[Format each education entry on a single line with all details together:
- Degree/Qualification (Year Range) - Institution Name - CGPA/Percentage
Example: "B.E. CSE (2022-2026) - Prof. Ram Meghe Institute Of Technology and Research, Badnera - CGPA: 7.65"
Example: "HSC (12th) (2020-2022) - Shri Shivaji Science College Amravati - Percentage: 71.33"
Example: "SSC (10th) (2020) - Manibai Gujarati High School Amravati - Percentage: 92.80"
Keep each education entry on one line with all details together.]

**Skills:**
[List all skills mentioned in the resume, one skill per line. Include technical skills, soft skills, programming languages, tools, etc.]

**Experience:**
[List work experience. If none, write "None listed"]

**Mistakes:**
[List grammatical errors and formatting mistakes found in the resume, one per line]

**Recommendations:**
[Provide short, actionable recommendations to improve the resume, one per line]

Ensure proper formatting and that education details stay together on the same line.`,
        },
        {
          role: 'user',
          content: `Analyze this resume and provide the structured output:\n\n${text}`,
        },
      ],
      temperature: 0.2,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    throw new Error(`Error analyzing resume with Gemini: ${error.message}`);
  }
}

/**
 * Parse structured analysis into sections
 */
export function parseAnalysis(analysisText) {
  const sections = {
    atsScore: '',
    atsScoreFeedback: '',
    education: '',
    skills: '',
    experience: '',
    mistakes: '',
    recommendations: '',
  };

  // Extract ATS Score
  const scoreMatch = analysisText.match(/\*\*ATS Score:\*\*\s*\n([\s\S]*?)(?=\*\*ATS Score Feedback:|$)/i);
  if (scoreMatch) {
    sections.atsScore = scoreMatch[1].trim();
  }

  // Extract ATS Score Feedback
  const feedbackMatch = analysisText.match(/\*\*ATS Score Feedback:\*\*\s*\n([\s\S]*?)(?=\*\*Education:|$)/i);
  if (feedbackMatch) {
    sections.atsScoreFeedback = feedbackMatch[1].trim();
  }

  // Extract Education
  const educationMatch = analysisText.match(/\*\*Education:\*\*\s*\n([\s\S]*?)(?=\*\*Skills:|$)/i);
  if (educationMatch) {
    sections.education = educationMatch[1].trim();
  }

  // Extract Skills
  const skillsMatch = analysisText.match(/\*\*Skills:\*\*\s*\n([\s\S]*?)(?=\*\*Experience:|$)/i);
  if (skillsMatch) {
    sections.skills = skillsMatch[1].trim();
  }

  // Extract Experience
  const experienceMatch = analysisText.match(/\*\*Experience:\*\*\s*\n([\s\S]*?)(?=\*\*Mistakes:|$)/i);
  if (experienceMatch) {
    sections.experience = experienceMatch[1].trim();
  }

  // Extract Mistakes
  const mistakesMatch = analysisText.match(/\*\*Mistakes:\*\*\s*\n([\s\S]*?)(?=\*\*Recommendations:|$)/i);
  if (mistakesMatch) {
    sections.mistakes = mistakesMatch[1].trim();
  }

  // Extract Recommendations
  const recommendationsMatch = analysisText.match(/\*\*Recommendations:\*\*\s*\n([\s\S]*?)$/i);
  if (recommendationsMatch) {
    sections.recommendations = recommendationsMatch[1].trim();
  }

  return sections;
}

/**
 * Main function to process resume
 */
export async function processResume(filePath) {
  try {
    // Extract text from PDF
    const extractedText = await extractTextFromPDF(filePath);

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('No text could be extracted from the PDF');
    }

    // Analyze with Gemini
    const fullAnalysis = await analyzeResumeWithATS(extractedText);

    if (!fullAnalysis || fullAnalysis.trim().length === 0) {
      throw new Error('No response from Gemini API');
    }

    // Parse structured sections
    const parsedSections = parseAnalysis(fullAnalysis);

    return {
      extractedText,
      fullAnalysis,
      ...parsedSections,
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Delete resume file
 */
export async function deleteResumeFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    throw new Error(`Error deleting file: ${error.message}`);
  }
}

export default {
  processResume,
  deleteResumeFile,
};
