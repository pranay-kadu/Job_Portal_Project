import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { reportAPI, monitoringAPI } from '../../services/api';
import {
  Award,
  TrendingUp,
  TrendingDown,
  Download,
  Home,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader,
  BarChart3,
  MessageSquare,
  Brain,
  PlusCircle,
  LayoutDashboard,
} from 'lucide-react';
import Navbar from '../shared/Navbar';
import Footer from '../Footer';

export default function FeedbackReport() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReport();
  }, [sessionId]);

  const loadReport = async () => {
    try {
      const [reportRes, alertsRes] = await Promise.all([
        reportAPI.getBySession(sessionId),
        monitoringAPI.getAlerts(sessionId)
      ]);
      setReport(reportRes.data.report);
      setAlerts(alertsRes.data);
    } catch (err) {
      if (err.response?.status === 404) {
        // Report not generated yet, try to generate
        try {
          await reportAPI.generate(sessionId);
          const [reportRes, alertsRes] = await Promise.all([
            reportAPI.getBySession(sessionId),
            monitoringAPI.getAlerts(sessionId)
          ]);
          setReport(reportRes.data.report);
          setAlerts(alertsRes.data);
        } catch (genErr) {
          setError('Report is being generated. Please wait a moment and refresh.');
        }
      } else {
        setError(err.response?.data?.error?.message || err.response?.data?.error || 'Failed to load report');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = () => {
    const pdfUrl = reportAPI.downloadPDF(sessionId);
    // 1. Open in new tab (inline view)
    window.open(pdfUrl, '_blank');

    // 2. Trigger automatic download
    const link = document.createElement('a');
    link.href = `${pdfUrl}?download=true`;
    link.setAttribute('download', `interview_report_${sessionId}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getVerdictConfig = (verdict, score) => {
    // Override if score is very high
    if (score >= 9) {
      return {
        icon: Award,
        color: '#8b5cf6',
        bgColor: '#f5f3ff',
        text: 'EXCELLENT',
        message: 'Masterful performance! You demonstrated exceptional expertise.',
      };
    }

    switch (verdict) {
      case 'excellent':
        return {
          icon: Award,
          color: '#8b5cf6',
          bgColor: '#f5f3ff',
          text: 'EXCELLENT',
          message: 'Masterful performance! You demonstrated exceptional expertise.',
        };
      case 'selected':
        return {
          icon: CheckCircle,
          color: '#22c55e',
          bgColor: '#dcfce7',
          text: 'GREAT',
          message: 'Congratulations! You performed very well in the interview.',
        };
      case 'needs_improvement':
        return {
          icon: AlertTriangle,
          color: '#f59e0b',
          bgColor: '#fef3c7',
          text: 'NEEDS IMPROVEMENT',
          message: 'You showed potential but need more preparation in some areas.',
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: '#ef4444',
          bgColor: '#fee2e2',
          text: 'NOT SELECTED',
          message: 'Unfortunately, you did not meet the requirements this time.',
        };
      default:
        return {
          icon: Award,
          color: '#6b7280',
          bgColor: '#f3f4f6',
          text: verdict?.toUpperCase() || 'PENDING',
          message: 'Your results are being processed.',
        };
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="report-loading">
          <Loader className="spin" size={48} />
          <p>Loading your interview report...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="report-error">
          <AlertTriangle size={48} />
          <p>{error}</p>
          <button onClick={loadReport} className="retry-btn">Retry</button>
          <Link to="/setup" className="home-link">Go Home</Link>
        </div>
        <Footer />
      </>
    );
  }

  const overallScore = report.overall_score ||
    ((report.technical_score + report.communication_score + report.problem_solving_score) / 3).toFixed(1);

  const verdictConfig = getVerdictConfig(report.verdict, overallScore);
  const VerdictIcon = verdictConfig.icon;

  const strengths = typeof report.strengths === 'string'
    ? JSON.parse(report.strengths)
    : report.strengths || [];

  const improvements = typeof report.improvements === 'string'
    ? JSON.parse(report.improvements)
    : report.improvements || [];

  const topicPerformance = typeof report.topicPerformance === 'string'
    ? JSON.parse(report.topicPerformance)
    : report.topicPerformance || report.topic_performance || {};

  const formatFeedback = (text) => {
    if (!text) return null;
    let sectionCounter = 0;
    return text.split('\n')
      .filter(line => !line.includes('Participant Name:'))
      .map((line, i) => {
        let processedLine = line;
        if (line.trim().startsWith('###') && /\d+\./.test(line)) {
          sectionCounter++;
          processedLine = line.replace(/\d+\./, `${sectionCounter}.`);
        }

        if (line.startsWith('###')) {
          const headingText = processedLine.replace(/^###\s*(\d+\.)?\s*/, '').trim();
          return <h3 key={i} className="feedback-subheading">{sectionCounter > 0 && /\d+\./.test(processedLine) ? `${sectionCounter}. ` : ''}{headingText}</h3>;
        }
        if (line.startsWith('---')) {
          return <hr key={i} className="feedback-divider" />;
        }
        if (line.trim() === '') return <br key={i} />;

        const parts = line.split(/(\*\*.*?\*\*)/);
        return (
          <p key={i} className="feedback-paragraph">
            {parts.map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j}>{part.slice(2, -2)}</strong>;
              }
              return part;
            })}
          </p>
        );
      });
  };

  return (
    <>
      <Navbar />
      <div className="report-container">
        {/* Top Action Bar */}
        <div className="report-top-bar">
          <div className="report-title-area">
            <Award size={28} color="var(--primary)" />
            <div className="title-stack">
              <span className="main-title">Interview Report</span>
              <span className="sub-title">Your detailed performance analysis</span>
            </div>
          </div>
          <div className="top-actions">
            <Link to="/dashboard" className="btn-secondary btn-small">
              <LayoutDashboard size={16} /> Dashboard
            </Link>
            <Link to="/setup" className="btn-outline btn-small">
              <PlusCircle size={16} /> Start New
            </Link>
          </div>
        </div>

        {/* Verdict Banner */}
        <div
          className="verdict-banner"
          style={{ backgroundColor: verdictConfig.bgColor, borderColor: verdictConfig.color }}
        >
          <div className="verdict-icon-container" style={{ backgroundColor: verdictConfig.color + '20' }}>
            <VerdictIcon size={40} style={{ color: verdictConfig.color }} />
          </div>
          <div className="verdict-content">
            <h2 style={{ color: verdictConfig.color }}>{verdictConfig.text}</h2>
            <p>{verdictConfig.message}</p>
          </div>
        </div>

        {/* Score Section with modern look */}
        <div className="score-summary-card">
          <div className="overall-score-section">
            <div className="score-circle-modern" style={{ borderColor: verdictConfig.color }}>
              <span className="score-value" style={{ color: verdictConfig.color }}>{overallScore}</span>
              <span className="score-max">/10</span>
            </div>
            <p className="score-label">Overall Performance Score</p>
          </div>

          {/* Score Breakdown Grid */}
          <div className="scores-grid-modern">
            <div className="score-card-modern">
              <Brain size={20} />
              <div className="score-info">
                <h3>Technical</h3>
                <span className="score-text">{report.technical_score}/10</span>
              </div>
              <div className="mini-progress">
                <div className="mini-fill" style={{ width: `${report.technical_score * 10}%`, backgroundColor: '#3b82f6' }} />
              </div>
            </div>

            <div className="score-card-modern">
              <MessageSquare size={20} />
              <div className="score-info">
                <h3>Communication</h3>
                <span className="score-text">{report.communication_score}/10</span>
              </div>
              <div className="mini-progress">
                <div className="mini-fill" style={{ width: `${report.communication_score * 10}%`, backgroundColor: '#8b5cf6' }} />
              </div>
            </div>

            <div className="score-card-modern">
              <Brain size={20} />
              <div className="score-info">
                <h3>Logic</h3>
                <span className="score-text">{report.problem_solving_score}/10</span>
              </div>
              <div className="mini-progress">
                <div className="mini-fill" style={{ width: `${report.problem_solving_score * 10}%`, backgroundColor: '#22c55e' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Topic Performance */}
        {Object.keys(topicPerformance).length > 0 && (
          <div className="topic-performance-modern">
            <h2>Topic Analytics</h2>
            <div className="topic-grid">
              {Object.entries(topicPerformance).map(([topic, score]) => (
                <div key={topic} className="topic-card-compact">
                  <span className="topic-name">{topic}</span>
                  <span className="topic-score-badge" style={{ backgroundColor: score >= 8 ? '#dcfce7' : score >= 5 ? '#fef3c7' : '#fee2e2', color: score >= 8 ? '#166534' : score >= 5 ? '#92400e' : '#991b1b' }}>
                    {score}/10
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Strengths & Improvements */}
        <div className="feedback-sections-modern">
          <div className="feedback-card strengths">
            <div className="card-header">
              <TrendingUp size={18} />
              <h2>Key Strengths</h2>
            </div>
            <ul>
              {strengths.map((item, idx) => (
                <li key={idx}>
                  <CheckCircle size={14} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="feedback-card improvements">
            <div className="card-header">
              <TrendingDown size={18} />
              <h2>Growth Areas</h2>
            </div>
            <ul>
              {improvements.map((item, idx) => (
                <li key={idx}>
                  <AlertTriangle size={14} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Detailed Feedback - Styled as a document */}
        {(report.detailed_feedback || report.detailedFeedback) && (
          <div className="detailed-feedback-modern">
            <div className="feedback-doc-header">
              <MessageSquare size={20} />
              <h2>Comprehensive Analysis & Mentorship</h2>
            </div>
            <div className="feedback-content-pre">
              {formatFeedback(report.detailed_feedback || report.detailedFeedback)}
            </div>
          </div>
        )}

        {/* Monitoring Alerts Summary */}
        {alerts && alerts.summary && (
          <div className="monitoring-summary-modern">
            <div className="feedback-doc-header">
              <AlertTriangle size={20} />
              <h2>Interview Integrity Report</h2>
            </div>
            <div className="alerts-stats-grid">
              <div className="alert-stat-box">
                <span className="count">{alerts.summary.tab_switch || 0}</span>
                <span className="label">Tab Switches</span>
              </div>
              <div className="alert-stat-box">
                <span className="count">{alerts.summary.no_face || 0}</span>
                <span className="label">Face Hidden</span>
              </div>
              <div className="alert-stat-box">
                <span className="count">{alerts.summary.multiple_faces || 0}</span>
                <span className="label">Multiple People</span>
              </div>
            </div>
            {alerts.alerts && alerts.alerts.length > 0 ? (
              <p className="integrity-note warning">
                Total Security Alerts: <strong>{alerts.alerts.length}</strong>.
                Frequent integrity alerts may affect your final selection.
              </p>
            ) : (
              <p className="integrity-note success">
                Integrity Score: <strong>Excellent</strong>. No suspicious activities detected during the session.
              </p>
            )}
          </div>
        )}

        {/* Action buttons moved to top-right */}
      </div>
      <Footer />
    </>
  );
}
