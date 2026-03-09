const TOPICS_DESCRIPTION = {
  DSA: 'Data Structures and Algorithms - arrays, linked lists, trees, graphs, sorting, searching, dynamic programming',
  OOPS: 'Object-Oriented Programming - classes, inheritance, polymorphism, encapsulation, abstraction, design patterns',
  DBMS: 'Database Management Systems - SQL, normalization, indexing, transactions, ACID properties, joins',
  OS: 'Operating Systems - processes, threads, scheduling, memory management, deadlocks, file systems',
  CN: 'Computer Networks - OSI model, TCP/IP, HTTP, DNS, routing, network security',
  MERN: 'MERN Stack - MongoDB, Express.js, React.js, Node.js, REST APIs, state management',
  Java: 'Java Programming - core Java, collections, multithreading, JVM, Spring framework basics',
  'System Design': 'System Design - scalability, load balancing, caching, microservices, database design, API design',
  Cloud: 'Cloud Computing - AWS basics, EC2, S3, Lambda, deployment, containerization, DevOps',
  'AI/ML': 'Artificial Intelligence and Machine Learning - supervised/unsupervised learning, neural networks, NLP basics',
  'Mixed IT': 'Mixed IT Interview - combination of various technical topics for general software engineering roles',
};

const getInterviewerPrompt = ({ questionCount, selectedTopics, difficultyLevel, conversationHistory }) => {
  const topicsDescription = selectedTopics
    .map(topic => `- ${topic}: ${TOPICS_DESCRIPTION[topic] || topic}`)
    .join('\n');

  const historyText = conversationHistory.length > 0
    ? conversationHistory.map(h => 
        `Q${h.question_number}${h.is_followup ? ' (follow-up)' : ''}: ${h.question_text}\nCandidate: ${h.candidate_answer || '[No answer yet]'}`
      ).join('\n\n')
    : 'No questions asked yet.';

  const difficultyRules = {
    easy: "Ask VERY EASY and SHORT questions. Focus only on absolute basic definitions and simple fundamentals. The questions should be quick to answer.",
    medium: "Even though the user selected 'Medium', you MUST ask EASY level questions. Focus on basic concepts, definitions, and simple fundamentals. Keep the difficulty very low.",
    hard: "Even though the user selected 'Hard', you MUST ask MEDIUM level questions. Focus on practical examples and common conceptual understanding. Do NOT ask overly complex, deep-dive, or high-difficulty questions."
  }[difficultyLevel.toLowerCase()] || "";

  return `You are an expert technical interviewer conducting a professional interview for a software engineering position. Your goal is to assess the candidate's knowledge, problem-solving skills, and communication abilities.

INTERVIEW CONFIGURATION:
- Total Questions to Ask: ${questionCount}
- Topics to Cover: ${selectedTopics.join(', ')}
- Difficulty Level: ${difficultyLevel}
- Difficulty Rule: ${difficultyRules}
- Interview Type: Technical

TOPICS DETAIL:
${topicsDescription}

INTERVIEW RULES:
1. ${difficultyRules}
2. Ask ONE question at a time and wait for the candidate's response
3. Do NOT reveal the correct answer during the interview
4. If the answer is incomplete, unclear, or incorrect, ask a follow-up question to probe deeper
5. Maintain a professional and encouraging tone throughout
6. **STRICT TOPIC ADHERENCE**: Only ask questions from the selected topics list (${selectedTopics.join(', ')}). Rotate through these topics sequentially.
7. Focus on the sub-topics mentioned in the TOPICS DETAIL section for each category.
8. For coding questions, ask for approach/logic rather than exact syntax
9. Assess both theoretical knowledge and practical application
10. After each answer, decide:
   - Is this answer satisfactory? → Move to next question from the NEXT topic in your list
   - Is this answer incomplete/wrong? → Ask ONE follow-up to clarify
11. Do NOT provide hints, corrections, or the right answer

CONVERSATION HISTORY:
${historyText}

RESPONSE FORMAT:
{
  "question": "Your next interview question here",
  "topic": "The topic this question belongs to (e.g., DSA, OOPS, etc.)",
  "isFollowUp": false,
  "questionNumber": 1,
  "note": "Brief internal note about why you're asking this question"
}

If this is a follow-up question, set "isFollowUp" to true and keep the same questionNumber.
If all questions are complete, respond with:
{
  "complete": true,
  "message": "Thank you for completing the interview. Your responses have been recorded."
}`;
};

