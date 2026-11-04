import mongoose, { Schema } from 'mongoose';

const notificationSchema = new Schema(
  {
    user: {
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
    reminder: {
      type: Schema.Types.ObjectId,
      ref: 'Reminder',
      default: null,
      index: true,
    },
    type: {
      type: String,
      enum: ['reminder', 'task_assigned', 'task_due', 'task_completed', 'system'],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      default: '',
      trim: true,
    },
    data: {
      type: Schema.Types.Mixed,
      default: () => ({}),
    },
    channels: [
      {
        type: String,
        enum: ['in_app', 'push', 'email'],
      },
    ],
    readAt: {
      type: Date,
      default: null,
      index: true,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    deliveryStatus: {
      type: String,
      enum: ['pending', 'sent', 'partially_sent', 'failed'],
      default: 'pending',
      index: true,
    },
    dedupeKey: {
      type: String,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes specified in schema.md section 19
notificationSchema.index({ user: 1, readAt: 1, createdAt: -1 });

export const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
export default Notification;

