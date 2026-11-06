# Marelign Todo Backend API

A complete, production-grade Express & MongoDB backend built for the Marelign Todo application (supporting Web, iOS, and Android clients).

---

## 🚀 Features

- **Authentication & Security**:
  - JWT-based authentication (`Bearer <token>`)
  - Password hashing via `bcryptjs`
  - Failed login rate-limiting / account lock mechanism
  - Profile & password management
- **Task Management**:
  - Full CRUD operations with soft & hard deletion
  - Subtasks, checklists, priorities, and custom field maps
  - Search, pagination, and multi-field filtering
  - Custom views & smart presets
- **Organization**:
  - Custom user categories (with colors & icons)
  - Custom user tags
- **Reminders & Notifications**:
  - One-time and recurring schedule engines (daily, weekly, monthly, yearly, custom)
  - Multiple delivery channels: in-app, push, email
  - In-app notification inbox with read state tracking
- **Productivity & Tracking**:
  - Goal tracking with target progress and automatic completion
  - Habit tracker with frequency schedules and daily completion entries
  - Audit logging of all actions across mobile, API, and sync
- **Offline-First Synchronization**:
  - Client operation queue with idempotent execution (`clientOperationId`)
  - Server cursors and incremental change pulling (`/api/sync/pull`)
  - Mobile device registration with push token management (FCM, APNS, Expo)

---

## 🛠️ Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express 5.x
- **Database**: MongoDB with Mongoose 9.x
- **Security**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `cors`

---

## 📂 Directory Structure

```
backend/
├── config/
│   └── db.js                 # MongoDB connection & reconnect handlers
├── controllers/              # Request handlers for all domain entities
│   ├── activityLogController.js
│   ├── attachmentController.js
│   ├── authController.js
│   ├── categoryController.js
│   ├── commentController.js
│   ├── deviceController.js
│   ├── goalController.js
│   ├── habitController.js
│   ├── notificationController.js
│   ├── reminderController.js
│   ├── savedViewController.js
│   ├── settingsController.js
│   ├── syncController.js
│   ├── tagController.js
│   └── taskController.js
├── middlewares/              # Security and error handling middlewares
│   ├── auth.js               # JWT protection middleware
│   ├── errorHandler.js       # Centralized error handler
│   └── notFound.js           # 404 handler
├── models/                   # 17 Mongoose models with validation & indexes
│   ├── ActivityLog.js
│   ├── Attachment.js
│   ├── Category.js
│   ├── Comment.js
│   ├── Device.js
│   ├── Goal.js
│   ├── Habit.js
│   ├── HabitEntry.js
│   ├── index.js              # Central model aggregator
│   ├── Notification.js
│   ├── Reminder.js
│   ├── SavedView.js
│   ├── SyncOperation.js
│   ├── SyncState.js
│   ├── Tag.js
│   ├── Task.js
│   ├── User.js
│   └── UserSettings.js
├── routes/                   # REST API routes
│   ├── activityLogRoutes.js
│   ├── attachmentRoutes.js
│   ├── authRoutes.js
│   ├── categoryRoutes.js
│   ├── commentRoutes.js
│   ├── deviceRoutes.js
│   ├── goalRoutes.js
│   ├── habitRoutes.js
│   ├── index.js              # Master API router (/api/...)
│   ├── notificationRoutes.js
│   ├── reminderRoutes.js
│   ├── savedViewRoutes.js
│   ├── settingsRoutes.js
│   ├── syncRoutes.js
│   ├── tagRoutes.js
│   └── taskRoutes.js
├── services/                 # Reusable business logic
│   ├── activityService.js    # Activity audit logging
│   └── reminderService.js    # Next trigger time calculation
├── utils/                    # Helper utilities
│   ├── apiResponse.js        # Standardized JSON response helper
│   ├── appError.js           # Custom operational error class
│   ├── asyncHandler.js       # Async error wrapper
│   ├── jwt.js                # JWT sign & verify
│   └── password.js           # Password hash & compare
├── .env                      # Environment variables
└── server.js                 # Express server bootstrap
```

---

## 📡 API Endpoints

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new account |
| `POST` | `/api/auth/login` | Login and receive JWT |
| `GET` | `/api/auth/me` | Get current user profile & settings |
| `PUT` | `/api/auth/update-profile` | Update fullName, avatar, timezone, etc. |
| `PUT` | `/api/auth/change-password` | Change user password |

### 2. User Settings (`/api/settings`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/settings` | Get user preferences & theme |
| `PUT` | `/api/settings` | Update preferences |

