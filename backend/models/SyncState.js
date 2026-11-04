import mongoose, { Schema } from 'mongoose';

const syncStateSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    lastPulledAt: {
      type: Date,
      default: null,
    },
    lastAcknowledgedAt: {
      type: Date,
      default: null,
    },
    serverCursor: {
      type: String,
      default: null,
      trim: true,
    },
    schemaVersion: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const SyncState = mongoose.models.SyncState || mongoose.model('SyncState', syncStateSchema);
export default SyncState;

