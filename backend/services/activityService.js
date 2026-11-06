import ActivityLog from '../models/ActivityLog.js';

export const logActivity = async ({
  owner,
  actor,
  task = null,
  entityType,
  entityId,
  action,
  changes = {},
  source = 'api',
}) => {
  try {
    return await ActivityLog.create({
      owner: owner || actor,
      actor,
      task,
      entityType,
      entityId,
      action,
      changes,
      source,
      occurredAt: new Date(),
    });
  } catch (error) {
    // Non-blocking: fail quietly or log error so it does not abort main transaction
    console.error('Failed to record activity log:', error.message);
    return null;
  }
};

export default {
  logActivity,
};

