import mongoose, { Schema } from 'mongoose';

const recurrenceSchema = new Schema(
  {
    frequency: {
      type: String,
      enum: ['none', 'minutely', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'custom'],
      default: 'none',
    },
    interval: {
      type: Number,
      default: 1,
      min: 1,
    },
    daysOfWeek: [
      {
        type: Number,
        min: 0,
        max: 6, // 0 = Sunday, 6 = Saturday
      },
    ],
    dayOfMonth: {
      type: Number,
      min: 1,
      max: 31,
    },
    monthOfYear: {
      type: Number,
      min: 1,
      max: 12,
    },
    cron: {
      type: String,
      default: null,
      trim: true,
    },
    endAt: {
      type: Date,
      default: null,
    },
    maxOccurrences: {
      type: Number,
      default: null,
      min: 1,
    },
  },
  { _id: false }
);

const reminderSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: null,
      trim: true,
    },
    enabled: {
      type: Boolean,
      default: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'processing', 'completed', 'paused', 'failed', 'cancelled'],
      default: 'scheduled',
      index: true,
    },
    scheduleType: {
      type: String,
      enum: ['once', 'recurring'],
      default: 'once',
    },
    scheduledAt: {
      type: Date,
      default: null,
    },
    timezone: {
      type: String,
      default: 'UTC',
      trim: true,
    },
    recurrence: {
      type: recurrenceSchema,
      default: () => ({ frequency: 'none', interval: 1, daysOfWeek: [] }),
    },
    channels: [
      {
        type: String,
        enum: ['in_app', 'push', 'email'],
      },
    ],
    leadMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    nextTriggerAt: {
      type: Date,
      default: null,
      index: true,
    },
    lastTriggeredAt: {
      type: Date,
      default: null,
    },
    occurrenceCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    snoozeUntil: {
      type: Date,
      default: null,
    },
    failureCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastError: {
      type: String,
      default: null,
    },
    idempotencyKey: {
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
reminderSchema.index({ enabled: 1, status: 1, nextTriggerAt: 1 });
reminderSchema.index({ owner: 1, task: 1 });

export const Reminder = mongoose.models.Reminder || mongoose.model('Reminder', reminderSchema);
export default Reminder;

