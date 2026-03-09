import express from 'express';
import { enhanceProfessionalSummary, enhanceJobDescription, uploadResume } from '../controllers/resumeBuilderAiController.js';
import { createResume, getResumeById, updateResume, deleteResume, getUserResumes } from '../controllers/resumeBuilderController.js';
import { singleUpload } from '../middlewares/mutler.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';

const router = express.Router();

router.post('/enhance-pro-sum', isAuthenticated, enhanceProfessionalSummary);
router.post('/enhance-job-desc', isAuthenticated, enhanceJobDescription);
router.post('/upload-resume', isAuthenticated, singleUpload, uploadResume);

router.post('/create-resume', isAuthenticated, createResume);
router.get('/resumes', isAuthenticated, getUserResumes);
router.get('/resume/:resumeId', isAuthenticated, getResumeById);
router.put('/update-resume', isAuthenticated, singleUpload, updateResume);
router.delete('/delete-resume/:resumeId', isAuthenticated, deleteResume);

export default router;
