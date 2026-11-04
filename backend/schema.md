Below is the complete editable MongoDB/Mongoose schema specification for your To-Do Application. You can copy it directly into Word, Google Docs, VS Code, or your project documentation and modify any field.

# To-Do Application – Database Schema

Database: MongoDB | ODM: Mongoose | Platform: Android & iOS | Architecture: Personal + Collaborative

## 1. Users

Stores user accounts, authentication information, and profile details.

```
Users {
  _id: ObjectId,
  fullName: String,
  email: String,                 // Unique
  passwordHash: String,          // Hashed password
  avatarUrl: String,
  emailVerifiedAt: Date,
  status: Enum [
    "active",
    "suspended",
    "pending_deletion"
  ],
  locale: String,
  timezone: String,
  lastLoginAt: Date,
  passwordChangedAt: Date,

  security: {
    failedLoginCount: Number,
    lockUntil: Date
  },

  createdAt: Date,
  updatedAt: Date
}
```

## 2. Tasks

The main collection for managing personal and collaborative tasks.

```
Tasks {
  _id: ObjectId,
  owner: ObjectId,               // Reference: Users
  title: String,
  description: String,

  status: Enum [
    "inbox",
    "todo",
    "in_progress",
    "waiting",
    "completed",
    "cancelled"
  ],

  priority: Enum [
    "none",
    "low",
    "medium",
    "high",
    "urgent"
  ],

  startAt: Date,
  dueAt: Date,
  completedAt: Date,

  category: ObjectId,            // Reference: Categories
  tags: [ObjectId],              // Reference: Tags

  projectName: String,
  parentTask: ObjectId,          // Reference: Tasks
  assignedTo: [ObjectId],        // Reference: Users

  checklist: [
    {
      _id: ObjectId,
      text: String,
      isCompleted: Boolean,
      completedAt: Date,
      position: Number
    }
  ],

  estimatedMinutes: Number,
  actualMinutes: Number,

  color: String,
  isPinned: Boolean,
  isArchived: Boolean,
  archivedAt: Date,

  source: Enum [
    "manual",
    "recurring",
    "import",
    "integration"
  ],

  clientUpdatedAt: Date,
  deletedAt: Date,

  customFields: Map,

  createdAt: Date,
  updatedAt: Date,
  version: Number
}
```

## 3. Categories

Allows users to create and customize their own task categories.

```
Categories {
  _id: ObjectId,
  owner: ObjectId,               // Reference: Users
  name: String,
  color: String,
  icon: String,
  isDefault: Boolean,
  isArchived: Boolean,

  createdAt: Date,
  updatedAt: Date
}
```

## 4. Tags

Allows users to organize tasks using multiple tags.

```
Tags {
  _id: ObjectId,
  owner: ObjectId,
  name: String,
  color: String,

  createdAt: Date,
  updatedAt: Date
}
```

## 5. Reminders

A separate collection supporting multiple reminders for one task.

```
Reminders {
  _id: ObjectId,
  owner: ObjectId,               // Reference: Users
  task: ObjectId,                // Reference: Tasks

  title: String,
  enabled: Boolean,

  status: Enum [
    "scheduled",
    "processing",
    "completed",
    "paused",
    "failed",
    "cancelled"
  ],

  scheduleType: Enum [
    "once",
    "recurring"
  ],

  scheduledAt: Date,
  timezone: String,

  recurrence: {
    frequency: Enum [
      "none",
      "minutely",
      "hourly",
      "daily",
      "weekly",
      "monthly",
      "yearly",
      "custom"
    ],

    interval: Number,
    daysOfWeek: [Number],
    dayOfMonth: Number,
    monthOfYear: Number,
    cron: String,
    endAt: Date,
    maxOccurrences: Number
  },

  channels: [
    "in_app",
    "push",
    "email"
  ],

  leadMinutes: Number,

  nextTriggerAt: Date,
  lastTriggeredAt: Date,
  occurrenceCount: Number,

  snoozeUntil: Date,

  failureCount: Number,
  lastError: String,
  idempotencyKey: String,

  createdAt: Date,
  updatedAt: Date
}
```

## 6. Notifications

Stores notifications delivered to users.

