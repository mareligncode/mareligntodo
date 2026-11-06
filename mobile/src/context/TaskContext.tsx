import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Task,
  Category,
  Tag,
  Habit,
  Goal,
  Reminder,
  NotificationItem,
  TaskStatus,
  TaskPriority,
} from '../types';
import {
  tasksApi,
  categoriesApi,
  tagsApi,
  habitsApi,
  goalsApi,
  remindersApi,
  notificationsApi,
  syncApi,
} from '../services/api';
import { useAuth } from './AuthContext';

const STORAGE_KEY_TASK_VIEW = '@marelign_task_view';
const STORAGE_KEY_HIDE_COMPLETED = '@marelign_hide_completed';
const STORAGE_KEY_DEFAULT_PRIORITY = '@marelign_default_priority';

interface TaskContextType {
  tasks: Task[];
  categories: Category[];
  tags: Tag[];
  habits: Habit[];
  goals: Goal[];
  reminders: Reminder[];
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  isLoading: boolean;
  refreshing: boolean;

  // App-wide configuration settings
  taskView: 'list' | 'compact';
  hideCompleted: boolean;
  defaultPriority: TaskPriority;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  setTaskView: (view: 'list' | 'compact') => Promise<void>;
  setHideCompleted: (hide: boolean) => Promise<void>;
  setDefaultPriority: (priority: TaskPriority) => Promise<void>;
  syncNow: () => Promise<void>;

  // Task actions
  fetchTasks: (params?: any) => Promise<void>;
  createTask: (data: any) => Promise<Task>;
  updateTask: (id: string, data: any) => Promise<Task>;
  toggleTaskStatus: (task: Task) => Promise<void>;
  deleteTask: (id: string, permanent?: boolean) => Promise<void>;
  toggleChecklist: (taskId: string, itemId: string, isCompleted: boolean) => Promise<void>;
  addChecklistItem: (taskId: string, text: string) => Promise<void>;

  // Category & Tag actions
  createCategory: (data: { name: string; color?: string; icon?: string }) => Promise<Category>;
  createTag: (data: { name: string; color?: string }) => Promise<Tag>;

  // Habit actions
  fetchHabits: () => Promise<void>;
  createHabit: (data: any) => Promise<Habit>;
  toggleHabit: (habitId: string, isCompleted: boolean) => Promise<void>;

  // Goal actions
  fetchGoals: () => Promise<void>;
  createGoal: (data: any) => Promise<Goal>;
  updateGoalProgress: (goalId: string, delta: number) => Promise<void>;

  // Notification actions
  fetchNotifications: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;

