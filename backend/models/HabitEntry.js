import mongoose, { Schema } from 'mongoose';

const habitEntrySchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    habit: {
      type: Schema.Types.ObjectId,
      ref: 'Habit',
      required: true,
      index: true,
    },
    localDate: {
      type: String,
      required: true,
      trim: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    completedCount: {
      type: Number,
      default: 1,
      min: 0,
    },
    note: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes specified in schema.md section 19
habitEntrySchema.index({ habit: 1, localDate: 1 }, { unique: true });
habitEntrySchema.index({ owner: 1, localDate: 1 });

export const HabitEntry = mongoose.models.HabitEntry || mongoose.model('HabitEntry', habitEntrySchema);
export default HabitEntry;

