import InterviewConfig from '../models/InterviewConfig.js';

const configController = {
  /**
   * Create new interview configuration
   * POST /api/config/create
   */
  async create(req, res, next) {
    try {
      const { questionCount, selectedTopics, difficultyLevel, interviewType } = req.body;

      // Validation
      if (!questionCount || questionCount < 1 || questionCount > 20) {
        return res.status(400).json({ error: 'Question count must be between 1 and 20' });
      }

      if (!selectedTopics || !Array.isArray(selectedTopics) || selectedTopics.length === 0) {
        return res.status(400).json({ error: 'At least one topic must be selected' });
      }

      const validTopics = ['DSA', 'OOPS', 'DBMS', 'OS', 'CN', 'MERN', 'Java', 'System Design', 'Cloud', 'AI/ML', 'Mixed IT'];
      const invalidTopics = selectedTopics.filter(t => !validTopics.includes(t));
      if (invalidTopics.length > 0) {
        return res.status(400).json({ error: `Invalid topics: ${invalidTopics.join(', ')}` });
      }

      // Prioritize req.id over req.userId
      const userId = req.id || req.userId || '00000000-0000-0000-0000-000000000001';
      console.log('Creating interview config. UserID:', userId);

      const config = await InterviewConfig.create({
        question_count: questionCount,
        selected_topics: selectedTopics,
        difficulty_level: difficultyLevel || 'medium',
        interview_type: interviewType || 'technical',
        user_id: userId, // Use the prioritized userId
      });

      res.status(201).json({
        success: true,
        configId: config.id,
        config: {
          id: config.id,
          questionCount: config.question_count,
          selectedTopics: config.selected_topics,
          difficultyLevel: config.difficulty_level,
          interviewType: config.interview_type,
          status: config.status,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get configuration by ID
   * GET /api/config/:configId
   */
  async getById(req, res, next) {
    try {
      const { configId } = req.params;
      const config = await InterviewConfig.findById(configId);

      if (!config) {
        return res.status(404).json({ error: 'Configuration not found' });
      }

      res.json({
        id: config.id,
        questionCount: config.question_count,
        selectedTopics: config.selected_topics,
        difficultyLevel: config.difficulty_level,
        interviewType: config.interview_type,
        status: config.status,
        createdAt: config.created_at,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get available topics
   * GET /api/config/topics
   */
  async getTopics(req, res) {
    console.log("DEBUG: getTopics controller entered");
    const topics = [
      { id: 'DSA', name: 'Data Structures & Algorithms', description: 'Arrays, trees, graphs, sorting, searching, dynamic programming' },
      { id: 'OOPS', name: 'Object-Oriented Programming', description: 'Classes, inheritance, polymorphism, design patterns' },
      { id: 'DBMS', name: 'Database Management', description: 'SQL, normalization, indexing, transactions' },
      { id: 'OS', name: 'Operating Systems', description: 'Processes, threads, memory management, scheduling' },
      { id: 'CN', name: 'Computer Networks', description: 'OSI model, TCP/IP, HTTP, DNS, routing' },
      { id: 'MERN', name: 'MERN Stack', description: 'MongoDB, Express, React, Node.js, REST APIs' },
      { id: 'Java', name: 'Java Programming', description: 'Core Java, collections, multithreading, Spring basics' },
      { id: 'System Design', name: 'System Design', description: 'Scalability, load balancing, caching, microservices' },
      { id: 'Cloud', name: 'Cloud Computing', description: 'AWS basics, EC2, S3, deployment, DevOps' },
      { id: 'AI/ML', name: 'AI & Machine Learning', description: 'ML algorithms, neural networks, NLP basics' },
      { id: 'Mixed IT', name: 'Mixed IT Interview', description: 'General software engineering topics' },
    ];

    res.json({ topics });
  },
};

export default configController;
