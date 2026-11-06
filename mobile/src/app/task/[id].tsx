import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { tasksApi, commentsApi } from '../../services/api';
import { useTasks } from '../../context/TaskContext';
import { useTheme } from '../../context/ThemeContext';
import { Task, CommentItem } from '../../types';

export default function TaskDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { toggleTaskStatus, deleteTask, toggleChecklist, addChecklistItem } = useTasks();
  const { colors, isDark } = useTheme();

  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newChecklistText, setNewChecklistText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadTaskData = async () => {
      try {
        const [taskRes, commentsRes] = await Promise.all([
          tasksApi.getById(id),
          commentsApi.getByTask(id).catch(() => ({ comments: [] })),
        ]);
        setTask(taskRes.task);
        setComments(commentsRes.comments || []);
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Could not load task details.');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    loadTaskData();
  }, [id, router]);

  const handleToggleStatus = async () => {
    if (!task) return;
    await toggleTaskStatus(task);
    setTask((prev) =>
      prev
        ? {
            ...prev,
            status: prev.status === 'completed' ? 'todo' : 'completed',
          }
        : null
    );
  };

  const handleToggleChecklist = async (itemId: string, isCompleted: boolean) => {
    if (!task) return;
    await toggleChecklist(task._id, itemId, isCompleted);
    setTask((prev) =>
      prev
        ? {
            ...prev,
            checklist: prev.checklist.map((item) =>
              item._id === itemId ? { ...item, isCompleted: !isCompleted } : item
            ),
          }
        : null
    );
  };

  const handleAddChecklist = async () => {
    if (!newChecklistText.trim() || !task) return;
    const text = newChecklistText.trim();
    setNewChecklistText('');
    await addChecklistItem(task._id, text);
    // Reload task
    const res = await tasksApi.getById(task._id);
    setTask(res.task);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !task) return;
    try {
      const res = await commentsApi.create(task._id, { body: newComment.trim() });
      setComments([...comments, res.comment]);
      setNewComment('');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to post comment');
    }
  };

  const handleDelete = () => {
    if (!task) return;
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTask(task._id);
          router.back();
        },
      },
    ]);
  };

  if (loading || !task) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const isCompleted = task.status === 'completed';
  const category = typeof task.category === 'object' && task.category ? task.category : null;
  const priorityColor =
    colors.priority[task.priority as keyof typeof colors.priority] || colors.priority.none;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Top Bar */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.card, borderBottomColor: colors.cardBorder },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleDelete} style={styles.headerBtn}>
          <Ionicons name="trash-outline" size={22} color={colors.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Status Toggle Row */}
        <TouchableOpacity
          style={[
            styles.statusToggle,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
            isCompleted && {
              backgroundColor: isDark ? '#064E3B33' : colors.successLight,
              borderColor: colors.success,
            },
          ]}
          onPress={handleToggleStatus}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
            size={26}
            color={isCompleted ? colors.success : colors.textMuted}
          />
          <Text
            style={[
              styles.statusToggleText,
              { color: colors.text },
              isCompleted && { color: colors.success },
            ]}
          >
            {isCompleted ? 'Task Completed' : 'Mark as Complete'}
          </Text>
        </TouchableOpacity>

        {/* Title & Description */}
        <Text
          style={[
            styles.title,
            { color: colors.text },
            isCompleted && { textDecorationLine: 'line-through', color: colors.textMuted },
          ]}
        >
          {task.title}
        </Text>
        {task.description ? (
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {task.description}
          </Text>
        ) : null}

        {/* Badges Row */}
        <View style={styles.badgesRow}>
          {category && (
            <View
              style={[
                styles.badge,
                { backgroundColor: `${category.color || colors.primary}20` },
              ]}
            >
              <Text style={[styles.badgeText, { color: category.color || colors.primary }]}>
                {category.name}
              </Text>
            </View>
          )}

          {task.priority !== 'none' && (
            <View style={[styles.badge, { backgroundColor: `${priorityColor}20` }]}>
              <Text style={[styles.badgeText, { color: priorityColor }]}>
                {task.priority} Priority
              </Text>
            </View>
          )}

          {task.dueAt && (
            <View style={[styles.badge, { backgroundColor: colors.inputBackground }]}>
              <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
              <Text style={[styles.badgeText, { color: colors.textSecondary, marginLeft: 4 }]}>
                {new Date(task.dueAt).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        {/* Checklist Section */}
        <View
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Checklist</Text>
          {task.checklist && task.checklist.length > 0 ? (
            task.checklist.map((item) => (
              <TouchableOpacity
                key={item._id}
                style={styles.checklistItem}
                onPress={() => handleToggleChecklist(item._id, item.isCompleted)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={item.isCompleted ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={item.isCompleted ? colors.success : colors.textMuted}
                />
                <Text
                  style={[
                    styles.checklistText,
                    { color: colors.text },
                    item.isCompleted && { textDecorationLine: 'line-through', color: colors.textMuted },
                  ]}
                >
                  {item.text}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={[styles.emptyNote, { color: colors.textMuted }]}>No sub-items yet.</Text>
          )}

          {/* Add Checklist Item */}
          <View style={styles.addChecklistRow}>
            <TextInput
              style={[
                styles.checklistInput,
                {
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                  borderColor: colors.inputBorder,
                },
              ]}
              placeholder="Add checklist item..."
              placeholderTextColor={colors.textMuted}
              value={newChecklistText}
              onChangeText={setNewChecklistText}
              onSubmitEditing={handleAddChecklist}
            />
            <TouchableOpacity
              style={[styles.addChecklistBtn, { backgroundColor: colors.primary }]}
              onPress={handleAddChecklist}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Comments Section */}
        <View
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Discussion ({comments.length})
          </Text>
          {comments.map((comment) => (
            <View
              key={comment._id}
              style={[
                styles.commentCard,
                { backgroundColor: colors.inputBackground, borderColor: colors.cardBorder },
              ]}
            >
              <View style={styles.commentHeader}>
                <Text style={[styles.commentAuthor, { color: colors.text }]}>
                  {comment.author?.fullName || 'User'}
                </Text>
                <Text style={[styles.commentTime, { color: colors.textMuted }]}>
                  {new Date(comment.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <Text style={[styles.commentBody, { color: colors.text }]}>{comment.body}</Text>
            </View>
          ))}

          {/* Add Comment */}
          <View style={styles.addCommentRow}>
            <TextInput
              style={[
                styles.commentInput,
                {
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                  borderColor: colors.inputBorder,
                },
              ]}
              placeholder="Write a comment..."
              placeholderTextColor={colors.textMuted}
              value={newComment}
              onChangeText={setNewComment}
            />
            <TouchableOpacity
              style={[
                styles.sendCommentBtn,
                { backgroundColor: colors.primary },
                !newComment.trim() && { opacity: 0.5 },
              ]}
              onPress={handleAddComment}
              disabled={!newComment.trim()}
            >
              <Ionicons name="send" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerBtn: {
    padding: 6,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  statusToggleText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
    marginBottom: 20,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  section: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  emptyNote: {
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checklistText: {
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
  addChecklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  checklistInput: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 13,
  },
  addChecklistBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentCard: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: '700',
  },
  commentTime: {
    fontSize: 10,
  },
  commentBody: {
    fontSize: 13,
  },
  addCommentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  commentInput: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 13,
  },
  sendCommentBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
