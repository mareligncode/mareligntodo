import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Goal } from '../types';
import { useTheme } from '../context/ThemeContext';

interface GoalCardProps {
  goal: Goal;
  onIncrement: () => void;
  onDecrement: () => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onIncrement, onDecrement }) => {
  const { colors } = useTheme();
  const percentage =
    goal.targetValue > 0
      ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
      : 0;

  const isCompleted = goal.status === 'completed' || percentage >= 100;
  const goalColor = goal.color || colors.primary;

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
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>{goal.title}</Text>
          {goal.description ? (
            <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={1}>
              {goal.description}
            </Text>
          ) : null}
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: isCompleted ? `${colors.success}20` : `${goalColor}20` },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: isCompleted ? colors.success : goalColor },
            ]}
          >
            {isCompleted ? 'Completed' : `${percentage}%`}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressBackground, { backgroundColor: colors.inputBackground }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${percentage}%`,
              backgroundColor: isCompleted ? colors.success : goalColor,
            },
          ]}
        />
      </View>

      {/* Footer controls */}
      <View style={styles.footer}>
        <Text style={[styles.valuesText, { color: colors.textSecondary }]}>
          {goal.currentValue} / {goal.targetValue} {goal.unit || ''}
        </Text>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.stepButton, { backgroundColor: colors.inputBackground }]}
            onPress={onDecrement}
            disabled={goal.currentValue <= 0}
          >
            <Ionicons name="remove" size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.stepButton, { backgroundColor: goalColor }]}
            onPress={onIncrement}
          >
            <Ionicons name="add" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressBackground: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valuesText: {
    fontSize: 13,
    fontWeight: '700',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default GoalCard;
