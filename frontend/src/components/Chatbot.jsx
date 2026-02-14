import React, { useState, useEffect } from "react";
import { MessageCircle, X, Bot, Send } from "lucide-react";
import { useSelector } from "react-redux";

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState([]);
  const [step, setStep] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);

  const { user } = useSelector((store) => store.auth);

  const qaSteps = [
    [
      {
        q: "What is Smart Placement Portal System?",
        a: "It is an AI-based platform that automates resume parsing, skill matching, and interview preparation.",
      },
      {
        q: "How does AI help in placements?",
        a: "AI analyzes resumes, matches skills with job descriptions, and provides personalized interview preparation.",
      },
      {
        q: "What is Resume Parsing?",
        a: "Resume parsing extracts key details such as skills, education, and experience from resumes automatically.",
      },
    ],
    [
      {
        q: "What is Interview Preparation Bot?",
        a: "It is an AI chatbot that helps students practice interview questions and receive instant feedback.",
      },
      {
        q: "Who can use this portal?",
        a: "Students, colleges, and recruiters can use this portal for seamless placement activities.",
      },
      {
        q: "How does skill matching work?",
        a: "The system compares job descriptions with candidate resumes to find the best skill fit.",
      },
    ],
    [
      {
        q: "What are the benefits for students?",
        a: "Students get automated resume screening, interview practice, and better job matching.",
      },
      {
        q: "What are the benefits for recruiters?",
        a: "Recruiters save time with automated candidate shortlisting and improved talent matching.",
      },
      {
        q: "Is this scalable for multiple colleges?",
        a: "Yes, the system can be deployed across multiple colleges with centralized recruiter access.",
      },
    ],
  ];

  const handleSelect = (item) => {
    setChat((prev) => [
      ...prev,
      { type: "q", text: item.q },
      { type: "a", text: item.a },
    ]);

    if (step < qaSteps.length - 1) setStep(step + 1);
    else setStep(-1);
  };

  // Function to send user input to backend OpenAI API
  const sendToOpenAI = async () => {
    if (!userInput.trim()) return;

    setChat((prev) => [...prev, { type: "q", text: userInput }]);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/api/v1/openai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userInput }),
      });

      const data = await res.json();

      setChat((prev) => [
        ...prev,
        { type: "a", text: data.reply || "No response from AI." },
      ]);
    } catch (err) {
      console.error(err);
      setChat((prev) => [
        ...prev,
        { type: "a", text: "API error. Please try again." },
      ]);
    }

    setUserInput("");
    setLoading(false);
  };

  // Reset chatbot when user logs out
  useEffect(() => {
    if (!user) {
      setOpen(false);
      setChat([]);
      setStep(0);
    }
  }, [user]);

  return (
    <div>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-all"
      >
        {open ? <X size={26} /> : <MessageCircle size={28} />}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 w-80 max-h-[32rem] bg-gray-600 rounded-2xl shadow-xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-blue-800 text-white px-4 py-3 flex items-center space-x-2">
            <div className="w-8 h-8 bg-white text-blue-800 rounded-full flex items-center justify-center">
              <Bot size={18} />
            </div>
            <div>
              <p className="font-semibold">PlacementBot</p>
              <p className="text-xs text-green-200">● Online Now</p>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 text-sm">
            {chat.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start space-x-2 ${
                  msg.type === "q" ? "justify-end space-x-reverse" : ""
                }`}
              >
                {msg.type === "a" && (
                  <div className="w-7 h-7 rounded-full bg-blue-800 text-white flex items-center justify-center mt-1">
                    <Bot size={14} />
                  </div>
                )}
                <div
                  className={`px-4 py-2 rounded-2xl max-w-[70%] shadow-sm ${
                    msg.type === "q"
                      ? "bg-green-500 text-white rounded-br-none"
                      : "bg-white text-gray-800 border rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* QA Buttons */}
            {step >= 0 && qaSteps[step] && (
              <div className="flex flex-wrap gap-2 mt-2">
                {qaSteps[step].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(item)}
                    className="px-3 py-2 rounded-full border border-blue-400 bg-white text-blue-800 text-xs"
                  >
                    {item.q}
                  </button>
                ))}
              </div>
            )}

            {step === -1 && (
              <p className="text-center text-gray-500 text-xs">
                That’s all I have for now. Type below to ask more!
              </p>
            )}
          </div>

          {/* User Input Box */}
          <div className="p-2 bg-white flex items-center border-t">
            <input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 px-3 py-2 border rounded-full outline-none text-sm"
              onKeyDown={(e) => e.key === "Enter" && sendToOpenAI()}
            />
            <button
              onClick={sendToOpenAI}
              disabled={loading}
              className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-full"
            >
              {loading ? "..." : <Send size={16} />}
            </button>
          </div>

          <div className="text-xs text-gray-500 text-center py-2 bg-gray-100 border-t">
            Powered by{" "}
            <span className="font-semibold text-blue-800">AI Placement Portal</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
