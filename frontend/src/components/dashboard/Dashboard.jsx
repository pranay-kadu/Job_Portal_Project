import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportAPI } from '../../services/api';
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Award,
  TrendingUp,
  Plus,
  Loader,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import Navbar from '../shared/Navbar';
import Footer from '../Footer';

export default function Dashboard() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const response = await reportAPI.getDashboard();
      setReports(response.data.reports || []);
    } catch (err) {
      setError('Failed to load interview history');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getVerdictIcon = (verdict) => {
    switch (verdict) {
      case 'selected':
        return <CheckCircle size={18} className="verdict-icon selected" />;
      case 'needs_improvement':
        return <AlertTriangle size={18} className="verdict-icon warning" />;
      case 'rejected':
        return <XCircle size={18} className="verdict-icon rejected" />;
      default:
        return <Award size={18} className="verdict-icon" />;
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStats = () => {
    const total = reports.length;
    const selected = reports.filter(r => r.verdict === 'selected').length;
    const avgScore = total > 0
      ? (reports.reduce((sum, r) => sum + parseFloat(r.overallScore || 0), 0) / total).toFixed(1)
      : 0;
    return { total, selected, avgScore };
  };

  const stats = getStats();

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="dashboard-loading">
          <Loader className="spin" size={48} />
          <p>Loading your interview history...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="dashboard">
        <div className="dashboard-header">
          <h1><LayoutDashboard size={32} /> Dashboard</h1>
          <Link to="/setup" className="new-interview-btn">
            <Plus size={18} /> New Interview
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <FileText size={24} />
            <div className="stat-content">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total Interviews</span>
            </div>
          </div>
          <div className="stat-card">
            <CheckCircle size={24} />
            <div className="stat-content">
              <span className="stat-value">{stats.selected}</span>
              <span className="stat-label">Passed</span>
            </div>
          </div>
          <div className="stat-card">
            <TrendingUp size={24} />
            <div className="stat-content">
              <span className="stat-value">{stats.avgScore}</span>
              <span className="stat-label">Avg. Score</span>
            </div>
          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {/* Reports List */}
        <div className="reports-section">
          <h2>Interview History</h2>

          {reports.length === 0 ? (
            <div className="empty-state">
              <FileText size={64} />
              <h3>No interviews yet</h3>
              <p>Start your first AI interview to see your results here.</p>
            </div>
          ) : (
            <div className="reports-list">
              {reports.map((report) => (
                <Link
                  key={report.id}
                  to={`/report/${report.sessionId}`}
                  className="report-card"
                >
                  <div className="report-main">
                    <div className="report-verdict">
                      {getVerdictIcon(report.verdict)}
                      <span className={`verdict-text ${report.verdict}`}>
                        {report.verdict?.replace('_', ' ').toUpperCase() || 'PENDING'}
                      </span>
                    </div>
                    <div className="report-score">
                      <span className="score">{report.overallScore || '-'}</span>
                      <span className="max">/10</span>
                    </div>
                  </div>
                  <div className="report-meta">
                    <span className="date">
                      <Calendar size={14} />
                      {formatDate(report.generatedAt || report.startedAt)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
