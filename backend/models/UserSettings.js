import mongoose, { Schema } from 'mongoose';

const userSettingsSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    appearance: {
      theme: {
        type: String,
        enum: ['system', 'light', 'dark'],
        default: 'system',
      },
      accentColor: {
        type: String,
        default: '#3B82F6',
        trim: true,
      },
      weekStartsOn: {
        type: Number,
        default: 1,
        min: 0,
        max: 6, // 0 = Sunday, 1 = Monday
      },
    },
    defaults: {
      taskPriority: {
        type: String,
        default: 'none',
      },
      taskView: {
        type: String,
        enum: ['list', 'board', 'calendar'],
        default: 'list',
      },
      reminderChannels: [
        {
          type: String,
          default: 'in_app',
        },
      ],
    },
    notifications: {
      pushEnabled: {
        type: Boolean,
        default: true,
      },
      emailEnabled: {
        type: Boolean,
        default: true,
      },
      quietHoursEnabled: {
        type: Boolean,
        default: false,
      },
      quietHoursStart: {
        type: String,
        default: '22:00',
        trim: true,
      },
      quietHoursEnd: {
        type: String,
        default: '07:00',
        trim: true,
      },
    },
    privacy: {
      analyticsEnabled: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const UserSettings = mongoose.models.UserSettings || mongoose.model('UserSettings', userSettingsSchema);
export default UserSettings;

