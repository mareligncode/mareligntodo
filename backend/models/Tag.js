import mongoose, { Schema } from 'mongoose';

const tagSchema = new Schema(
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
      default: '#10B981',
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
tagSchema.index({ owner: 1, name: 1 }, { unique: true });

export const Tag = mongoose.models.Tag || mongoose.model('Tag', tagSchema);
export default Tag;

