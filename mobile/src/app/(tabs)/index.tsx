import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { useTheme } from '../../context/ThemeContext';
import TaskCard from '../../components/TaskCard';
import EmptyState from '../../components/EmptyState';

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'todo', label: 'To Do' },
  { key: 'inbox', label: 'Inbox' },
  { key: 'completed', label: 'Done' },
];

export default function TasksScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const {
    tasks,
    categories,
    toggleTaskStatus,
    refreshing,
    refreshAll,
    taskView,
    setTaskView,
    hideCompleted,
    syncStatus,
    syncNow,
  } = useTasks();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Hide completed check
      if (hideCompleted && task.status === 'completed' && selectedStatus !== 'completed') {
        return false;
      }

      // Status filter
      if (selectedStatus === 'todo' && task.status === 'completed') return false;
      if (selectedStatus === 'inbox' && task.status !== 'inbox') return false;
      if (selectedStatus === 'completed' && task.status !== 'completed') return false;

      // Category filter
      if (selectedCategory) {
        const catId =
          typeof task.category === 'object' && task.category ? task.category._id : task.category;
        if (catId !== selectedCategory) return false;
      }

      // Search filter
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(query);
        const matchDesc = task.description?.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc) return false;
      }

      return true;
    });
  }, [tasks, selectedStatus, selectedCategory, search, hideCompleted]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, { color: colors.text }]}>
              Hello, {user?.fullName?.split(' ')[0] || 'There'} 👋
            </Text>
            <View style={styles.syncRow}>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {tasks.filter((t) => t.status !== 'completed').length} pending tasks
              </Text>
              {syncStatus !== 'idle' && (
                <View style={styles.syncBadge}>
                  {syncStatus === 'syncing' ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : syncStatus === 'synced' ? (
                    <Ionicons name="cloud-done-outline" size={14} color={colors.success} />
                  ) : (
                    <Ionicons name="cloud-offline-outline" size={14} color={colors.danger} />
                  )}
                </View>
              )}
            </View>
          </View>

          <View style={styles.headerRight}>
            {/* View mode toggle (List vs Compact) */}
            <TouchableOpacity
              style={[
                styles.iconActionBtn,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}
              onPress={() => setTaskView(taskView === 'list' ? 'compact' : 'list')}
              accessibilityLabel="Toggle View Mode"
            >
              <Ionicons
                name={taskView === 'list' ? 'reorder-four' : 'list-outline'}
                size={20}
                color={colors.text}
              />
            </TouchableOpacity>

            {/* Quick Sync */}
            <TouchableOpacity
              style={[
                styles.iconActionBtn,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}
              onPress={syncNow}
              accessibilityLabel="Sync Now"
            >
              <Ionicons name="sync-outline" size={18} color={colors.text} />
            </TouchableOpacity>

            {/* Add Task */}
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/modal/new-task')}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search bar */}
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          <Ionicons
            name="search-outline"
            size={18}
            color={colors.textMuted}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search tasks, descriptions..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Status filter tabs */}
        <View style={[styles.statusTabs, { backgroundColor: colors.inputBackground }]}>
          {STATUS_FILTERS.map((tab) => {
            const isActive = selectedStatus === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.statusTab,
                  isActive && [styles.statusTabActive, { backgroundColor: colors.card }],
                ]}
                onPress={() => setSelectedStatus(tab.key)}
              >
                <Text
                  style={[
                    styles.statusTabText,
                    { color: colors.textSecondary },
                    isActive && [styles.statusTabTextActive, { color: colors.primary }],
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Category horizontal filter pills */}
        {categories.length > 0 && (
          <View style={styles.categoryScrollContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryPills}
            >
              <TouchableOpacity
                style={[
                  styles.categoryPill,
                  { backgroundColor: colors.card, borderColor: colors.cardBorder },
                  selectedCategory === null && {
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => setSelectedCategory(null)}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    { color: colors.textSecondary },
                    selectedCategory === null && { color: '#FFFFFF', fontWeight: '700' },
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>

              {categories.map((cat) => {
                const isSelected = selectedCategory === cat._id;
                return (
                  <TouchableOpacity
                    key={cat._id}
                    style={[
                      styles.categoryPill,
                      { backgroundColor: colors.card, borderColor: colors.cardBorder },
                      isSelected && {
                        backgroundColor: cat.color || colors.primary,
                        borderColor: cat.color || colors.primary,
                      },
                    ]}
                    onPress={() => setSelectedCategory(isSelected ? null : cat._id)}
                  >
                    <View
                      style={[
                        styles.catDot,
                        { backgroundColor: isSelected ? '#FFFFFF' : cat.color || colors.primary },
                      ]}
                    />
                    <Text
                      style={[
                        styles.categoryPillText,
                        { color: colors.textSecondary },
                        isSelected && { color: '#FFFFFF', fontWeight: '700' },
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Task List */}
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshAll}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              compact={taskView === 'compact'}
              onPress={() => router.push(`/task/${item._id}` as any)}
              onToggleStatus={() => toggleTaskStatus(item)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="checkbox-outline"
              title="No Tasks Found"
              subtitle={
                search
                  ? 'No tasks match your search query.'
                  : 'You have no tasks in this view. Tap + to add one!'
              }
            />
          }
        />
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
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 6,
  },
  subtitle: {
    fontSize: 13,
  },
  syncBadge: {
    marginLeft: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  statusTabs: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    marginBottom: 12,
  },
  statusTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 8,
  },
  statusTabActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  statusTabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusTabTextActive: {
    fontWeight: '700',
  },
  categoryScrollContainer: {
    marginBottom: 12,
  },
  categoryPills: {
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  catDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  listContent: {
    paddingBottom: 24,
  },
});
