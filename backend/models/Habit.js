import mongoose, { Schema } from 'mongoose';

const habitScheduleSchema = new Schema(
  {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'daily',
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
        max: 6,
      },
    ],
    targetCount: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { _id: false }
);

const habitSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    schedule: {
      type: habitScheduleSchema,
      default: () => ({ frequency: 'daily', interval: 1, daysOfWeek: [], targetCount: 1 }),
    },
    reminderTime: {
      type: String,
      default: null,
      trim: true,
    },
    timezone: {
      type: String,
      default: 'UTC',
      trim: true,
    },
    color: {
      type: String,
      default: '#10B981',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

habitSchema.index({ owner: 1, isActive: 1 });

export const Habit = mongoose.models.Habit || mongoose.model('Habit', habitSchema);
export default Habit;

