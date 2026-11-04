import mongoose, { Schema } from 'mongoose';

const categorySchema = new Schema(
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
    color: {
      type: String,
      default: '#3B82F6',
      trim: true,
    },
    icon: {
      type: String,
      default: null,
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
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
categorySchema.index({ owner: 1, name: 1 }, { unique: true });

export const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
export default Category;

