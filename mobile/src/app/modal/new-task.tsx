import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '../../context/TaskContext';
import { useTheme } from '../../context/ThemeContext';
import { TaskPriority } from '../../types';

export default function NewTaskModal() {
  const router = useRouter();
  const { categories, createTask, defaultPriority } = useTasks();
  const { colors } = useTheme();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(defaultPriority || 'none');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dueDaysOffset, setDueDaysOffset] = useState<number | null>(null);

  const [checklistItems, setChecklistItems] = useState<{ text: string }[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [loading, setLoading] = useState(false);

  const prioritiesList: { label: string; value: TaskPriority; color: string }[] = [
    { label: 'None', value: 'none', color: colors.priority.none },
    { label: 'Low', value: 'low', color: colors.priority.low },
    { label: 'Medium', value: 'medium', color: colors.priority.medium },
    { label: 'High', value: 'high', color: colors.priority.high },
    { label: 'Urgent', value: 'urgent', color: colors.priority.urgent },
  ];

  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    setChecklistItems([...checklistItems, { text: newChecklistText.trim() }]);
    setNewChecklistText('');
  };

  const handleRemoveChecklistItem = (index: number) => {
    setChecklistItems(checklistItems.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a task title.');
      return;
    }

    setLoading(true);

    let dueAt: Date | null = null;
    if (dueDaysOffset !== null) {
      dueAt = new Date();
      dueAt.setDate(dueAt.getDate() + dueDaysOffset);
      dueAt.setHours(18, 0, 0, 0);
    }

    try {
      await createTask({
        title: title.trim(),
        description: description.trim(),
        priority,
        category: selectedCategory || null,
        dueAt: dueAt ? dueAt.toISOString() : null,
        checklist: checklistItems.map((item, idx) => ({
          text: item.text,
          isCompleted: false,
          position: idx,
        })),
        status: 'todo',
      });

      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.card }]}>
      <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>New Task</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading || !title.trim()}
          style={[
            styles.saveBtn,
            { backgroundColor: colors.primary },
            (!title.trim() || loading) && styles.saveBtnDisabled,
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Title Input */}
        <TextInput
          style={[styles.titleInput, { color: colors.text }]}
          placeholder="What needs to be done?"
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={setTitle}
          autoFocus
        />

        {/* Description Input */}
        <TextInput
          style={[styles.descInput, { color: colors.text }]}
          placeholder="Add notes, details, or context..."
          placeholderTextColor={colors.textMuted}
          multiline
          value={description}
          onChangeText={setDescription}
        />

        {/* Priority Picker */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Priority</Text>
        <View style={styles.priorityRow}>
          {prioritiesList.map((p) => {
            const isSelected = priority === p.value;
            return (
              <TouchableOpacity
                key={p.value}
                style={[
                  styles.priorityBtn,
                  { backgroundColor: colors.inputBackground, borderColor: colors.cardBorder },
                  isSelected && { backgroundColor: `${p.color}25`, borderColor: p.color },
                ]}
                onPress={() => setPriority(p.value)}
              >
                <View style={[styles.priorityDot, { backgroundColor: p.color }]} />
                <Text
                  style={[
                    styles.priorityText,
                    { color: colors.textSecondary },
                    isSelected && { color: p.color, fontWeight: '700' },
                  ]}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Due Date Shortcut Options */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Due Date</Text>
        <View style={styles.dueDateRow}>
          {[
            { label: 'None', offset: null },
            { label: 'Today', offset: 0 },
            { label: 'Tomorrow', offset: 1 },
            { label: 'Next Week', offset: 7 },
          ].map((d) => {
            const isSelected = dueDaysOffset === d.offset;
            return (
              <TouchableOpacity
                key={d.label}
                style={[
                  styles.dueDateBtn,
                  { backgroundColor: colors.inputBackground, borderColor: colors.cardBorder },
                  isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => setDueDaysOffset(d.offset)}
              >
                <Text
                  style={[
                    styles.dueDateText,
                    { color: colors.textSecondary },
                    isSelected && { color: '#FFFFFF', fontWeight: '700' },
                  ]}
                >
                  {d.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Category Picker */}
        {categories.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Category</Text>
            <View style={styles.categoryRow}>
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat._id;
                return (
                  <TouchableOpacity
                    key={cat._id}
                    style={[
                      styles.categoryBtn,
                      { backgroundColor: colors.inputBackground, borderColor: colors.cardBorder },
                      isSelected && {
                        backgroundColor: cat.color || colors.primary,
                        borderColor: cat.color || colors.primary,
                      },
                    ]}
                    onPress={() => setSelectedCategory(isSelected ? null : cat._id)}
                  >
                    <Text
                      style={[
                        styles.categoryBtnText,
                        { color: colors.textSecondary },
                        isSelected && { color: '#FFFFFF', fontWeight: '700' },
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* Checklist */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Checklist Items</Text>
        {checklistItems.map((item, index) => (
          <View
            key={index}
            style={[styles.checklistItem, { borderBottomColor: colors.cardBorder }]}
          >
            <Ionicons name="checkbox-outline" size={18} color={colors.textMuted} />
            <Text style={[styles.checklistText, { color: colors.text }]}>{item.text}</Text>
            <TouchableOpacity onPress={() => handleRemoveChecklistItem(index)}>
              <Ionicons name="close-circle" size={18} color={colors.danger} />
            </TouchableOpacity>
          </View>
        ))}

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
            placeholder="Add a sub-item..."
            placeholderTextColor={colors.textMuted}
            value={newChecklistText}
            onChangeText={setNewChecklistText}
            onSubmitEditing={handleAddChecklistItem}
          />
          <TouchableOpacity
            style={[styles.addChecklistBtn, { backgroundColor: colors.primary }]}
            onPress={handleAddChecklistItem}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  saveBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  descInput: {
    fontSize: 15,
    minHeight: 60,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priorityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  priorityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dueDateRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  dueDateBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  dueDateText: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  categoryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  categoryBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  checklistText: {
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
  },
  addChecklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  checklistInput: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  addChecklistBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
