import mongoose from 'mongoose';

const MonitoringAlertSchema = new mongoose.Schema({
  session_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InterviewSession',
    required: true
  },
  alert_type: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'critical'],
    default: 'warning'
  },
  description: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

MonitoringAlertSchema.virtual('id').get(function() {
  return this._id.toHexString();
});
MonitoringAlertSchema.set('toJSON', { virtuals: true });
MonitoringAlertSchema.set('toObject', { virtuals: true });

MonitoringAlertSchema.statics.findBySessionId = async function(sessionId) {
  return this.find({ session_id: sessionId }).sort({ timestamp: 1 });
};

MonitoringAlertSchema.statics.getAlertCounts = async function(sessionId) {
  const alerts = await this.find({ session_id: sessionId });
  return alerts.reduce((acc, alert) => {
    acc[alert.alert_type] = (acc[alert.alert_type] || 0) + 1;
    return acc;
  }, {});
};

export default mongoose.model('MonitoringAlert', MonitoringAlertSchema);
