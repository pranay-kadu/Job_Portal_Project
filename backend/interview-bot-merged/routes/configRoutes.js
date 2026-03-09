import express from 'express';
const router = express.Router();
import configController from '../controllers/configController.js';

// Get available topics
router.get('/topics', configController.getTopics);

// Create new interview configuration
router.post('/create', configController.create);

// Get configuration by ID
router.get('/:configId', configController.getById);

export default router;
