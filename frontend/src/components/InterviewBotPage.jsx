import React from "react";
import Navbar from "./shared/Navbar";
import Footer from "./Footer";

const InterviewBotPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-[#0f4c81] mb-6 text-center">
          AI Based Smart Placement Portal System
        </h1>
        <div className="w-full flex-1 flex flex-col bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden min-h-[75vh]">
          {/* Iframe pointing to the interview-bot dev server (usually runs on 5174 when main app is on 5173) */}
          <iframe 
            src="http://localhost:5174" 
            title="Interview Bot"
            className="w-full flex-1 border-0 min-h-[75vh]"
            allow="microphone; camera"
          />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default InterviewBotPage;
