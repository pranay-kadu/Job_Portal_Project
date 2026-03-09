import mongoose from 'mongoose';

const ConversationHistorySchema = new mongoose.Schema({
  session_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InterviewSession',
    required: true
  },
  question_number: {
    type: Number,
    required: true
  },
  question_text: {
    type: String,
    required: true
  },
  candidate_answer: {
    type: String
  },
  ai_response: {
    type: String
  },
  topic: {
    type: String,
    required: true
  },
  is_followup: {
    type: Boolean,
    default: false
  },
  response_time_seconds: {
    type: Number
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

ConversationHistorySchema.virtual('id').get(function() {
  return this._id.toHexString();
});
ConversationHistorySchema.set('toJSON', { virtuals: true });
ConversationHistorySchema.set('toObject', { virtuals: true });

ConversationHistorySchema.statics.updateAnswer = async function(id, data) {
  const update = {
    candidate_answer: data.candidateAnswer,
    ai_response: data.aiResponse,
    response_time_seconds: data.responseTimeSeconds
  };
  return this.findByIdAndUpdate(id, update, { new: true });
};

ConversationHistorySchema.statics.findBySessionId = async function(sessionId) {
  return this.find({ session_id: sessionId }).sort({ question_number: 1, created_at: 1 });
};

ConversationHistorySchema.statics.findLastQuestion = async function(sessionId) {
  return this.findOne({ session_id: sessionId }).sort({ created_at: -1 });
};

ConversationHistorySchema.statics.getQuestionCount = async function(sessionId) {
  return this.countDocuments({ session_id: sessionId, is_followup: false });
};

export default mongoose.model('ConversationHistory', ConversationHistorySchema);
