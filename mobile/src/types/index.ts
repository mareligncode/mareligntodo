export type TaskStatus = 'inbox' | 'todo' | 'in_progress' | 'waiting' | 'completed' | 'cancelled';

export type TaskPriority = 'none' | 'low' | 'medium' | 'high' | 'urgent';

export interface ChecklistItem {
  _id: string;
  text: string;
  isCompleted: boolean;
  completedAt?: string | null;
  position: number;
}

export interface Category {
  _id: string;
  name: string;
  color: string;
  icon?: string | null;
  isDefault?: boolean;
  isArchived?: boolean;
}

export interface Tag {
  _id: string;
  name: string;
  color: string;
}

export interface Task {
  _id: string;
  owner: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  startAt?: string | null;
  dueAt?: string | null;
  completedAt?: string | null;
  category?: Category | string | null;
  tags?: (Tag | string)[];
  projectName?: string | null;
  parentTask?: string | Task | null;
  checklist: ChecklistItem[];
  estimatedMinutes?: number;
  actualMinutes?: number;
  color?: string | null;
  isPinned?: boolean;
  isArchived?: boolean;
  version?: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  locale?: string;
  timezone?: string;
  status?: string;
  lastLoginAt?: string | null;
}

export interface UserSettings {
  _id?: string;
  appearance?: {
    theme?: 'system' | 'light' | 'dark';
    accentColor?: string;
    weekStartsOn?: number;
  };
  defaults?: {
    taskPriority?: string;
    taskView?: 'list' | 'board' | 'calendar' | 'compact';
    reminderChannels?: string[];
  };
  notifications?: {
    pushEnabled?: boolean;
    emailEnabled?: boolean;
    quietHoursEnabled?: boolean;
    quietHoursStart?: string;
    quietHoursEnd?: string;
  };
}

export interface Goal {
  _id: string;
  owner: string;
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  unit?: string;
  startAt?: string | null;
  targetAt?: string | null;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HabitSchedule {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
  daysOfWeek: number[];
  targetCount: number;
}

export interface HabitEntry {
  _id?: string;
  owner: string;
  habit: string;
  localDate: string;
  completedCount: number;
  note?: string;
}

export interface Habit {
  _id: string;
  owner: string;
  title: string;
  description?: string;
  schedule: HabitSchedule;
  reminderTime?: string | null;
  timezone?: string;
  color?: string;
  isActive: boolean;
  todayEntry?: HabitEntry | null;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  _id: string;
  owner: string;
  task: string | { _id: string; title: string; priority: string; dueAt?: string };
  title?: string;
  enabled: boolean;
  status: 'scheduled' | 'processing' | 'completed' | 'paused' | 'failed' | 'cancelled';
  scheduleType: 'once' | 'recurring';
  scheduledAt?: string | null;
  nextTriggerAt?: string | null;
  channels: string[];
}

export interface NotificationItem {
  _id: string;
  user: string;
  task?: { _id: string; title: string; priority: string; status: string } | null;
  type: 'reminder' | 'task_assigned' | 'task_due' | 'task_completed' | 'system';
  title: string;
  body: string;
  readAt?: string | null;
  createdAt: string;
}

export interface CommentItem {
  _id: string;
  task: string;
  author: {
    _id: string;
    fullName: string;
    avatarUrl?: string;
  };
  body: string;
  createdAt: string;
  editedAt?: string | null;
}

