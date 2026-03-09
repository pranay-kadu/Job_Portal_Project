import mongoose from 'mongoose';

const InterviewConfigSchema = new mongoose.Schema({
  user_id: {
    type: String,
    default: '00000000-0000-0000-0000-000000000001'
  },
  question_count: {
    type: Number,
    required: true,
    default: 5
  },
  selected_topics: {
    type: [String],
    required: true,
    default: []
  },
  difficulty_level: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  interview_type: {
    type: String,
    default: 'technical'
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed'],
    default: 'pending'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// For compatibility with existing code
InterviewConfigSchema.virtual('id').get(function() {
  return this._id.toHexString();
});
InterviewConfigSchema.set('toJSON', { virtuals: true });
InterviewConfigSchema.set('toObject', { virtuals: true });

// Helper methods to match original static implementation
InterviewConfigSchema.statics.updateStatus = async function(id, status) {
  return this.findByIdAndUpdate(id, { status }, { new: true });
};

export default mongoose.model('InterviewConfig', InterviewConfigSchema);
