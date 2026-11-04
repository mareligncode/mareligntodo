import mongoose, { Schema } from 'mongoose';

const deviceSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    deviceId: {
      type: String,
      required: true,
      trim: true,
    },
    platform: {
      type: String,
      enum: ['ios', 'android'],
      required: true,
    },
    appVersion: {
      type: String,
      default: null,
      trim: true,
    },
    pushToken: {
      type: String,
      default: null,
      trim: true,
    },
    pushProvider: {
      type: String,
      enum: ['fcm', 'apns', 'expo', 'none'],
      default: 'none',
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
    revokedAt: {
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

// Indexes specified in schema.md section 19
deviceSchema.index({ user: 1, deviceId: 1 }, { unique: true });

export const Device = mongoose.models.Device || mongoose.model('Device', deviceSchema);
export default Device;

