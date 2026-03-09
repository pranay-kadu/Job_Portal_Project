import React, { useEffect, useRef } from 'react';

const ResultSection = ({ data, onDelete }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!data) return;

    const outputEl = document.getElementById('output');
    if (!outputEl) return;

    const html = parseStructuredOutput(data);
    typeWriterLineByLine(html, outputEl, 100);

    setTimeout(() => {
      containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  }, [data]);

  function extractSection(text, sectionName, nextSectionName) {
    const patterns = [
      new RegExp('\\*\\*' + sectionName + ':\\*\\*\\s*\\n([\\s\\S]*?)(?=\\*\\*' + nextSectionName + ':|$)', 'i'),
      new RegExp(sectionName + ':\\s*\\n([\\s\\S]*?)(?=' + nextSectionName + ':|$)', 'i'),
      new RegExp('##\\s*' + sectionName + '\\s*\\n([\\s\\S]*?)(?=##\\s*' + nextSectionName + '|$)', 'i'),
    ];
    for (let i = 0; i < patterns.length; i++) {
      const m = text.match(patterns[i]);
      if (m) return m[1].trim();
    }
    return null;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function parseStructuredOutput(text) {
    let html = '';

    const score = extractSection(text, 'ATS Score', 'ATS Score Feedback') || extractSection(text, 'ATS Score', 'Education');
    if (score) {
      html += `<h2 class="text-blue-600 font-bold text-xl mt-6 mb-2">ATS Score:</h2><p class="text-gray-800 font-semibold text-lg mb-4 bg-blue-50 px-4 py-2 rounded-lg inline-block border border-blue-100">${escapeHtml(score)}</p>`;
    }

    const feedback = extractSection(text, 'ATS Score Feedback', 'Education');
    if (feedback) {
      html += '<h2 class="text-blue-600 font-semibold text-xl mt-6 mb-2">ATS Score Feedback:</h2>';
      const lines = feedback.split('\n').filter((l) => l.trim());
      html += '<ul class="list-disc list-inside text-gray-700 mb-6 space-y-2 border-l-4 border-blue-200 pl-4">';
      lines.forEach((line) => {
        const clean = line.replace(/^[-•*]\s*/, '').trim();
        if (clean) html += `<li>${escapeHtml(clean)}</li>`;
      });
      html += '</ul>';
    }

    const skillsRaw = extractSection(text, 'Skills', 'Experience');
    if (skillsRaw) {
      const skillLines = skillsRaw.split('\n').filter((l) => l.trim());
      const skillItems = [];
      skillLines.forEach((line) => {
        const clean = line.replace(/^[-•*]\s*/, '').trim();
        if (clean) {
          const parts = clean.split(/[,;|]/).map((s) => s.trim()).filter(Boolean);
          skillItems.push(...parts);
        }
      });
      const uniq = [...new Set(skillItems)];
      html += '<h2 class="text-blue-600 font-semibold text-xl mt-6 mb-2">Skills Found:</h2>';
      html += '<div class="flex flex-wrap gap-2 mb-6">';
      uniq.forEach((s) => {
        html += '<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 border border-blue-200">' + escapeHtml(s) + '</span>';
      });
      html += '</div>';
    }

    const experience = extractSection(text, 'Experience', 'Mistakes');
    if (experience) {
      html += '<h2 class="text-blue-600 font-semibold text-xl mt-6 mb-2">Experience:</h2>';
      const lines = experience.split('\n').filter((l) => l.trim());
      html += '<div class="text-gray-700 mb-6 space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">';
      lines.forEach((line) => {
        const clean = line.replace(/^[-•*]\s*/, '').trim();
        if (clean) html += `<p class="flex items-start gap-2"><span class="text-blue-400 mt-1.5">•</span>${escapeHtml(clean)}</p>`;
      });
      html += '</div>';
    }

    const mistakes = extractSection(text, 'Mistakes', 'Recommendations');
    if (mistakes) {
      html += '<h2 class="text-red-600 font-semibold text-xl mt-6 mb-2">Mistakes to Fix:</h2>';
      const lines = mistakes.split('\n').filter((l) => l.trim());
      html += '<ul class="list-disc list-inside text-gray-700 mb-6 space-y-2 bg-red-50 p-4 rounded-xl border border-red-100">';
      lines.forEach((line) => {
        const clean = line.replace(/^[-•*]\s*/, '').trim();
        if (clean) html += `<li class="text-red-700">${escapeHtml(clean)}</li>`;
      });
      html += '</ul>';
    }

    const recMatch = text.match(/\*\*Recommendations:\*\*\s*\n([\s\S]*?)$/i) || text.match(/Recommendations:\s*\n([\s\S]*?)$/i);
    const recommendations = recMatch ? recMatch[1].trim() : null;
    if (recommendations) {
      html += '<h2 class="text-green-600 font-semibold text-xl mt-6 mb-2">Recommendations:</h2>';
      const lines = recommendations.split('\n').filter((l) => l.trim());
      html += '<ul class="list-disc list-inside text-gray-700 mb-6 space-y-2 bg-green-50 p-4 rounded-xl border border-green-100">';
      lines.forEach((line) => {
        const clean = line.replace(/^[-•*]\s*/, '').trim();
        if (clean) html += `<li class="text-green-700">${escapeHtml(clean)}</li>`;
      });
      html += '</ul>';
    }

    if (!html) {
      html = `<div class="text-gray-800 whitespace-pre-wrap bg-white p-6 rounded-xl border border-gray-200 shadow-sm">${escapeHtml(text)}</div>`;
    }

    return html;
  }

  function typeWriterLineByLine(htmlContent, element, speed = 100) {
    if (!element) return;

    const parts = [];
    let currentPart = '';
    let inTag = false;
    let tagBuffer = '';

    for (let i = 0; i < htmlContent.length; i++) {
      const c = htmlContent[i];
      if (c === '<') {
        if (currentPart.trim()) {
          parts.push(currentPart);
          currentPart = '';
        }
        inTag = true;
        tagBuffer = c;
      } else if (c === '>') {
        tagBuffer += c;
        parts.push(tagBuffer);
        tagBuffer = '';
        inTag = false;
      } else if (inTag) {
        tagBuffer += c;
      } else {
        currentPart += c;
      }
    }
    if (currentPart.trim()) parts.push(currentPart);

    const lines = [];
    let currentLine = '';
    for (let j = 0; j < parts.length; j++) {
      currentLine += parts[j];
      if (parts[j].match(/<\/(p|li|h2|div|ul|h1|h3|h4|h5|h6)>/i)) {
        lines.push(currentLine);
        currentLine = '';
      }
    }
    if (currentLine.trim()) lines.push(currentLine);

    let idx = 0;
    let displayed = '';

    function showNext() {
      if (idx >= lines.length) {
        element.innerHTML = htmlContent;
        return;
      }
      displayed += lines[idx];
      element.innerHTML = displayed;
      idx++;
      setTimeout(showNext, speed);
    }
    showNext();
  }

  const handleCopy = () => {
    const el = containerRef.current;
    if (!el) return;
    const text = el.innerText;
    navigator.clipboard.writeText(text);
    const btn = document.getElementById('copyBtn');
    if (btn) {
      const orig = btn.innerHTML;
      btn.innerHTML = 'Copied!';
      setTimeout(() => { btn.innerHTML = orig; }, 1500);
    }
  };

  return (
    <div
      ref={containerRef}
      className="result-card-light"
    >
      <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
        <h2 className="text-indigo-900 font-bold text-lg">ATS Resume Analyzer Report</h2>
        <div className="flex gap-3">
          <button
            id="copyBtn"
            onClick={handleCopy}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1 rounded-md border border-blue-100 transition-colors"
          >
            Copy Report
          </button>
          <button
            id="deleteBtn"
            onClick={onDelete}
            className="text-sm font-semibold text-red-600 hover:text-red-700 bg-red-50 px-3 py-1 rounded-md border border-red-100 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      <div id="output" className="mt-4" />
    </div>
  );
};

export default ResultSection;