```
Notifications {
  _id: ObjectId,
  user: ObjectId,
  task: ObjectId,
  reminder: ObjectId,

  type: Enum [
    "reminder",
    "task_assigned",
    "task_due",
    "task_completed",
    "system"
  ],

  title: String,
  body: String,
  data: Object,

  channels: [
    "in_app",
    "push",
    "email"
  ],

  readAt: Date,
  deliveredAt: Date,

  deliveryStatus: Enum [
    "pending",
    "sent",
    "partially_sent",
    "failed"
  ],

  dedupeKey: String,

  createdAt: Date,
  updatedAt: Date
}
```

## 7. Comments

Stores discussions and comments associated with tasks.

```
Comments {
  _id: ObjectId,
  task: ObjectId,
  author: ObjectId,
  body: String,
  editedAt: Date,
  deletedAt: Date,

  createdAt: Date,
  updatedAt: Date
}
```

## 8. Attachments

Stores metadata for documents and files uploaded to tasks.

```
Attachments {
  _id: ObjectId,
  owner: ObjectId,
  task: ObjectId,

  fileName: String,
  storageKey: String,
  mimeType: String,
  sizeBytes: Number,
  url: String,

  uploadedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 9. Activity Logs

Tracks user activities and task modifications.

```
ActivityLogs {
  _id: ObjectId,
  owner: ObjectId,
  actor: ObjectId,
  task: ObjectId,

  entityType: Enum [
    "task",
    "reminder",
    "category",
    "goal",
    "habit",
    "user"
  ],

  entityId: ObjectId,
  action: String,
  changes: Object,

  source: Enum [
    "mobile",
    "api",
    "system",
    "sync"
  ],

  occurredAt: Date
}
```

## 10. User Settings

Allows users to customize the application.

```
UserSettings {
  _id: ObjectId,
  user: ObjectId,

  appearance: {
    theme: Enum ["system", "light", "dark"],
    accentColor: String,
    weekStartsOn: Number
  },

  defaults: {
    taskPriority: String,
    taskView: Enum ["list", "board", "calendar"],
    reminderChannels: [String]
  },

  notifications: {
    pushEnabled: Boolean,
    emailEnabled: Boolean,
    quietHoursEnabled: Boolean,
    quietHoursStart: String,
    quietHoursEnd: String
  },

  privacy: {
    analyticsEnabled: Boolean
  },

  createdAt: Date,
  updatedAt: Date
}
```

## 11. Goals

Allows users to create and monitor personal productivity goals.

```
Goals {
  _id: ObjectId,
  owner: ObjectId,

  title: String,
  description: String,

  targetValue: Number,
  currentValue: Number,
  unit: String,

  startAt: Date,
  targetAt: Date,

  status: Enum [
    "active",
    "completed",
    "paused",
    "cancelled"
  ],

  color: String,

  createdAt: Date,
  updatedAt: Date
}
```

## 12. Habits

Allows users to track recurring daily, weekly, and monthly habits.

```
Habits {
  _id: ObjectId,
  owner: ObjectId,

  title: String,
  description: String,

  schedule: {
    frequency: Enum [
      "daily",
      "weekly",
      "monthly"
    ],

    interval: Number,
    daysOfWeek: [Number],
    targetCount: Number
  },

  reminderTime: String,
  timezone: String,
  color: String,

  isActive: Boolean,
  archivedAt: Date,

  createdAt: Date,
  updatedAt: Date
}
```

## 13. Habit Entries

Stores daily habit completion records.

```
HabitEntries {
  _id: ObjectId,
  owner: ObjectId,
  habit: ObjectId,

  localDate: String,             // YYYY-MM-DD
  completedCount: Number,
  note: String,

  createdAt: Date,
  updatedAt: Date
}
```

## 14. Saved Views

Allows users to create and save custom task filters.

```
SavedViews {
  _id: ObjectId,
  owner: ObjectId,

  name: String,

  filters: {
    statuses: [String],
    priorities: [String],
    categoryIds: [ObjectId],
    tagIds: [ObjectId],

    dueRange: {
      from: Date,
      to: Date
    },

    includeArchived: Boolean
  },

  sort: {
    field: String,
    direction: Enum ["asc", "desc"]
  },

  isDefault: Boolean,

  createdAt: Date,
  updatedAt: Date
}
```

## 15. Devices

Manages registered mobile devices and push notification tokens.

```
Devices {
  _id: ObjectId,
  user: ObjectId,

  deviceId: String,

  platform: Enum [
    "ios",
    "android"
  ],

  appVersion: String,
  pushToken: String,

  pushProvider: Enum [
    "fcm",
    "apns",
    "expo",
    "none"
  ],

  lastSeenAt: Date,
  revokedAt: Date,

  createdAt: Date,
  updatedAt: Date
}
```

## 16. Sync Operations

Stores offline mobile operations waiting to synchronize with the server.

```
SyncOperations {
  _id: ObjectId,
  user: ObjectId,
  device: ObjectId,

  clientOperationId: String,

  entityType: Enum [
    "task",
    "category",
    "tag",
    "reminder",
    "goal",
    "habit",
    "habit_entry",
    "settings"
  ],

  entityId: String,

  operation: Enum [
    "create",
    "update",
    "delete"
  ],

  baseVersion: Number,
  payload: Object,

  status: Enum [
    "accepted",
    "applied",
    "conflict",
    "rejected"
  ],

  serverVersion: Number,
  conflictData: Object,
  processedAt: Date,

  createdAt: Date,
  updatedAt: Date
}
```

## 17. Sync State

Stores the latest synchronization state for each user.

```
SyncStates {
  _id: ObjectId,
  user: ObjectId,

  lastPulledAt: Date,
  lastAcknowledgedAt: Date,
  serverCursor: String,
  schemaVersion: Number,

  createdAt: Date,
  updatedAt: Date
}
```

# 18. Database relationships

```
USER
 ├── UserSettings
 ├── Devices
 ├── Tasks
 │    ├── Subtasks (Task.parentTask)
 │    ├── Checklist Items
 │    ├── Reminders
 │    │    └── Notifications
 │    ├── Comments
 │    ├── Attachments
 │    ├── Category
 │    ├── Tags
 │    └── ActivityLogs
 │
 ├── Goals
 ├── Habits
 │    └── HabitEntries
 ├── SavedViews
 ├── SyncOperations
 └── SyncState
