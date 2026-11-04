import mongoose, { Schema } from 'mongoose';

const activityLogSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    actor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
      index: true,
    },
    entityType: {
      type: String,
      enum: ['task', 'reminder', 'category', 'goal', 'habit', 'user'],
      required: true,
      index: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    changes: {
      type: Schema.Types.Mixed,
      default: () => ({}),
    },
    source: {
      type: String,
      enum: ['mobile', 'api', 'system', 'sync'],
      default: 'api',
    },
    occurredAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

activityLogSchema.index({ owner: 1, occurredAt: -1 });
activityLogSchema.index({ task: 1, occurredAt: -1 });

export const ActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;

