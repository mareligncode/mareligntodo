import { Router } from 'express';
import authRoutes from './authRoutes.js';
import settingsRoutes from './settingsRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import tagRoutes from './tagRoutes.js';
import taskRoutes from './taskRoutes.js';
import reminderRoutes from './reminderRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import commentRoutes from './commentRoutes.js';
import attachmentRoutes from './attachmentRoutes.js';
import goalRoutes from './goalRoutes.js';
import habitRoutes from './habitRoutes.js';
import savedViewRoutes from './savedViewRoutes.js';
import deviceRoutes from './deviceRoutes.js';
import activityLogRoutes from './activityLogRoutes.js';
import syncRoutes from './syncRoutes.js';

const apiRouter = Router();

// Health check
apiRouter.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Resource routes
apiRouter.use('/auth', authRoutes);
apiRouter.use('/settings', settingsRoutes);
apiRouter.use('/categories', categoryRoutes);
apiRouter.use('/tags', tagRoutes);
apiRouter.use('/tasks', taskRoutes);
apiRouter.use('/reminders', reminderRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/comments', commentRoutes);
apiRouter.use('/attachments', attachmentRoutes);
apiRouter.use('/goals', goalRoutes);
apiRouter.use('/habits', habitRoutes);
apiRouter.use('/saved-views', savedViewRoutes);
apiRouter.use('/devices', deviceRoutes);
apiRouter.use('/activity-logs', activityLogRoutes);
apiRouter.use('/sync', syncRoutes);

export default apiRouter;

