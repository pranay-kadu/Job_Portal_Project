import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { configAPI } from '../../services/api';
import { useInterview } from '../../context/InterviewContext';
import { BookOpen, CheckCircle, Settings, Play } from 'lucide-react';
import Navbar from '../shared/Navbar';
import Footer from '../Footer';

const DIFFICULTY_LEVELS = [
  { id: 'easy', name: 'Easy', description: 'Basic concepts and fundamentals' },
  { id: 'medium', name: 'Medium', description: 'Standard interview difficulty' },
  { id: 'hard', name: 'Hard', description: 'Advanced topics and complex problems' },
];

export default function InterviewSetup() {
  const navigate = useNavigate();
  const { updateConfig } = useInterview();
  const [topics, setTopics] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      const response = await configAPI.getTopics();
      setTopics(response.data.topics);
    } catch (err) {
      setError('Failed to load topics');
      console.error(err);
    }
  };

  const toggleTopic = (topicId) => {
    setSelectedTopics(prev =>
      prev.includes(topicId)
        ? prev.filter(t => t !== topicId)
        : [...prev, topicId]
    );
  };

  const handleStart = async () => {
    if (selectedTopics.length === 0) {
      setError('Please select at least one topic');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await configAPI.create({
        questionCount,
        selectedTopics,
        difficultyLevel: difficulty,
        interviewType: 'technical',
      });

      updateConfig(response.data.config);
      navigate(`/interview/${response.data.configId}`);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.response?.data?.error || 'Failed to create interview');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="setup-container">
        <div className="setup-header">
          <h1><Settings size={32} /> Interview Setup</h1>
          <p>Configure your interview preferences before starting</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <div className="setup-section">
          <h2><BookOpen size={20} /> Select Topics</h2>
          <p className="section-hint">Choose the topics you want to be interviewed on</p>
          <div className="topics-grid">
            {topics.map(topic => (
              <div
                key={topic.id}
                className={`topic-card ${selectedTopics.includes(topic.id) ? 'selected' : ''}`}
                onClick={() => toggleTopic(topic.id)}
              >
                <div className="topic-header">
                  <span className="topic-name">{topic.name}</span>
                  {selectedTopics.includes(topic.id) && <CheckCircle size={20} className="check-icon" />}
                </div>
                <p className="topic-description">{topic.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="setup-row">
          <div className="setup-section half">
            <h2>Number of Questions</h2>
            <div className="question-count-selector">
              <input
                type="range"
                min="3"
                max="15"
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
              />
              <span className="count-display">{questionCount} questions</span>
            </div>
          </div>

          <div className="setup-section half">
            <h2>Difficulty Level</h2>
            <div className="difficulty-selector">
              {DIFFICULTY_LEVELS.map(level => (
                <button
                  key={level.id}
                  className={`difficulty-btn ${difficulty === level.id ? 'selected' : ''}`}
                  onClick={() => setDifficulty(level.id)}
                >
                  <span className="level-name">{level.name}</span>
                  <span className="level-desc">{level.description}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="setup-summary">
          <h3>Interview Summary</h3>
          <ul>
            <li><strong>Topics:</strong> {selectedTopics.length > 0 ? selectedTopics.join(', ') : 'None selected'}</li>
            <li><strong>Questions:</strong> {questionCount}</li>
            <li><strong>Difficulty:</strong> {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</li>
          </ul>
        </div>

        <button
          className="start-btn"
          onClick={handleStart}
          disabled={isLoading || selectedTopics.length === 0}
        >
          {isLoading ? (
            'Starting...'
          ) : (
            <>
              <Play size={20} /> Start Interview
            </>
          )}
        </button>
      </div>
      <Footer />
    </>
  );
}
