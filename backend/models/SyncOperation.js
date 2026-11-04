import mongoose, { Schema } from 'mongoose';

const syncOperationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    device: {
      type: Schema.Types.ObjectId,
      ref: 'Device',
      default: null,
      index: true,
    },
    clientOperationId: {
      type: String,
      required: true,
      trim: true,
    },
    entityType: {
      type: String,
      enum: ['task', 'category', 'tag', 'reminder', 'goal', 'habit', 'habit_entry', 'settings'],
      required: true,
      index: true,
    },
    entityId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    operation: {
      type: String,
      enum: ['create', 'update', 'delete'],
      required: true,
    },
    baseVersion: {
      type: Number,
      default: 0,
    },
    payload: {
      type: Schema.Types.Mixed,
      default: () => ({}),
    },
    status: {
      type: String,
      enum: ['accepted', 'applied', 'conflict', 'rejected'],
      default: 'accepted',
      index: true,
    },
    serverVersion: {
      type: Number,
      default: null,
    },
    conflictData: {
      type: Schema.Types.Mixed,
      default: null,
    },
    processedAt: {
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
syncOperationSchema.index({ user: 1, clientOperationId: 1 }, { unique: true });
syncOperationSchema.index({ user: 1, status: 1, createdAt: 1 });

export const SyncOperation = mongoose.models.SyncOperation || mongoose.model('SyncOperation', syncOperationSchema);
export default SyncOperation;

