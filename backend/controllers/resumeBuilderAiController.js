import ResumeBuilder from "../models/ResumeBuilder.js";
import aiModel from "../utils/ai.js";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

// controller for enhancing a resume's professional summary
// POST: /api/ai/enhance-pro-sum
export const enhanceProfessionalSummary = async (req, res) => {
  try {
    const { userContent } = req.body;

    if (!userContent) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const prompt = `You are an expert in resume writing. Your task is to enhance the professional summary of a resume. The summary should be 1-2 sentences, highlighting key skills, experience, and career objectives. Make it compelling and ATS-friendly. Only return the enhanced text, no options or additional comments.\n\nOriginal Content: ${userContent}`;

    const result = await aiModel.generateContent(prompt);
    const response = await result.response;
    const enhancedContent = response.text();

    return res.status(200).json({ enhancedContent });
  } catch (error) {
    console.error("Enhance Summary Error:", error);
    return res.status(400).json({ message: error.message });
  }
};

// controller for enhancing a resume's job description
//POST: /api/ai/enhance-job-desc
export const enhanceJobDescription = async (req, res) => {
  try {
    const { userContent } = req.body;

    if (!userContent) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const prompt = `You are an expert in resume writing. Your task is to enhance the job description of a resume. The job description should be 1-2 sentences, highlighting key responsibilities and achievements. Use action verbs and quantifiable results where possible. Make it ATS-friendly. Only return the enhanced text, no options or additional comments.\n\nOriginal Content: ${userContent}`;

    const result = await aiModel.generateContent(prompt);
    const response = await result.response;
    const enhancedContent = response.text();

    return res.status(200).json({ enhancedContent });
  } catch (error) {
    console.error("Enhance Job Desc Error:", error);
    return res.status(400).json({ message: error.message });
  }
};

// controller for uploading a resume, parsing it with AI, and saving to database
// POST: /api/ai/upload-resume
export const uploadResume = async (req, res) => {
  try {
    const userId = req.id;
    const { title } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No resume file uploaded" });
    }

    // Extract text from PDF
    const data = await pdf(file.buffer);
    const resumeText = data.text;

    console.log("Extracted Resume Text (first 500 chars):", resumeText?.substring(0, 500));

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({ message: "Could not extract enough text from the PDF" });
    }

    const prompt = `You are an expert AI Agent specializing in resume parsing and data extraction.
    
    TASK:
    Extract all professional information from the following resume text:
    "${resumeText}"

    REQUIREMENTS:
    1. Provide the output STRICTLY as a single valid JSON object.
    2. Do NOT include any explanations, markdown markers (like \`\`\`json), or preamble.
    3. If a piece of information is missing, use an empty string "" for strings and an empty array [] for arrays.
    4. Ensure dates are cleaned up (e.g., "Jan 2020" or "01/2020").
    
    JSON STRUCTURE:
    {
      "professional_summary": "A brief overview of their career.",
      "skills": ["Skill 1", "Skill 2"],
      "personal_info": {
          "full_name": "Full legal name",
          "profession": "Current job title or expertise",
          "email": "emailAddress",
          "phone": "phoneNumber",
          "location": "City, State/Country",
          "linkedin": "LinkedIn URL",
          "website": "Portfolio or personal URL"
      },
      "experience": [
          {
              "company": "Company Name",
              "position": "Job Title",
              "start_date": "Date",
              "end_date": "Date or Present",
              "description": "Key achievements and responsibilities.",
              "is_current": false
          }
      ],
      "project": [
          {
              "name": "Project Name",
              "type": "Category",
              "description": "Details about the project."
          }
      ],
      "education": [
          {
              "institution": "University Name",
              "degree": "Degree (e.g., B.S., M.A.)",
              "field": "Field of Study",
              "graduation_date": "Date",
              "gpa": "Grade point average"
          }
      ]
    }`;

    const result = await aiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up potential markdown code blocks if AI adds them
    let jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    let parsedData;
    try {
        parsedData = JSON.parse(jsonString);
    } catch (e) {
        console.error("JSON Parse Error:", text);
        return res.status(500).json({ message: "AI response was not valid JSON" });
    }

    // Create the resume in the database
    const newResume = await ResumeBuilder.create({ 
        userId, 
        Title: title || parsedData.personal_info?.full_name || 'Uploaded Resume', 
        ...parsedData 
    });

    res.json({ resumeId: newResume._id, message: "Resume uploaded and parsed successfully" });
  } catch (error) {
    console.error("AI Parse Error:", error);
    return res.status(400).json({ message: "Failed to parse resume data: " + error.message });
  }
};
