import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit } from '../types';
import { useTheme } from '../context/ThemeContext';

interface HabitCardProps {
  habit: Habit;
  onToggle: () => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, onToggle }) => {
  const { colors } = useTheme();
  const isCompletedToday = !!habit.todayEntry;
  const habitColor = habit.color || colors.success;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{habit.title}</Text>
          <View style={[styles.frequencyBadge, { backgroundColor: `${habitColor}20` }]}>
            <Text style={[styles.frequencyText, { color: habitColor }]}>
              {habit.schedule.frequency}
            </Text>
          </View>
        </View>

        {habit.description ? (
          <Text
            style={[styles.description, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {habit.description}
          </Text>
        ) : null}

        {habit.reminderTime ? (
          <View style={styles.metaRow}>
            <Ionicons name="alarm-outline" size={13} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {habit.reminderTime}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Completion toggle button */}
      <TouchableOpacity
        style={[
          styles.checkButton,
          isCompletedToday
            ? { backgroundColor: habitColor, borderColor: habitColor }
            : { borderColor: colors.cardBorder, backgroundColor: colors.inputBackground },
        ]}
        activeOpacity={0.7}
        onPress={onToggle}
      >
        <Ionicons
          name={isCompletedToday ? 'checkmark' : 'ellipse-outline'}
          size={24}
          color={isCompletedToday ? '#FFFFFF' : colors.textMuted}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  frequencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  frequencyText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 13,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  metaText: {
    fontSize: 12,
  },
  checkButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HabitCard;
