import mongoose from 'mongoose';

const InterviewReportSchema = new mongoose.Schema({
  session_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InterviewSession',
    required: true,
    unique: true
  },
  user_id: {
    type: String,
    default: '00000000-0000-0000-0000-000000000001'
  },
  technical_score: {
    type: Number,
    min: 0,
    max: 10,
    required: true
  },
  communication_score: {
    type: Number,
    min: 0,
    max: 10,
    required: true
  },
  problem_solving_score: {
    type: Number,
    min: 0,
    max: 10,
    required: true
  },
  overall_score: {
    type: Number,
    required: false
  },
  strengths: {
    type: [String],
    default: []
  },
  improvements: {
    type: [String],
    default: []
  },
  topic_performance: {
    type: Map,
    of: Number,
    default: {}
  },
  verdict: {
    type: String,
    enum: ['excellent', 'selected', 'needs_improvement', 'rejected', 'pending'],
    default: 'pending'
  },
  detailed_feedback: {
    type: String
  },
  pdf_url: {
    type: String
  },
  generated_at: {
    type: Date,
    default: Date.now
  }
});

InterviewReportSchema.pre('validate', function(next) {
  if (this.technical_score !== undefined && this.communication_score !== undefined && this.problem_solving_score !== undefined) {
    this.overall_score = parseFloat(((this.technical_score + this.communication_score + this.problem_solving_score) / 3).toFixed(2));
  }
  next();
});

InterviewReportSchema.pre('save', function(next) {
  next();
});

InterviewReportSchema.virtual('id').get(function() {
  return this._id.toHexString();
});
InterviewReportSchema.set('toJSON', { virtuals: true });
InterviewReportSchema.set('toObject', { virtuals: true });

InterviewReportSchema.statics.findBySessionId = async function(sessionId) {
  return this.findOne({ session_id: sessionId });
};

InterviewReportSchema.statics.findByUserId = async function(userId) {
  return this.find({ user_id: userId }).sort({ generated_at: -1 }).populate('session_id');
};

InterviewReportSchema.statics.updatePdfUrl = async function(id, pdfUrl) {
  return this.findByIdAndUpdate(id, { pdf_url: pdfUrl }, { new: true });
};

export default mongoose.model('InterviewReport', InterviewReportSchema);
