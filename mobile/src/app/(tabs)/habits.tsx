import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '../../context/TaskContext';
import { useTheme } from '../../context/ThemeContext';
import HabitCard from '../../components/HabitCard';
import EmptyState from '../../components/EmptyState';

export default function HabitsScreen() {
  const { habits, toggleHabit, createHabit, refreshing, fetchHabits } = useTasks();
  const { colors } = useTheme();

  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [reminderTime, setReminderTime] = useState('08:00');
  const [color, setColor] = useState('#10B981');

  const completedTodayCount = habits.filter((h) => !!h.todayEntry).length;

  const handleCreateHabit = async () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a habit title.');
      return;
    }

    try {
      await createHabit({
        title: title.trim(),
        description: description.trim(),
        schedule: { frequency, interval: 1, daysOfWeek: [], targetCount: 1 },
        reminderTime,
        color,
      });

      setTitle('');
      setDescription('');
      setModalVisible(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create habit.');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Daily Habits</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {completedTodayCount} of {habits.length} completed today
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.success }]}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Habits List */}
        <FlatList
          data={habits}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchHabits}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => (
            <HabitCard
              habit={item}
              onToggle={() => toggleHabit(item._id, !!item.todayEntry)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="repeat-outline"
              title="No Habits Yet"
              subtitle="Build good routines! Tap + to create your first recurring habit."
            />
          }
        />

        {/* Create Habit Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>New Habit</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.label, { color: colors.text }]}>Habit Name</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.inputBackground,
                    color: colors.text,
                    borderColor: colors.inputBorder,
                  },
                ]}
                placeholder="e.g., Morning Meditation, Read 20 mins"
                placeholderTextColor={colors.textMuted}
                value={title}
                onChangeText={setTitle}
              />

              <Text style={[styles.label, { color: colors.text }]}>Description (Optional)</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.inputBackground,
                    color: colors.text,
                    borderColor: colors.inputBorder,
                  },
                ]}
                placeholder="Why is this habit important?"
                placeholderTextColor={colors.textMuted}
                value={description}
                onChangeText={setDescription}
              />

              <Text style={[styles.label, { color: colors.text }]}>Frequency</Text>
              <View style={styles.frequencyPicker}>
                {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                  <TouchableOpacity
                    key={freq}
                    style={[
                      styles.freqButton,
                      { backgroundColor: colors.inputBackground },
                      frequency === freq && { backgroundColor: colors.success },
                    ]}
                    onPress={() => setFrequency(freq)}
                  >
                    <Text
                      style={[
                        styles.freqText,
                        { color: colors.textSecondary },
                        frequency === freq && { color: '#FFFFFF', fontWeight: '700' },
                      ]}
                    >
                      {freq}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.success }]}
                onPress={handleCreateHabit}
                activeOpacity={0.8}
              >
                <Text style={styles.saveButtonText}>Create Habit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  listContent: {
    paddingBottom: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 46,
    fontSize: 14,
  },
  frequencyPicker: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    marginBottom: 20,
  },
  freqButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  freqText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  saveButton: {
    borderRadius: 14,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
