import ResumeBuilder from '../models/ResumeBuilder.js';

export const createResume = async (req, res) => {
  try {
    const userId = req.id;
    const { title } = req.body;
    const newResume = await ResumeBuilder.create({ userId, Title: title });
    return res.status(201).json({ message: 'Resume created successfully', resume: newResume });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const deleteResume = async (req, res) => {
  try {
    const userId = req.id;
    const { resumeId } = req.params;
    await ResumeBuilder.findOneAndDelete({ userId, _id: resumeId });
    return res.status(200).json({ message: 'Resume deleted successfully' });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getResumeById = async (req, res) => {
  try {
    const userId = req.id;
    const { resumeId } = req.params;
    const resume = await ResumeBuilder.findOne({ userId, _id: resumeId });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    return res.status(200).json({ resume });
  } catch (error) {
    console.error("Get Resume Error:", error);
    return res.status(400).json({ message: error.message });
  }
};


export const getUserResumes = async (req, res) => {
  try {
    const userId = req.id;
    const resumes = await ResumeBuilder.find({ userId });
    return res.status(200).json({ resumes });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

import cloudinary from '../utils/cloudinary.js';
import getDataUri from '../utils/datauri.js';

export const updateResume = async (req, res) => {
  try {
    const userId = req.id;
    const { resumeId, resumeData } = req.body;
    
    if (!resumeId) return res.status(400).json({ message: 'Resume ID is required' });

    let parsedData = {};
    if (resumeData) {
      parsedData = typeof resumeData === 'string' ? JSON.parse(resumeData) : resumeData;
    }
    
    // Handle file upload if present
    const file = req.file;
    if (file) {
      const cloudResponse = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'resumes' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(file.buffer);
      });
      
      // Update image in personal_info
      if (!parsedData.personal_info) parsedData.personal_info = {};
      parsedData.personal_info.image = cloudResponse.secure_url;
    }

    // Sync Title if title is present in data
    if (parsedData.title && !parsedData.Title) {
        parsedData.Title = parsedData.title;
    }

    // Safely remove _id and userId from updates to prevent immutable field errors
    delete parsedData._id;
    delete parsedData.userId;

    const resume = await ResumeBuilder.findOneAndUpdate(
      { userId, _id: resumeId },
      { $set: parsedData },
      { new: true, runValidators: true }
    );
    
    if (!resume) return res.status(404).json({ message: 'Resume not found or unauthorized' });

    return res.status(200).json({ message: 'Saved successfully', resume });
  } catch (error) {
    console.error("Update Resume Error:", error);
    return res.status(400).json({ message: error.message });
  }
};