  // Global refresh
  refreshAll: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType>({} as TaskContextType);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, updateSettings } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState<number>(0);

  // App-wide configuration settings state
  const [taskView, setTaskViewState] = useState<'list' | 'compact'>('list');
  const [hideCompleted, setHideCompletedState] = useState<boolean>(false);
  const [defaultPriority, setDefaultPriorityState] = useState<TaskPriority>('none');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Load app preferences on startup
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const [savedView, savedHide, savedPriority] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY_TASK_VIEW),
          AsyncStorage.getItem(STORAGE_KEY_HIDE_COMPLETED),
          AsyncStorage.getItem(STORAGE_KEY_DEFAULT_PRIORITY),
        ]);

        if (savedView === 'list' || savedView === 'compact') {
          setTaskViewState(savedView);
        }
        if (savedHide !== null) {
          setHideCompletedState(savedHide === 'true');
        }
        if (savedPriority) {
          setDefaultPriorityState(savedPriority as TaskPriority);
        }
      } catch (err) {
        console.warn('Failed to load local preferences:', err);
      }
    };

    loadPreferences();
  }, []);

  const setTaskView = async (view: 'list' | 'compact') => {
    setTaskViewState(view);
    await AsyncStorage.setItem(STORAGE_KEY_TASK_VIEW, view);
    if (isAuthenticated) {
      updateSettings({ defaults: { taskView: view } }).catch(() => {});
    }
  };

  const setHideCompleted = async (hide: boolean) => {
    setHideCompletedState(hide);
    await AsyncStorage.setItem(STORAGE_KEY_HIDE_COMPLETED, String(hide));
  };

  const setDefaultPriority = async (priority: TaskPriority) => {
    setDefaultPriorityState(priority);
    await AsyncStorage.setItem(STORAGE_KEY_DEFAULT_PRIORITY, priority);
    if (isAuthenticated) {
      updateSettings({ defaults: { taskPriority: priority } }).catch(() => {});
    }
  };

  const getTodayString = () => new Date().toISOString().split('T')[0];

  const fetchTasks = useCallback(async (params?: any) => {
    try {
      const res = await tasksApi.getAll(params);
      setTasks(res.tasks || []);
    } catch (err) {
      console.warn('Failed to fetch tasks:', err);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await categoriesApi.getAll();
      setCategories(res.categories || []);
    } catch (err) {
      console.warn('Failed to fetch categories:', err);
    }
  }, []);

  const fetchTags = useCallback(async () => {
    try {
      const res = await tagsApi.getAll();
      setTags(res.tags || []);
    } catch (err) {
      console.warn('Failed to fetch tags:', err);
    }
  }, []);

  const fetchHabits = useCallback(async () => {
    try {
      const today = getTodayString();
      const res = await habitsApi.getAll(today);
      setHabits(res.habits || []);
    } catch (err) {
      console.warn('Failed to fetch habits:', err);
    }
  }, []);

  const fetchGoals = useCallback(async () => {
    try {
      const res = await goalsApi.getAll();
      setGoals(res.goals || []);
    } catch (err) {
      console.warn('Failed to fetch goals:', err);
    }
  }, []);

  const fetchReminders = useCallback(async () => {
    try {
      const res = await remindersApi.getAll();
      setReminders(res.reminders || []);
    } catch (err) {
      console.warn('Failed to fetch reminders:', err);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationsApi.getAll();
      setNotifications(res.notifications || []);
      setUnreadNotificationCount(res.unreadCount || 0);
    } catch (err) {
      console.warn('Failed to fetch notifications:', err);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    if (!isAuthenticated) return;
    setRefreshing(true);
    try {
      await Promise.all([
        fetchTasks(),
        fetchCategories(),
        fetchTags(),
        fetchHabits(),
        fetchGoals(),
        fetchReminders(),
        fetchNotifications(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [
    isAuthenticated,
    fetchTasks,
    fetchCategories,
    fetchTags,
    fetchHabits,
    fetchGoals,
    fetchReminders,
    fetchNotifications,
  ]);

  // Offline-first sync trigger
  const syncNow = async () => {
    if (!isAuthenticated) return;
    setSyncStatus('syncing');
    try {
      const pullRes = await syncApi.pull();
      if (pullRes?.changes) {
        if (pullRes.changes.tasks) setTasks(pullRes.changes.tasks);
        if (pullRes.changes.categories) setCategories(pullRes.changes.categories);
        if (pullRes.changes.tags) setTags(pullRes.changes.tags);
        if (pullRes.changes.goals) setGoals(pullRes.changes.goals);
        if (pullRes.changes.habits) setHabits(pullRes.changes.habits);
      }
      setSyncStatus('synced');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (err) {
      console.warn('Sync failed:', err);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 4000);
    }
  };

  // Initial load when user signs in
  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(true);
      refreshAll().finally(() => setIsLoading(false));
    } else {
      setTasks([]);
      setCategories([]);
      setTags([]);
      setHabits([]);
      setGoals([]);
      setReminders([]);
      setNotifications([]);
    }
  }, [isAuthenticated, refreshAll]);

  // --- Task Operations ---
  const createTask = async (data: any): Promise<Task> => {
    const payload = {
      priority: defaultPriority !== 'none' ? defaultPriority : data.priority || 'none',
      ...data,
    };
    const res = await tasksApi.create(payload);
    const newTask = res.task;
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  };

  const updateTask = async (id: string, data: any): Promise<Task> => {
    const res = await tasksApi.update(id, data);
    const updated = res.task;
    setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
    return updated;
  };

  const toggleTaskStatus = async (task: Task) => {
    const nextStatus: TaskStatus = task.status === 'completed' ? 'todo' : 'completed';

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t._id === task._id
          ? {
              ...t,
              status: nextStatus,
              completedAt: nextStatus === 'completed' ? new Date().toISOString() : null,
            }
          : t
      )
    );

    try {
      await tasksApi.updateStatus(task._id, nextStatus);
    } catch (err) {
      setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)));
      throw err;
    }
  };

  const deleteTask = async (id: string, permanent = false) => {
    setTasks((prev) => prev.filter((t) => t._id !== id));
    await tasksApi.delete(id, permanent);
  };

  const toggleChecklist = async (taskId: string, itemId: string, isCompleted: boolean) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t._id !== taskId) return t;
        return {
          ...t,
          checklist: t.checklist.map((item) =>
            item._id === itemId ? { ...item, isCompleted: !isCompleted } : item
          ),
        };
      })
    );

    await tasksApi.updateChecklist(taskId, itemId, { isCompleted: !isCompleted });
  };

  const addChecklistItem = async (taskId: string, text: string) => {
    const res = await tasksApi.addChecklist(taskId, { text });
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, checklist: res.checklist } : t))
    );
  };

  // --- Category & Tag Operations ---
  const createCategory = async (data: { name: string; color?: string; icon?: string }) => {
    const res = await categoriesApi.create(data);
    setCategories((prev) => [...prev, res.category]);
    return res.category;
  };

  const createTag = async (data: { name: string; color?: string }) => {
    const res = await tagsApi.create(data);
    setTags((prev) => [...prev, res.tag]);
    return res.tag;
  };

  // --- Habit Operations ---
  const createHabit = async (data: any) => {
    const res = await habitsApi.create(data);
    setHabits((prev) => [res.habit, ...prev]);
    return res.habit;
  };

  const toggleHabit = async (habitId: string, currentlyCompleted: boolean) => {
    const today = getTodayString();

    if (currentlyCompleted) {
      setHabits((prev) =>
        prev.map((h) => (h._id === habitId ? { ...h, todayEntry: null } : h))
      );
      await habitsApi.deleteEntry(habitId, today);
    } else {
      const entryData = { localDate: today, completedCount: 1 };
      setHabits((prev) =>
        prev.map((h) =>
          h._id === habitId
            ? { ...h, todayEntry: { owner: '', habit: habitId, localDate: today, completedCount: 1 } }
            : h
        )
      );
      await habitsApi.recordEntry(habitId, entryData);
    }
  };

  // --- Goal Operations ---
  const createGoal = async (data: any) => {
    const res = await goalsApi.create(data);
    setGoals((prev) => [res.goal, ...prev]);
    return res.goal;
  };

  const updateGoalProgress = async (goalId: string, delta: number) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g._id !== goalId) return g;
        const newCurrent = Math.max(0, g.currentValue + delta);
        const status = g.targetValue > 0 && newCurrent >= g.targetValue ? 'completed' : g.status;
        return { ...g, currentValue: newCurrent, status };
      })
    );

    await goalsApi.updateProgress(goalId, delta);
  };

  // --- Notification Operations ---
  const markNotificationAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, readAt: new Date().toISOString() } : n))
    );
    setUnreadNotificationCount((prev) => Math.max(0, prev - 1));
    await notificationsApi.markAsRead(id);
  };

  const markAllNotificationsAsRead = async () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, readAt: new Date().toISOString() }))
    );
    setUnreadNotificationCount(0);
    await notificationsApi.markAllAsRead();
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        categories,
        tags,
        habits,
        goals,
        reminders,
        notifications,
        unreadNotificationCount,
        isLoading,
        refreshing,
        taskView,
        hideCompleted,
        defaultPriority,
        syncStatus,
        setTaskView,
        setHideCompleted,
        setDefaultPriority,
        syncNow,
        fetchTasks,
        createTask,
        updateTask,
        toggleTaskStatus,
        deleteTask,
        toggleChecklist,
        addChecklistItem,
        createCategory,
        createTag,
        fetchHabits,
        createHabit,
        toggleHabit,
        fetchGoals,
        createGoal,
        updateGoalProgress,
        fetchNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        refreshAll,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);
export default TaskContext;
