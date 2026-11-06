import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '../../context/TaskContext';
import { useTheme } from '../../context/ThemeContext';
import EmptyState from '../../components/EmptyState';

export default function NotificationsScreen() {
  const {
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    fetchNotifications,
    refreshing,
  } = useTasks();
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Notifications</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {unreadNotificationCount} unread reminder(s)
            </Text>
          </View>

          {unreadNotificationCount > 0 && (
            <TouchableOpacity
              style={[styles.markAllButton, { backgroundColor: colors.primaryLight }]}
              onPress={markAllNotificationsAsRead}
            >
              <Text style={[styles.markAllText, { color: colors.primary }]}>Mark all as read</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notifications List */}
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchNotifications}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => {
            const isUnread = !item.readAt;
            return (
              <TouchableOpacity
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.card,
                    borderColor: isUnread ? colors.primary : colors.cardBorder,
                  },
                  isUnread && {
                    backgroundColor: isDark ? '#1C1938' : '#FAF5FF',
                  },
                ]}
                activeOpacity={0.7}
                onPress={() => isUnread && markNotificationAsRead(item._id)}
              >
                <View style={styles.row}>
                  <View
                    style={[
                      styles.iconCircle,
                      {
                        backgroundColor: isUnread ? colors.primaryLight : colors.inputBackground,
                      },
                    ]}
                  >
                    <Ionicons
                      name={isUnread ? 'notifications' : 'notifications-outline'}
                      size={20}
                      color={isUnread ? colors.primary : colors.textMuted}
                    />
                  </View>

                  <View style={styles.content}>
                    <Text
                      style={[
                        styles.itemTitle,
                        { color: colors.text },
                        isUnread && { color: colors.primary, fontWeight: '700' },
                      ]}
                    >
                      {item.title}
                    </Text>
                    {item.body ? (
                      <Text style={[styles.itemBody, { color: colors.textSecondary }]}>
                        {item.body}
                      </Text>
                    ) : null}
                    <Text style={[styles.itemDate, { color: colors.textMuted }]}>
                      {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>

                  {isUnread && (
                    <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <EmptyState
              icon="notifications-off-outline"
              title="All Caught Up"
              subtitle="You have no notifications or reminder alerts at this time."
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
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  markAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemBody: {
    fontSize: 13,
    marginTop: 2,
  },
  itemDate: {
    fontSize: 11,
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
    marginTop: 6,
  },
});
