import mongoose, { Schema } from 'mongoose';

const goalSchema = new Schema(
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
    targetValue: {
      type: Number,
      required: true,
      default: 0,
    },
    currentValue: {
      type: Number,
      default: 0,
    },
    unit: {
      type: String,
      default: '',
      trim: true,
    },
    startAt: {
      type: Date,
      default: null,
    },
    targetAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'paused', 'cancelled'],
      default: 'active',
      index: true,
    },
    color: {
      type: String,
      default: '#3B82F6',
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

goalSchema.index({ owner: 1, status: 1 });

export const Goal = mongoose.models.Goal || mongoose.model('Goal', goalSchema);
export default Goal;