```

# 19. Essential database indexes

| Collection     | Index                             | Purpose                    |
| -------------- | --------------------------------- | -------------------------- |
| Users          | email (unique)                    | Prevent duplicate accounts |
| Tasks          | owner + status + dueAt            | Task filtering             |
| Tasks          | owner + priority + dueAt          | Priority sorting           |
| Tasks          | owner + isArchived + updatedAt    | Archived and active views  |
| Categories     | owner + name (unique)             | Unique categories          |
| Tags           | owner + name (unique)             | Unique tags                |
| Reminders      | enabled + status + nextTriggerAt  | Reminder scheduling        |
| Notifications  | user + readAt + createdAt         | Notification inbox         |
| HabitEntries   | habit + localDate (unique)        | Prevent duplicate entries  |
| Devices        | user + deviceId (unique)          | Device management          |
| SyncOperations | user + clientOperationId (unique) | Idempotent synchronization |

# 20. Reminder execution workflow

1. Create reminder

   User creates a reminder for a task and selects date, time, recurrence, timezone, and notification channels.
2. Save in MongoDB

   Store the reminder and calculate its `nextTriggerAt`.
3. Background scheduler

   BullMQ workers using Redis process reminders when they become due.
4. Send notification

   Deliver through Firebase push notifications, in-app notifications, or email.
5. Handle recurrence

   Calculate the next occurrence and update the reminder.
6. Snooze or complete

   Reschedule the same reminder when snoozed, or stop future reminders when appropriate.

Important: The server must be the authoritative reminder scheduler. Mobile local notifications should supplement it, particularly when the device is offline.

# 21. Recommended development order

1. Authentication and user settings.
2. Task CRUD and task relationships.
3. Categories, tags, and custom views.
4. Advanced reminders and background workers.
5. Push notifications.
6. Offline-first SQLite storage.
7. Synchronization and conflict resolution.
8. Goals, habits, and analytics.
9. Testing, security, and deployment.

Architecture recommendation: Keep the 17 models separate, enforce ownership at the API/service layer, and use MongoDB indexes for frequently queried fields. For team collaboration, add an explicit task-membership/permission model before exposing shared tasks; assigning a user to a task alone does not grant safe access.

This is the editable schema specification. The ZIP containing the corresponding starter Mongoose files is also available above.