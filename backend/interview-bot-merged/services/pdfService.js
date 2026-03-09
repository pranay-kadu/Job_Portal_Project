import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import puppeteer from 'puppeteer';

import fs from 'fs';
import InterviewReport from '../models/InterviewReport.js';

const pdfService = {
  /**
   * Generate PDF report
   */
  async generatePDF(sessionId, reportData) {
    const htmlContent = generateReportHTML(reportData);
    
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      // Ensure reports directory exists
      const reportsDir = path.join(__dirname, '..', 'reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }
      
      const pdfPath = path.join(reportsDir, `report_${sessionId}.pdf`);
      
      await page.pdf({
        path: pdfPath,
        format: 'A4',
        margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
        printBackground: true,
      });
      
      // Update report with PDF URL
      await InterviewReport.updatePdfUrl(reportData.id, `/reports/report_${sessionId}.pdf`);
      
      return pdfPath;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  },
};

function generateReportHTML(report) {
  const strengths = Array.isArray(report.strengths) ? report.strengths : JSON.parse(report.strengths || '[]');
  const improvements = Array.isArray(report.improvements) ? report.improvements : JSON.parse(report.improvements || '[]');
  const topicPerformance = typeof report.topicPerformance === 'object' ? report.topicPerformance : JSON.parse(report.topic_performance || '{}');

  const overallScore = report.overall_score || ((report.technical_score + report.communication_score + report.problem_solving_score) / 3).toFixed(1);
  
  const isExcellent = overallScore >= 9;
  const currentVerdict = isExcellent ? 'excellent' : report.verdict;

  const verdictColor = {
    excellent: '#8b5cf6',
    selected: '#22c55e',
    needs_improvement: '#f59e0b',
    rejected: '#ef4444',
  }[currentVerdict] || '#6b7280';

  const verdictText = {
    excellent: 'EXCELLENT',
    selected: 'GREAT',
    needs_improvement: 'NEEDS IMPROVEMENT',
    rejected: 'NOT SELECTED',
  }[currentVerdict] || currentVerdict?.toUpperCase();

  const formattedFeedback = (report.detailed_feedback || report.detailedFeedback || 'No detailed feedback available.')
    .replace(/^### (.*$)/gm, '<h3 style="color: #1e40af; margin-top: 15px; margin-bottom: 8px; font-size: 16px;">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^---$/gm, '<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 15px 0;">')
    .replace(/\n/g, '<br>');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Interview Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; padding: 40px; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #3b82f6; padding-bottom: 20px; }
    .header h1 { color: #1e40af; font-size: 28px; }
    .header p { color: #6b7280; margin-top: 5px; }
    .verdict { text-align: center; margin: 20px 0; padding: 15px; background: ${verdictColor}15; border-radius: 8px; }
    .verdict span { font-size: 24px; font-weight: bold; color: ${verdictColor}; }
    .scores { display: flex; justify-content: space-around; margin: 30px 0; }
    .score-card { text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px; width: 28%; }
    .score-card h3 { font-size: 14px; color: #64748b; margin-bottom: 10px; }
    .score-card .score { font-size: 36px; font-weight: bold; color: #3b82f6; }
    .score-card .score span { font-size: 18px; color: #94a3b8; }
    .overall { text-align: center; margin: 20px 0; }
    .overall .score { font-size: 48px; font-weight: bold; color: #1e40af; }
    .section { margin: 25px 0; }
    .section h2 { font-size: 18px; color: #1e40af; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 15px; }
    .list { list-style: none; }
    .list li { padding: 8px 0; padding-left: 20px; position: relative; }
    .list li::before { content: ''; position: absolute; left: 0; top: 14px; width: 8px; height: 8px; border-radius: 50%; }
    .strengths li::before { background: #22c55e; }
    .improvements li::before { background: #f59e0b; }
    .topics { display: flex; flex-wrap: wrap; gap: 10px; }
    .topic { padding: 8px 15px; background: #eff6ff; border-radius: 20px; font-size: 14px; }
    .topic span { font-weight: bold; color: #3b82f6; }
    .feedback { background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; font-size: 14px; }
    .footer { margin-top: 40px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Interview Performance Report</h1>
    <p>Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>

  <div class="verdict">
    <span>${verdictText}</span>
  </div>

  <div class="overall">
    <p style="color: #64748b; margin-bottom: 5px;">Overall Score</p>
    <div class="score">${overallScore}<span>/10</span></div>
  </div>

  <div class="scores">
    <div class="score-card">
      <h3>Technical Knowledge</h3>
      <div class="score">${report.technical_score}<span>/10</span></div>
    </div>
    <div class="score-card">
      <h3>Communication</h3>
      <div class="score">${report.communication_score}<span>/10</span></div>
    </div>
    <div class="score-card">
      <h3>Problem Solving</h3>
      <div class="score">${report.problem_solving_score}<span>/10</span></div>
    </div>
  </div>

  <div class="section">
    <h2>Topic Performance</h2>
    <div class="topics">
      ${Object.entries(topicPerformance).map(([topic, score]) => `
        <div class="topic">${topic}: <span>${score}/10</span></div>
      `).join('')}
    </div>
  </div>

  <div class="section">
    <h2>Strengths</h2>
    <ul class="list strengths">
      ${strengths.map(s => `<li>${s}</li>`).join('')}
    </ul>
  </div>

  <div class="section">
    <h2>Areas for Improvement</h2>
    <ul class="list improvements">
      ${improvements.map(i => `<li>${i}</li>`).join('')}
    </ul>
  </div>

  <div class="section">
    <h2>Detailed Feedback</h2>
    <div class="feedback">
      ${formattedFeedback}
    </div>
  </div>

  <div class="footer">
    <p>AI Interview Bot - Automated Interview Assessment System</p>
    <p>This report was generated automatically based on your interview performance.</p>
  </div>
</body>
</html>
  `;
}

export default pdfService;
