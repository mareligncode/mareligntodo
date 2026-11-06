# Marelign Todo Mobile Application

A cross-platform React Native & Expo mobile app (iOS, Android, Web) built to interface with the Marelign Todo Express + MongoDB backend.

---

## 📱 Features

- **Authentication & Security**:
  - JWT authentication with secure session persistence via `@react-native-async-storage/async-storage`
  - Automatic navigation guard protecting private screens and redirecting unauthenticated users
  - Quick test autofill for effortless developer testing
- **Tasks Dashboard (`/tasks`)**:
  - Interactive status tabs: **All**, **To Do**, **Inbox**, and **Done**
  - Horizontal category filter pills with custom user colors
  - Search bar filtering title and descriptions with instant results
  - Task cards displaying priority badges, category chips, checklist counters, and due dates
  - One-tap status toggling with optimistic UI updates
- **Habit Tracker (`/habits`)**:
  - Daily recurrence habit list
  - One-tap completion logging for the current date (`YYYY-MM-DD`)
  - Create custom habits with customizable frequency (Daily, Weekly, Monthly) and reminder time
- **Productivity Goals (`/goals`)**:
  - Progress bars with real-time percentage indicators
  - Quick `+1` / `-1` increment controls
  - Automated status transitions to `completed` upon reaching target
- **Notification Inbox (`/notifications`)**:
  - Alert stream for scheduled task and reminder notifications
  - Real-time unread badge indicator on tab icon
  - Mark individual or all notifications as read
- **Task Details & Collaboration (`/task/:id`)**:
  - Full task inspection
  - Interactive subtask / checklist toggling and inline item addition
  - Comments & discussions section with real-time posting
  - Safe task deletion with prompt confirmation
- **Network & Server Switcher (`/profile`)**:
  - Seamlessly switch or update the backend API IP address directly within the app (essential when testing across real physical devices via Expo Go or local emulators!)

---

## 🚀 Getting Started

### 1. Start the Backend First
```bash
cd ../backend
npm run dev
```

### 2. Start the Expo Mobile App
```bash
cd mobile
npm start
```
From the interactive Expo terminal:
- Press `a` to open in Android Emulator (uses `http://10.0.2.2:5000/api`)
- Press `i` to open in iOS Simulator (uses `http://localhost:5000/api`)
- Press `w` to open in Web Browser
- Scan the QR code with **Expo Go** on your physical phone (and set the API URL in the Profile tab to your computer's LAN IP, e.g. `http://192.168.1.xxx:5000/api`)
