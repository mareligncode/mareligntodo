import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { useTheme, ThemeMode } from '../../context/ThemeContext';
import { ACCENT_PRESETS } from '../../theme/colors';
import {
  getCustomApiUrl,
  setCustomApiUrl,
  DEFAULT_API_URL,
  request,
} from '../../services/api';
import { TaskPriority } from '../../types';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, settings, logout, updateProfile, updateSettings } = useAuth();
  const { colors, themeMode, setThemeMode, accentColor, setAccentColor } = useTheme();
  const {
    tasks,
    habits,
    goals,
    taskView,
    setTaskView,
    hideCompleted,
    setHideCompleted,
    defaultPriority,
    setDefaultPriority,
    syncStatus,
    syncNow,
  } = useTasks();

  // Server & Connection State
  const [apiUrl, setApiUrl] = useState(getCustomApiUrl());
  const [editingUrl, setEditingUrl] = useState(false);
  const [pingStatus, setPingStatus] = useState<'testing' | 'online' | 'offline'>('testing');
  const [pingLatency, setPingLatency] = useState<number | null>(null);

  // Edit Profile Modal
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [editFullName, setEditFullName] = useState(user?.fullName || '');
  const [editAvatarUrl, setEditAvatarUrl] = useState(user?.avatarUrl || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Notification Preferences
  const [pushEnabled, setPushEnabled] = useState(settings?.notifications?.pushEnabled ?? true);
  const [emailEnabled, setEmailEnabled] = useState(settings?.notifications?.emailEnabled ?? true);
  const [quietHours, setQuietHours] = useState(settings?.notifications?.quietHoursEnabled ?? false);

  // Test backend connection on load
  const checkConnection = async (targetUrl = apiUrl) => {
    setPingStatus('testing');
    const start = Date.now();
    try {
      const url = `${targetUrl}/health`;
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'ngrok-skip-browser-warning': 'true' },
      });
      if (res.ok) {
        setPingLatency(Date.now() - start);
        setPingStatus('online');
      } else {
        setPingStatus('offline');
        setPingLatency(null);
      }
    } catch {
      setPingStatus('offline');
      setPingLatency(null);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const handleSaveApiUrl = async () => {
    try {
      await setCustomApiUrl(apiUrl);
      setEditingUrl(false);
      checkConnection(apiUrl);
      Alert.alert('Server Updated', `Connecting to: ${apiUrl}`);
    } catch {
      Alert.alert('Error', 'Failed to update Server URL');
    }
  };

  const handleTogglePush = async (val: boolean) => {
    setPushEnabled(val);
    await updateSettings({ notifications: { ...settings?.notifications, pushEnabled: val } });
  };

  const handleToggleEmail = async (val: boolean) => {
    setEmailEnabled(val);
    await updateSettings({ notifications: { ...settings?.notifications, emailEnabled: val } });
  };

  const handleToggleQuietHours = async (val: boolean) => {
    setQuietHours(val);
    await updateSettings({ notifications: { ...settings?.notifications, quietHoursEnabled: val } });
  };

  const handleSaveProfile = async () => {
    if (!editFullName.trim()) {
      Alert.alert('Required', 'Full name is required.');
      return;
    }
    setSavingProfile(true);
    try {
      await updateProfile({
        fullName: editFullName.trim(),
        avatarUrl: editAvatarUrl.trim() || null,
      });
      setProfileModalVisible(false);
      Alert.alert('Profile Saved', 'Your user details have been updated.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login' as any);
        },
      },
    ]);
  };

  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const completedGoals = goals.filter((g) => g.status === 'completed').length;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Title */}
        <View style={styles.topHeader}>
          <Text style={[styles.screenTitle, { color: colors.text }]}>Settings & Controls</Text>
          <Text style={[styles.screenSubtitle, { color: colors.textSecondary }]}>
            Configure theme, defaults, notifications, and sync engine
          </Text>
        </View>

        {/* User Card */}
        <View
          style={[
            styles.userCard,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          <View style={styles.userRow}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {user?.fullName ? user.fullName[0].toUpperCase() : 'U'}
              </Text>
            </View>

            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.text }]}>
                {user?.fullName || 'User'}
              </Text>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
                {user?.email || 'email@example.com'}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.editProfileBtn, { backgroundColor: colors.primaryLight }]}
              onPress={() => {
                setEditFullName(user?.fullName || '');
                setEditAvatarUrl(user?.avatarUrl || '');
                setProfileModalVisible(true);
              }}
            >
              <Ionicons name="create-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Quick Metrics */}
          <View style={[styles.statsRow, { borderTopColor: colors.cardBorder }]}>
            <View style={styles.statCol}>
              <Text style={[styles.statNum, { color: colors.primary }]}>{tasks.length}</Text>
              <Text style={[styles.statLbl, { color: colors.textSecondary }]}>Total Tasks</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.cardBorder }]} />
            <View style={styles.statCol}>
              <Text style={[styles.statNum, { color: colors.success }]}>{completedTasks}</Text>
              <Text style={[styles.statLbl, { color: colors.textSecondary }]}>Done</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.cardBorder }]} />
            <View style={styles.statCol}>
              <Text style={[styles.statNum, { color: colors.accent }]}>{habits.length}</Text>
              <Text style={[styles.statLbl, { color: colors.textSecondary }]}>Habits</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.cardBorder }]} />
            <View style={styles.statCol}>
              <Text style={[styles.statNum, { color: colors.warning }]}>{completedGoals}</Text>
              <Text style={[styles.statLbl, { color: colors.textSecondary }]}>Goals</Text>
            </View>
          </View>
        </View>

        {/* 1. APPEARANCE & THEME SECTION */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Appearance & System Theme
          </Text>

          <View
            style={[
              styles.sectionCard,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            {/* Theme Mode Selector (System / Light / Dark) */}
            <Text style={[styles.settingLabel, { color: colors.text, marginBottom: 10 }]}>
              Color Theme Mode
            </Text>
            <View style={[styles.themePills, { backgroundColor: colors.inputBackground }]}>
              {(
                [
                  { key: 'system', label: 'System', icon: 'phone-portrait-outline' },
                  { key: 'light', label: 'Light', icon: 'sunny-outline' },
                  { key: 'dark', label: 'Dark', icon: 'moon-outline' },
                ] as const
              ).map((mode) => {
                const isSelected = themeMode === mode.key;
                return (
                  <TouchableOpacity
                    key={mode.key}
                    style={[
                      styles.themePill,
                      isSelected && [styles.themePillActive, { backgroundColor: colors.card }],
                    ]}
                    onPress={() => setThemeMode(mode.key as ThemeMode)}
                  >
                    <Ionicons
                      name={mode.icon as any}
                      size={16}
                      color={isSelected ? colors.primary : colors.textSecondary}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.themePillText,
                        { color: colors.textSecondary },
                        isSelected && [styles.themePillTextActive, { color: colors.primary }],
                      ]}
                    >
                      {mode.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Accent Color Palette */}
            <Text
              style={[
                styles.settingLabel,
                { color: colors.text, marginTop: 16, marginBottom: 10 },
              ]}
            >
              App Accent Color
            </Text>
            <View style={styles.accentRow}>
              {ACCENT_PRESETS.map((preset) => {
                const isSelected = accentColor.toLowerCase() === preset.color.toLowerCase();
                return (
                  <TouchableOpacity
                    key={preset.name}
                    style={[
                      styles.accentBtn,
                      { backgroundColor: preset.color },
                      isSelected && styles.accentBtnSelected,
                    ]}
                    onPress={() => setAccentColor(preset.color)}
                  >
                    {isSelected && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* 2. TASK & DISPLAY DEFAULTS SECTION */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Task Defaults & Display
          </Text>

          <View
            style={[
              styles.sectionCard,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            {/* Default Task View */}
            <View style={styles.controlRow}>
              <View style={styles.controlText}>
                <Text style={[styles.controlTitle, { color: colors.text }]}>Default View</Text>
                <Text style={[styles.controlSubtitle, { color: colors.textSecondary }]}>
                  Choose standard cards or compact rows
                </Text>
              </View>
              <View style={[styles.viewSwitch, { backgroundColor: colors.inputBackground }]}>
                <TouchableOpacity
                  style={[
                    styles.viewOption,
                    taskView === 'list' && [styles.viewOptionActive, { backgroundColor: colors.card }],
                  ]}
                  onPress={() => setTaskView('list')}
                >
                  <Text
                    style={[
                      styles.viewOptionText,
                      { color: colors.textSecondary },
                      taskView === 'list' && { color: colors.primary, fontWeight: '700' },
                    ]}
                  >
                    List
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.viewOption,
                    taskView === 'compact' && [
                      styles.viewOptionActive,
                      { backgroundColor: colors.card },
                    ],
                  ]}
                  onPress={() => setTaskView('compact')}
                >
                  <Text
                    style={[
                      styles.viewOptionText,
                      { color: colors.textSecondary },
                      taskView === 'compact' && { color: colors.primary, fontWeight: '700' },
                    ]}
                  >
                    Compact
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.innerDivider, { backgroundColor: colors.cardBorder }]} />

            {/* Hide Completed Tasks Toggle */}
            <View style={styles.controlRow}>
              <View style={styles.controlText}>
                <Text style={[styles.controlTitle, { color: colors.text }]}>
                  Hide Completed Tasks
                </Text>
                <Text style={[styles.controlSubtitle, { color: colors.textSecondary }]}>
                  Only show active, pending to-dos
                </Text>
              </View>
              <Switch
                value={hideCompleted}
                onValueChange={setHideCompleted}
                trackColor={{ false: colors.inputBackground, true: colors.primaryLight }}
                thumbColor={hideCompleted ? colors.primary : '#FFFFFF'}
              />
            </View>

            <View style={[styles.innerDivider, { backgroundColor: colors.cardBorder }]} />

            {/* Default Priority for New Tasks */}
            <Text style={[styles.settingLabel, { color: colors.text, marginBottom: 8 }]}>
              Default Priority for New Tasks
            </Text>
            <View style={styles.prioritySelector}>
              {(['none', 'low', 'medium', 'high', 'urgent'] as TaskPriority[]).map((p) => {
                const isSelected = defaultPriority === p;
                const pColor = colors.priority[p];
                return (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.pBtn,
                      { backgroundColor: colors.inputBackground, borderColor: colors.cardBorder },
                      isSelected && { backgroundColor: `${pColor}25`, borderColor: pColor },
                    ]}
                    onPress={() => setDefaultPriority(p)}
                  >
                    <Text
                      style={[
                        styles.pBtnText,
                        { color: colors.textSecondary },
                        isSelected && { color: pColor, fontWeight: '700' },
                      ]}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* 3. NOTIFICATIONS & ALERTS SECTION */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Notifications & Quiet Hours
          </Text>

          <View
            style={[
              styles.sectionCard,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            <View style={styles.controlRow}>
              <View style={styles.controlText}>
                <Text style={[styles.controlTitle, { color: colors.text }]}>
                  Push Notifications
                </Text>
                <Text style={[styles.controlSubtitle, { color: colors.textSecondary }]}>
                  Task dues, reminders, and checklist alerts
                </Text>
              </View>
              <Switch
                value={pushEnabled}
                onValueChange={handleTogglePush}
                trackColor={{ false: colors.inputBackground, true: colors.primaryLight }}
                thumbColor={pushEnabled ? colors.primary : '#FFFFFF'}
              />
            </View>

            <View style={[styles.innerDivider, { backgroundColor: colors.cardBorder }]} />

            <View style={styles.controlRow}>
              <View style={styles.controlText}>
                <Text style={[styles.controlTitle, { color: colors.text }]}>
                  Email Digest & Alerts
                </Text>
                <Text style={[styles.controlSubtitle, { color: colors.textSecondary }]}>
                  Weekly overview and scheduled emails
                </Text>
              </View>
              <Switch
                value={emailEnabled}
                onValueChange={handleToggleEmail}
                trackColor={{ false: colors.inputBackground, true: colors.primaryLight }}
                thumbColor={emailEnabled ? colors.primary : '#FFFFFF'}
              />
            </View>

            <View style={[styles.innerDivider, { backgroundColor: colors.cardBorder }]} />

            <View style={styles.controlRow}>
              <View style={styles.controlText}>
                <Text style={[styles.controlTitle, { color: colors.text }]}>
                  Quiet Hours (22:00 – 07:00)
                </Text>
                <Text style={[styles.controlSubtitle, { color: colors.textSecondary }]}>
                  Mute non-urgent notifications during sleep
                </Text>
              </View>
              <Switch
                value={quietHours}
                onValueChange={handleToggleQuietHours}
                trackColor={{ false: colors.inputBackground, true: colors.primaryLight }}
                thumbColor={quietHours ? colors.primary : '#FFFFFF'}
              />
            </View>
          </View>
        </View>

        {/* 4. SYNC & DATA CONTROLS */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Sync & Storage Engine
          </Text>

          <View
            style={[
              styles.sectionCard,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            <View style={styles.controlRow}>
              <View style={styles.controlText}>
                <Text style={[styles.controlTitle, { color: colors.text }]}>Offline Sync</Text>
                <Text style={[styles.controlSubtitle, { color: colors.textSecondary }]}>
                  Replicate local changes with MongoDB backend
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.syncNowBtn,
                  { backgroundColor: colors.primary },
                  syncStatus === 'syncing' && { opacity: 0.7 },
                ]}
                onPress={syncNow}
                disabled={syncStatus === 'syncing'}
              >
                {syncStatus === 'syncing' ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.syncNowText}>Sync Now</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 5. BACKEND CONNECTION & SERVER HEALTH */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Backend Connectivity
          </Text>

          <View
            style={[
              styles.sectionCard,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            {/* Status & Latency Probe */}
            <View style={styles.pingRow}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      pingStatus === 'online'
                        ? colors.success
                        : pingStatus === 'testing'
                        ? colors.warning
                        : colors.danger,
                  },
                ]}
              />
              <Text style={[styles.pingLabel, { color: colors.text }]}>
                {pingStatus === 'online'
                  ? `Connected (${pingLatency} ms)`
                  : pingStatus === 'testing'
                  ? 'Testing connection...'
                  : 'Server unreachable'}
              </Text>
              <TouchableOpacity onPress={() => checkConnection()}>
                <Ionicons name="refresh" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Editable Server URL */}
            <View style={styles.urlSection}>
              <Text style={[styles.controlSubtitle, { color: colors.textSecondary, marginBottom: 6 }]}>
                API Endpoint URL:
              </Text>
              {editingUrl ? (
                <View style={styles.editUrlRow}>
                  <TextInput
                    style={[
                      styles.urlInput,
                      {
                        backgroundColor: colors.inputBackground,
                        color: colors.text,
                        borderColor: colors.inputBorder,
                      },
                    ]}
                    value={apiUrl}
                    onChangeText={setApiUrl}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={[styles.saveUrlBtn, { backgroundColor: colors.success }]}
                    onPress={handleSaveApiUrl}
                  >
                    <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.urlBox,
                    { backgroundColor: colors.inputBackground, borderColor: colors.cardBorder },
                  ]}
                  onPress={() => setEditingUrl(true)}
                >
                  <Text style={[styles.urlText, { color: colors.text }]} numberOfLines={1}>
                    {apiUrl}
                  </Text>
                  <Ionicons name="pencil-outline" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Quick Presets */}
            {editingUrl && (
              <View style={styles.presetsRow}>
                <TouchableOpacity
                  style={[styles.presetBtn, { backgroundColor: colors.inputBackground }]}
                  onPress={() => setApiUrl('https://myong-inapproachable-oliva.ngrok-free.dev/api')}
                >
                  <Text style={[styles.presetBtnText, { color: colors.textSecondary }]}>
                    Ngrok Tunnel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.presetBtn, { backgroundColor: colors.inputBackground }]}
                  onPress={() => setApiUrl('http://localhost:5000/api')}
                >
                  <Text style={[styles.presetBtnText, { color: colors.textSecondary }]}>
                    Localhost
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.presetBtn, { backgroundColor: colors.inputBackground }]}
                  onPress={() => setApiUrl('http://10.0.2.2:5000/api')}
                >
                  <Text style={[styles.presetBtnText, { color: colors.textSecondary }]}>
                    10.0.2.2 (Android)
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* 6. SIGN OUT */}
        <TouchableOpacity
          style={[
            styles.logoutButton,
            { backgroundColor: colors.dangerLight, borderColor: `${colors.danger}40` },
          ]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.danger} style={{ marginRight: 8 }} />
          <Text style={[styles.logoutText, { color: colors.danger }]}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={[styles.versionText, { color: colors.textMuted }]}>
          Marelign Todo • System Theme & Control Center v2.0
        </Text>

        {/* Edit Profile Modal */}
        <Modal
          visible={profileModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setProfileModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
              <View style={styles.modalTop}>
                <Text style={[styles.modalHeadTitle, { color: colors.text }]}>Edit Profile</Text>
                <TouchableOpacity onPress={() => setProfileModalVisible(false)}>
                  <Ionicons name="close" size={24} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.modalFieldLabel, { color: colors.text }]}>Full Name</Text>
              <TextInput
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: colors.inputBackground,
                    color: colors.text,
                    borderColor: colors.inputBorder,
                  },
                ]}
                value={editFullName}
                onChangeText={setEditFullName}
              />

              <Text style={[styles.modalFieldLabel, { color: colors.text }]}>Avatar URL (Optional)</Text>
              <TextInput
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: colors.inputBackground,
                    color: colors.text,
                    borderColor: colors.inputBorder,
                  },
                ]}
                placeholder="https://..."
                placeholderTextColor={colors.textMuted}
                value={editAvatarUrl}
                onChangeText={setEditAvatarUrl}
              />

              <TouchableOpacity
                style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]}
                onPress={handleSaveProfile}
                disabled={savingProfile}
              >
                {savingProfile ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSaveText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  topHeader: {
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: 13,
    marginTop: 3,
  },
  userCard: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  editProfileBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    marginTop: 16,
    paddingTop: 12,
    alignItems: 'center',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLbl: {
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  themePills: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  themePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
  },
  themePillActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  themePillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  themePillTextActive: {
    fontWeight: '700',
  },
  accentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  accentBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accentBtnSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlText: {
    flex: 1,
    marginRight: 12,
  },
  controlTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  controlSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  viewSwitch: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
  },
  viewOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewOptionActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  viewOptionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  innerDivider: {
    height: 1,
    marginVertical: 14,
  },
  prioritySelector: {
    flexDirection: 'row',
    gap: 6,
  },
  pBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  pBtnText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  syncNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  syncNowText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  pingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  pingLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  urlSection: {
    marginTop: 4,
  },
  urlBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  urlText: {
    flex: 1,
    fontSize: 13,
    marginRight: 8,
  },
  editUrlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  urlInput: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 13,
  },
  saveUrlBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  presetBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    borderRadius: 14,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalHeadTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalFieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 6,
  },
  modalInput: {
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  modalSaveBtn: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
