import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../types';
import { useTheme } from '../context/ThemeContext';

interface TaskCardProps {
  task: Task;
  compact?: boolean;
  onPress: () => void;
  onToggleStatus: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  compact = false,
  onPress,
  onToggleStatus,
}) => {
  const { colors, isDark } = useTheme();
  const isCompleted = task.status === 'completed';
  const category = typeof task.category === 'object' && task.category ? task.category : null;

  const priorityColor =
    colors.priority[task.priority as keyof typeof colors.priority] || colors.priority.none;

  const totalChecklist = task.checklist ? task.checklist.length : 0;
  const completedChecklist = task.checklist
    ? task.checklist.filter((item) => item.isCompleted).length
    : 0;

  const formattedDueDate = task.dueAt
    ? new Date(task.dueAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : null;

  if (compact) {
    return (
      <TouchableOpacity
        style={[
          styles.compactCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
          },
          isCompleted && { opacity: 0.5 },
        ]}
        activeOpacity={0.7}
        onPress={onPress}
      >
        <TouchableOpacity
          style={[
            styles.compactCheckbox,
            { borderColor: colors.textMuted },
            isCompleted && { backgroundColor: colors.success, borderColor: colors.success },
          ]}
          onPress={onToggleStatus}
        >
          {isCompleted && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
        </TouchableOpacity>

        <Text
          style={[
            styles.compactTitle,
            { color: colors.text },
            isCompleted && { textDecorationLine: 'line-through', color: colors.textMuted },
          ]}
          numberOfLines={1}
        >
          {task.title}
        </Text>

        {category && (
          <View style={[styles.compactCatDot, { backgroundColor: category.color || colors.primary }]} />
        )}

        {formattedDueDate && (
          <Text style={[styles.compactDue, { color: colors.textMuted }]}>{formattedDueDate}</Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
        },
        isCompleted && {
          opacity: 0.6,
          backgroundColor: isDark ? '#111827' : '#F8FAFC',
        },
      ]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.row}>
        {/* Checkbox button */}
        <TouchableOpacity
          style={[
            styles.checkbox,
            { borderColor: colors.textMuted },
            isCompleted && { backgroundColor: colors.success, borderColor: colors.success },
          ]}
          onPress={onToggleStatus}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {isCompleted && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.title,
                { color: colors.text },
                isCompleted && { textDecorationLine: 'line-through', color: colors.textMuted },
              ]}
              numberOfLines={2}
            >
              {task.title}
            </Text>

            {task.priority !== 'none' && (
              <View style={[styles.priorityBadge, { backgroundColor: `${priorityColor}20` }]}>
                <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
                <Text style={[styles.priorityText, { color: priorityColor }]}>
                  {task.priority}
                </Text>
              </View>
            )}
          </View>

          {task.description ? (
            <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
              {task.description}
            </Text>
          ) : null}

          {/* Meta footer row: Category, Due Date, Checklist */}
          <View style={styles.footer}>
            {category && (
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: `${category.color || colors.primary}20` },
                ]}
              >
                <Text style={[styles.categoryText, { color: category.color || colors.primary }]}>
                  {category.name}
                </Text>
              </View>
            )}

            {formattedDueDate && (
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={13} color={colors.textSecondary} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {formattedDueDate}
                </Text>
              </View>
            )}

            {totalChecklist > 0 && (
              <View style={styles.metaItem}>
                <Ionicons name="checkbox-outline" size={13} color={colors.textSecondary} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {completedChecklist}/{totalChecklist}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 10,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 6,
  },
  compactCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  compactTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  compactCatDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  compactDue: {
    fontSize: 11,
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default TaskCard;
