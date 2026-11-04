import mongoose, { Schema } from 'mongoose';

const checklistItemSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    position: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

const taskSchema = new Schema(
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
    status: {
      type: String,
      enum: ['inbox', 'todo', 'in_progress', 'waiting', 'completed', 'cancelled'],
      default: 'inbox',
      index: true,
    },
    priority: {
      type: String,
      enum: ['none', 'low', 'medium', 'high', 'urgent'],
      default: 'none',
      index: true,
    },
    startAt: {
      type: Date,
      default: null,
    },
    dueAt: {
      type: Date,
      default: null,
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true,
    },
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Tag',
      },
    ],
    projectName: {
      type: String,
      default: null,
      trim: true,
    },
    parentTask: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
      index: true,
    },
    assignedTo: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    checklist: [checklistItemSchema],
    estimatedMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    actualMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    color: {
      type: String,
      default: null,
      trim: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
    source: {
      type: String,
      enum: ['manual', 'recurring', 'import', 'integration'],
      default: 'manual',
    },
    clientUpdatedAt: {
      type: Date,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
    customFields: {
      type: Map,
      of: Schema.Types.Mixed,
      default: () => new Map(),
    },
    version: {
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

// Indexes specified in schema.md section 19
taskSchema.index({ owner: 1, status: 1, dueAt: 1 });
taskSchema.index({ owner: 1, priority: 1, dueAt: 1 });
taskSchema.index({ owner: 1, isArchived: 1, updatedAt: -1 });

export const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);
export default Task;

