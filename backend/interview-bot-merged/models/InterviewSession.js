import mongoose from 'mongoose';

const InterviewSessionSchema = new mongoose.Schema({
  config_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InterviewConfig',
    required: true
  },
  user_id: {
    type: String,
    default: '00000000-0000-0000-0000-000000000001'
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'terminated'],
    default: 'in_progress'
  },
  total_questions_asked: {
    type: Number,
    default: 0
  },
  started_at: {
    type: Date,
    default: Date.now
  },
  ended_at: {
    type: Date
  },
  session_metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

InterviewSessionSchema.virtual('id').get(function() {
  return this._id.toHexString();
});
InterviewSessionSchema.set('toJSON', { virtuals: true });
InterviewSessionSchema.set('toObject', { virtuals: true });

InterviewSessionSchema.statics.updateStatus = async function(id, status) {
  const update = { status };
  if (['completed', 'terminated'].includes(status)) {
    update.ended_at = new Date();
  }
  return this.findByIdAndUpdate(id, update, { new: true });
};

InterviewSessionSchema.statics.incrementQuestionCount = async function(id) {
  return this.findByIdAndUpdate(id, { $inc: { total_questions_asked: 1 } }, { new: true });
};

InterviewSessionSchema.statics.findByIdWithConfig = async function(id) {
  const session = await this.findById(id).populate('config_id');
  if (!session) return null;
  const sessionObj = session.toObject();
  const config = sessionObj.config_id || {};
  return {
    ...sessionObj,
    question_count: config.question_count,
    selected_topics: config.selected_topics,
    difficulty_level: config.difficulty_level,
    interview_type: config.interview_type
  };
};

InterviewSessionSchema.statics.findByUserId = async function(userId) {
  return this.find({ user_id: userId }).sort({ started_at: -1 }).populate('config_id');
};

export default mongoose.model('InterviewSession', InterviewSessionSchema);