### 3. Tasks (`/api/tasks`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tasks` | Get tasks (filters: status, priority, category, tag, dueFrom, dueTo, search, etc.) |
| `POST` | `/api/tasks` | Create task |
| `GET` | `/api/tasks/:id` | Get task details (with subtasks, reminders, counts) |
| `PUT` | `/api/tasks/:id` | Update task |
| `PATCH`| `/api/tasks/:id/status` | Quick update task status |
| `DELETE`| `/api/tasks/:id` | Soft delete task (pass `?permanent=true` for hard delete) |
| `POST` | `/api/tasks/:id/checklist` | Add checklist item |
| `PUT` | `/api/tasks/:id/checklist/:itemId` | Update checklist item |
| `DELETE`| `/api/tasks/:id/checklist/:itemId` | Delete checklist item |

### 4. Categories (`/api/categories`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/categories` | Get user categories |
| `POST` | `/api/categories` | Create category |
| `GET` | `/api/categories/:id` | Get category |
| `PUT` | `/api/categories/:id` | Update category |
| `DELETE`| `/api/categories/:id` | Delete category |

### 5. Tags (`/api/tags`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tags` | Get user tags |
| `POST` | `/api/tags` | Create tag |
| `GET` | `/api/tags/:id` | Get tag |
| `PUT` | `/api/tags/:id` | Update tag |
| `DELETE`| `/api/tags/:id` | Delete tag |

### 6. Reminders (`/api/reminders`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/reminders` | Get reminders |
| `POST` | `/api/reminders` | Create reminder |
| `GET` | `/api/reminders/:id` | Get reminder |
| `PUT` | `/api/reminders/:id` | Update reminder |
| `PATCH`| `/api/reminders/:id/snooze` | Snooze reminder |
| `DELETE`| `/api/reminders/:id` | Delete reminder |

### 7. Notifications (`/api/notifications`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/notifications` | Get notifications & unread count |
| `PATCH`| `/api/notifications/:id/read` | Mark notification as read |
| `PATCH`| `/api/notifications/read-all` | Mark all notifications as read |
| `DELETE`| `/api/notifications/:id` | Delete notification |

### 8. Comments (`/api/comments`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/comments/task/:taskId` | Get task comments |
| `POST` | `/api/comments/task/:taskId` | Add comment to task |
| `PUT` | `/api/comments/:id` | Update comment |
| `DELETE`| `/api/comments/:id` | Delete comment |

### 9. Attachments (`/api/attachments`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/attachments/task/:taskId` | Get task attachments |
| `POST` | `/api/attachments/task/:taskId` | Upload/register attachment metadata |
| `DELETE`| `/api/attachments/:id` | Delete attachment |

### 10. Goals (`/api/goals`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/goals` | Get user goals |
| `POST` | `/api/goals` | Create goal |
| `GET` | `/api/goals/:id` | Get goal |
| `PUT` | `/api/goals/:id` | Update goal |
| `PATCH`| `/api/goals/:id/progress` | Update goal progress |
| `DELETE`| `/api/goals/:id` | Delete goal |

### 11. Habits (`/api/habits`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/habits` | Get habits (pass `?today=YYYY-MM-DD` to attach today's entry) |
| `POST` | `/api/habits` | Create habit |
| `GET` | `/api/habits/:id` | Get habit with recent 30-day entries |
| `PUT` | `/api/habits/:id` | Update habit |
| `DELETE`| `/api/habits/:id` | Delete habit |
| `GET` | `/api/habits/:habitId/entries` | Get habit entry history |
| `POST` | `/api/habits/:habitId/entries` | Log completion for date |
| `DELETE`| `/api/habits/:habitId/entries/:localDate` | Delete log |

### 12. Saved Views (`/api/saved-views`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/saved-views` | Get saved task filter presets |
| `POST` | `/api/saved-views` | Create saved view |
| `GET` | `/api/saved-views/:id` | Get saved view |
| `PUT` | `/api/saved-views/:id` | Update saved view |
| `DELETE`| `/api/saved-views/:id` | Delete saved view |

### 13. Devices (`/api/devices`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/devices` | Get registered mobile devices |
| `POST` | `/api/devices` | Register / update device push token |
| `DELETE`| `/api/devices/:deviceId` | Revoke device |

### 14. Activity Logs (`/api/activity-logs`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/activity-logs` | Get activity audit log feed |

### 15. Offline Sync (`/api/sync`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/sync/state` | Get current sync cursor & timestamp |
| `GET` | `/api/sync/pull` | Fetch incremental changes since timestamp |
| `POST` | `/api/sync/push` | Batch push offline operations idempotently |

---

## 🏃 Starting the Server

```bash
cd backend
npm run dev   # Development mode with nodemon
# or
npm start     # Production mode
```

