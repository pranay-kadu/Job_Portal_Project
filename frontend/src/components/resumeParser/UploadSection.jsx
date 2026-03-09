import React, { useRef, useState } from 'react';
import { resumeAPI } from '../../services/api';
import { Upload, X, Sparkles, CheckCircle2 } from 'lucide-react';

const UploadSection = ({ onUploadStart, onAnalysisComplete, onError, loading }) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
      } else {
        onError('Only PDF files are allowed currently.');
        setSelectedFile(null);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
      } else {
        onError('Only PDF files are allowed currently.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      onError('Please select a PDF file first');
      return;
    }
    onUploadStart();
    const formData = new FormData();
    formData.append('pdf_doc', selectedFile);
    try {
      const response = await resumeAPI.process(formData);
      if (response.data.success) {
        onAnalysisComplete(response.data.data);
      } else {
        onError('Failed to process resume');
      }
    } catch (error) {
      console.error('Error processing resume:', error);
      onError(
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Error processing resume. Please ensure the AI service is correctly configured.'
      );
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="upload-card-v2">
      {/* Gradient accent bar */}
      <div className="upload-card-accent" />

      {/* Card Header */}
      <div className="card-header-v2">
        <div className="card-header-icon">
          <Upload size={20} />
        </div>
        <div>
          <h2>Upload Resume</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Drop Zone */}
        <div
          className={`drop-zone-v2 ${selectedFile ? 'has-file' : ''} ${isDragging ? 'is-dragging' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            name="pdf_doc"
            id="pdf_doc"
            accept=".pdf"
            className="hidden"
            onChange={handleFileChange}
            disabled={loading}
          />

          {selectedFile ? (
            /* File selected state */
            <div className="drop-zone-selected">
              <CheckCircle2 size={30} className="selected-check-icon" />
              <div className="selected-file-info">
                <span className="selected-file-name">{selectedFile.name}</span>
                <span className="selected-file-size">{formatFileSize(selectedFile.size)}</span>
              </div>
              <button
                type="button"
                className="remove-file-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  fileInputRef.current.value = '';
                }}
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            /* Empty state */
            <div className="drop-zone-empty">
              <div className={`upload-icon-wrap ${isDragging ? 'dragging' : ''}`}>
                <Upload size={26} />
              </div>
              <div className="drop-zone-text">
                <span className="drop-zone-title">Drop your resume here</span>
                <span className="drop-zone-hint">or <u>click to browse</u></span>
              </div>
              <div className="file-type-badges">
                {['PDF', 'DOC', 'DOCX'].map(t => (
                  <span key={t} className="file-badge">{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !selectedFile}
          className="start-parsing-btn-v2"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Analyzing Resume...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Sparkles size={18} />
              Start AI Parsing
            </span>
          )}
        </button>
      </form>
    </div>
  );
};

export default UploadSection;