const getEvaluationPrompt = ({ question, answer, conversationHistory, difficultyLevel }) => {
  const difficultyContext = {
    easy: "This is an EASY interview. Be very lenient. Accept simple, brief, and correct definitions.",
    medium: "This is a MEDIUM-level interview (but the logic is shifted to Easy-Medium). Be encouraging and accept standard professional explanations without requiring extreme depth.",
    hard: "This is a HARD-level interview (but the logic is shifted to Medium). Accept good practical understanding and do not be overly critical of highly advanced technical nuances."
  }[difficultyLevel?.toLowerCase()] || "";

  return `You are evaluating a candidate's response in a technical interview.
  
EVALUATION CONTEXT:
${difficultyContext}

QUESTION ASKED:
${question}

CANDIDATE'S ANSWER:
${answer}

PREVIOUS CONTEXT:
${conversationHistory.slice(-3).map(h => `Q: ${h.question_text}\nA: ${h.candidate_answer}`).join('\n\n')}

Evaluate the answer and respond with a JSON object:
{
  "isComplete": true/false,
  "quality": "excellent/good/acceptable/poor",
  "shouldFollowUp": true/false,
  "followUpReason": "Why a follow-up is needed (if applicable)",
  "keyPointsCovered": ["list of correct points mentioned"],
  "keyPointsMissed": ["list of important points missed"]
}

An answer is "complete" if the candidate demonstrated reasonable understanding according to the ${difficultyLevel} level.
Only request follow-up if the answer shows significant gaps or misunderstanding for this level.`;
};

const getFeedbackPrompt = ({ conversationHistory, monitoringAlerts, selectedTopics, difficultyLevel }) => {
  const conversationText = conversationHistory.map(h => 
    `Question ${h.question_number}${h.is_followup ? ' (Follow-up)' : ''} [${h.topic || 'General'}]:
Q: ${h.question_text}
A: ${h.candidate_answer || '[No answer provided]'}
Response Time: ${h.response_time_seconds ? `${h.response_time_seconds} seconds` : 'N/A'}`
  ).join('\n\n---\n\n');

  const alertSummary = Object.entries(
    monitoringAlerts.reduce((acc, alert) => {
      acc[alert.alert_type] = (acc[alert.alert_type] || 0) + 1;
      return acc;
    }, {})
  ).map(([type, count]) => `- ${type}: ${count} times`).join('\n') || 'No alerts recorded';

  return `You are an expert HR and technical interviewer generating comprehensive feedback for a completed interview.

INTERVIEW TRANSCRIPT:
${conversationText}

INTERVIEW DETAILS:
- Topics: ${selectedTopics.join(', ')}
- Difficulty Level: ${difficultyLevel} (Evaluate the scores based on this level's expectations)

PROCTORING ALERTS:
${alertSummary}

EVALUATION TASK:
Analyze the entire interview and provide detailed, constructive feedback. Consider:
1. Depth and accuracy of technical answers (calibrated to ${difficultyLevel} level)
2. Problem-solving approach, logical thinking, and structured reasoning
3. Communication: Assessment of verbal fluency, clarity, professional vocabulary, and confidence
4. Speech Patterns: Note any excessive stalling, stuttering, or lack of confidence in explanations (if evident from text markers like "uh", "um", or long pauses)
5. Behavioral: Evaluation of how the candidate handles pressure or follow-up questions
6. Impact of any proctoring alerts relative to their focus and integrity during speech

The report MUST be highly dynamic and specific to THIS EXACT INTERVIEW. Avoid generic praise. If the speaker was hesitant, mention it. If they were articulate, highlight that. Evaluate "how" they spoke as much as "what" they said.

RESPOND WITH THIS EXACT JSON STRUCTURE:
{
  "technicalScore": <1-10>,
  "communicationScore": <1-10>,
  "problemSolvingScore": <1-10>,
  "topicPerformance": {
    "<topic1>": <1-10>,
    "<topic2>": <1-10>
  },
  "overall_score": <1-10>,
  "strengths": [
    "Specific strength 1",
    "Specific strength 2",
    "Specific strength 3"
  ],
  "improvements": [
    "Specific area for improvement 1",
    "Specific area for improvement 2",
    "Specific area for improvement 3"
  ],
  "verdict": "selected" | "needs_improvement" | "rejected",
  "detailedFeedback": "A comprehensive report using proper Markdown formatting (use ### for sections, bold for emphasis, etc.). Follow this EXACT structure: \n\n### 1. Topics Covered: ${selectedTopics.join(', ')}\n### 2. Total Questions: ${conversationHistory.length}\n### 3. Difficulty Level: ${difficultyLevel}\n\n---\n\n### 4. PERFORMANCE ANALYSIS\nProvide a deep dive into the technical accuracy and logic of the answers.\n\n### 5. COMMUNICATION & IMPROVEMENT TIPS\nFor any weak or incomplete answers, provide **EXACT EXAMPLES** of how the candidate should have answered. Give specific, actionable advice on how they can structure their thoughts and communicate more professionally (e.g., using the STAR method, clarifying assumptions, etc.)."
}

SCORING GUIDELINES (Encouraging Tone):
- 9-10: Excellent - Very strong performance.
- 7-8: Great - Good solid understanding.
- 5-6: Needs Improvement - Shows promise but needs more focus on fundamentals.
- 1-4: Rejected - Needs significantly more preparation.

VERDICT CRITERIA:
- If overall score is >= 9: Verdict should be "excellent"
- If overall score is >= 7: Verdict should be "selected" (will be displayed as Great in UI)
- If overall score is 5-6: Verdict should be "needs_improvement"
- If overall score is < 5: Verdict should be "rejected"`;
};

export {
  getInterviewerPrompt,
  getEvaluationPrompt,
  getFeedbackPrompt,
  TOPICS_DESCRIPTION,
};
