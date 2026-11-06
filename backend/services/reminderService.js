export const calculateNextTriggerAt = (reminder, fromDate = new Date()) => {
  if (!reminder.enabled || reminder.status === 'paused' || reminder.status === 'cancelled') {
    return null;
  }

  const baseDate = reminder.scheduledAt ? new Date(reminder.scheduledAt) : new Date(fromDate);
  const now = new Date(fromDate);

  if (reminder.scheduleType === 'once') {
    return baseDate > now ? baseDate : null;
  }

  const recurrence = reminder.recurrence || {};
  const frequency = recurrence.frequency || 'none';
  const interval = Math.max(1, recurrence.interval || 1);

  if (frequency === 'none') {
    return baseDate > now ? baseDate : null;
  }

  // Check end condition
  if (recurrence.endAt && new Date(recurrence.endAt) < now) {
    return null;
  }
  if (recurrence.maxOccurrences && (reminder.occurrenceCount || 0) >= recurrence.maxOccurrences) {
    return null;
  }

  let next = new Date(baseDate);

  while (next <= now) {
    switch (frequency) {
      case 'minutely':
        next.setMinutes(next.getMinutes() + interval);
        break;
      case 'hourly':
        next.setHours(next.getHours() + interval);
        break;
      case 'daily':
        next.setDate(next.getDate() + interval);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7 * interval);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + interval);
        break;
      case 'yearly':
        next.setFullYear(next.getFullYear() + interval);
        break;
      default:
        return null;
    }
  }

  if (recurrence.endAt && next > new Date(recurrence.endAt)) {
    return null;
  }

  return next;
};

export default {
  calculateNextTriggerAt,
};

