import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';
import UploadSection from './UploadSection';
import ResultSection from './ResultSection';
import Navbar from '../shared/Navbar';
import Footer from '../Footer';
import { Loader, AlertCircle, ArrowDown } from 'lucide-react';
import './ResumeParser.css';

const ResumeParser = () => {
    const [analysisData, setAnalysisData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showArrow, setShowArrow] = useState(true);
    const resultsRef = useRef(null);

    useEffect(() => {
        if (loading && resultsRef.current) {
            resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [loading]);

    useEffect(() => {
        const handleScroll = () => {
            // Fade out the arrow after scrolling 200px down
            if (window.scrollY > 200) {
                setShowArrow(false);
            } else {
                setShowArrow(true);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleAnalysisComplete = (data) => {
        setAnalysisData(data);
        setLoading(false);
        setError(null);
    };

    const handleUploadStart = () => {
        setLoading(true);
        setError(null);
        setAnalysisData(null);
    };

    const handleError = (errorMessage) => {
        setError(errorMessage);
        setLoading(false);
    };

    const handleDelete = () => {
        setAnalysisData(null);
        setError(null);
    };

    return (
        <div className="resume-parser-page">
            <Navbar />

            <div className="parser-hero-section">
                <div className="parser-container">
                    <div className="parser-content-layout">
                        {/* Left Column: Intro & Upload Box */}
                        <div className="parser-intro">
                            <Header />
                        </div>

                        {/* Right Column: Visual Element */}
                        <div className="parser-visual">
                            <img
                                src="https://res.cloudinary.com/dtsuvx8dz/image/upload/v1716357077/o1imiun4wwcpia9uucgs.gif"
                                alt="AI Resume Analysis"
                                className="ai-gif"
                            />
                        </div>
                    </div>

                    {/* Centered Scroll Arrow below Header */}
                    <div className={`flex justify-center w-full mt-24 mb-16 transition-opacity duration-500 ${showArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                        <a href="#upload-section" className="flex flex-col items-center gap-4 text-blue-600 font-semibold hover:text-blue-800 transition-colors group cursor-pointer">
                            <span className="text-xl tracking-wide">Upload Resume</span>
                            <div className="w-16 h-16 rounded-full bg-blue-50/80 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm group-hover:bg-blue-100 group-hover:shadow-md transition-all">
                                <ArrowDown className="animate-bounce" size={32} />
                            </div>
                        </a>
                    </div>

                    {/* Highly Pushed Down Upload Section */}
                    <div id="upload-section" className="flex justify-center w-full min-h-[50vh] pt-32 pb-40">
                        <UploadSection
                            onUploadStart={handleUploadStart}
                            onAnalysisComplete={handleAnalysisComplete}
                            onError={handleError}
                            loading={loading}
                        />
                    </div>

                    {/* Results Section below */}
                    <div className="parser-results-area" ref={resultsRef}>
                        {error && (
                            <div className="error-banner">
                                <AlertCircle size={20} />
                                <p>{error}</p>
                            </div>
                        )}

                        {loading && (
                            <div className="processing-loader">
                                <Loader className="spin" size={40} />
                                <p className="mt-4 font-semibold">AI is analyzing your resume structure...</p>
                                <p className="text-gray-500 text-sm">Parsing text, identifying skills, and calculating ATS score</p>
                            </div>
                        )}

                        {analysisData && (
                            <ResultSection data={analysisData} onDelete={handleDelete} />
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ResumeParser;
