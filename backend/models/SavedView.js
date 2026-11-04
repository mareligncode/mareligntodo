import mongoose, { Schema } from 'mongoose';

const savedViewFiltersSchema = new Schema(
  {
    statuses: [
      {
        type: String,
        trim: true,
      },
    ],
    priorities: [
      {
        type: String,
        trim: true,
      },
    ],
    categoryIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    tagIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Tag',
      },
    ],
    dueRange: {
      from: {
        type: Date,
        default: null,
      },
      to: {
        type: Date,
        default: null,
      },
    },
    includeArchived: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const savedViewSortSchema = new Schema(
  {
    field: {
      type: String,
      default: 'dueAt',
      trim: true,
    },
    direction: {
      type: String,
      enum: ['asc', 'desc'],
      default: 'asc',
    },
  },
  { _id: false }
);

const savedViewSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    filters: {
      type: savedViewFiltersSchema,
      default: () => ({
        statuses: [],
        priorities: [],
        categoryIds: [],
        tagIds: [],
        dueRange: { from: null, to: null },
        includeArchived: false,
      }),
    },
    sort: {
      type: savedViewSortSchema,
      default: () => ({ field: 'dueAt', direction: 'asc' }),
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

savedViewSchema.index({ owner: 1, name: 1 });

export const SavedView = mongoose.models.SavedView || mongoose.model('SavedView', savedViewSchema);
export default SavedView;

