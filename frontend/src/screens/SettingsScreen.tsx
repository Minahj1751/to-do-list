import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { userSettingsApi } from '../api/userSettingsApi';
import { UserSettings, Theme } from '../types';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  background: '#F6F7FB',
  card: '#FFFFFF',
  dark: '#1C1F3A',
  primary: '#6C63FF',
  primaryLight: '#EEEAFE',
  text: '#171A2B',
  muted: '#8B92A8',
  border: '#EEF0F5',
  green: '#4CD7A5',
  orange: '#FFB547',
  red: '#FF5C7A',
};

const SettingsScreen: React.FC = () => {
  const { user, logout } = useAuth();

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSettings = async () => {
    try {
      const userSettings = await userSettingsApi.getSettings();
      setSettings(userSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const handleThemeChange = async (theme: Theme) => {
    try {
      const updated = await userSettingsApi.updateSettings({ theme });
      setSettings(updated);
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  };

  const handleNotificationsToggle = async (value: boolean) => {
    try {
      const updated = await userSettingsApi.updateSettings({
        notifications_enabled: value,
      });

      setSettings(updated);
    } catch (error) {
      console.error('Error updating notifications:', error);
    }
  };

  const handleDailyGoalChange = async (goal: number) => {
    try {
      const updated = await userSettingsApi.updateSettings({
        daily_goal: goal,
      });

      setSettings(updated);
    } catch (error) {
      console.error('Error updating daily goal:', error);
    }
  };

  const getInitial = () => {
    return user?.name?.charAt(0).toUpperCase() || 'U';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingIcon}>
          <Ionicons
            name="settings-outline"
            size={28}
            color={COLORS.primary}
          />
        </View>

        <Text style={styles.loadingTitle}>Loading settings</Text>
        <Text style={styles.loadingSubtitle}>
          Preparing your preferences...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>PERSONALIZE</Text>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>
              Make your productivity experience yours.
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="options-outline"
              size={23}
              color={COLORS.primary}
            />
          </View>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.avatarText}>{getInitial()}</Text>
          </View>

          <View style={styles.profileDetails}>
            <Text style={styles.profileName}>
              {user?.name || 'User'}
            </Text>

            <Text style={styles.profileEmail}>
              {user?.email || 'No email available'}
            </Text>

            <View style={styles.accountBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.accountBadgeText}>Active account</Text>
            </View>
          </View>

          <View style={styles.profileArrow}>
            <Ionicons
              name="chevron-forward"
              size={18}
              color="rgba(255,255,255,0.55)"
            />
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <Text style={styles.sectionHint}>Customize</Text>
        </View>

        <View style={styles.settingsCard}>
          {/* Theme */}
          <View style={styles.settingItem}>
            <View style={styles.settingMain}>
              <View
                style={[
                  styles.settingIcon,
                  { backgroundColor: COLORS.primaryLight },
                ]}
              >
                <Ionicons
                  name="moon-outline"
                  size={21}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Theme</Text>
                <Text style={styles.settingDescription}>
                  Choose your preferred appearance
                </Text>
              </View>
            </View>

            <View style={styles.themeOptions}>
              {(['light', 'dark', 'system'] as Theme[]).map((theme) => {
                const isActive = settings?.theme === theme;

                return (
                  <TouchableOpacity
                    key={theme}
                    activeOpacity={0.8}
                    style={[
                      styles.themeButton,
                      isActive && styles.themeButtonActive,
                    ]}
                    onPress={() => handleThemeChange(theme)}
                  >
                    <Text
                      style={[
                        styles.themeButtonText,
                        isActive && styles.themeButtonTextActive,
                      ]}
                    >
                      {theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Notifications */}
          <View style={styles.settingItem}>
            <View style={styles.settingMain}>
              <View
                style={[
                  styles.settingIcon,
                  { backgroundColor: '#FFF3E2' },
                ]}
              >
                <Ionicons
                  name="notifications-outline"
                  size={21}
                  color={COLORS.orange}
                />
              </View>

              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Notifications</Text>
                <Text style={styles.settingDescription}>
                  Get reminders about your tasks
                </Text>
              </View>
            </View>

            <Switch
              value={settings?.notifications_enabled ?? false}
              onValueChange={handleNotificationsToggle}
              trackColor={{
                false: '#E4E7EF',
                true: COLORS.primary,
              }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E4E7EF"
            />
          </View>

          <View style={styles.divider} />

          {/* Daily Goal */}
          <View style={styles.settingItem}>
            <View style={styles.settingMain}>
              <View
                style={[
                  styles.settingIcon,
                  { backgroundColor: '#E5FAF3' },
                ]}
              >
                <Ionicons
                  name="flag-outline"
                  size={21}
                  color={COLORS.green}
                />
              </View>

              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Daily Goal</Text>
                <Text style={styles.settingDescription}>
                  Tasks you want to complete each day
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.goalContainer}>
            {[3, 5, 8, 10].map((goal) => {
              const isActive = settings?.daily_goal === goal;

              return (
                <TouchableOpacity
                  key={goal}
                  activeOpacity={0.8}
                  style={[
                    styles.goalButton,
                    isActive && styles.goalButtonActive,
                  ]}
                  onPress={() => handleDailyGoalChange(goal)}
                >
                  <Text
                    style={[
                      styles.goalNumber,
                      isActive && styles.goalNumberActive,
                    ]}
                  >
                    {goal}
                  </Text>

                  <Text
                    style={[
                      styles.goalLabel,
                      isActive && styles.goalLabelActive,
                    ]}
                  >
                    tasks
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Productivity */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Productivity</Text>
          <Text style={styles.sectionHint}>Your routine</Text>
        </View>

        <View style={styles.productivityCard}>
          <View style={styles.productivityIcon}>
            <Ionicons
              name="sparkles-outline"
              size={24}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.productivityContent}>
            <Text style={styles.productivityTitle}>
              Build better habits
            </Text>

            <Text style={styles.productivityText}>
              Set a realistic daily goal and stay consistent with your tasks.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={19}
            color={COLORS.muted}
          />
        </View>

        {/* About */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.sectionHint}>App information</Text>
        </View>

        <View style={styles.settingsCard}>
          {/* Version */}
          <View style={styles.menuItem}>
            <View style={styles.settingMain}>
              <View
                style={[
                  styles.settingIcon,
                  { backgroundColor: '#F0F1F8' },
                ]}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={21}
                  color={COLORS.muted}
                />
              </View>

              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>App Version</Text>
                <Text style={styles.settingDescription}>
                  Current application version
                </Text>
              </View>
            </View>

            <View style={styles.versionBadge}>
              <Text style={styles.versionText}>1.0.0</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Help */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.menuItem}
          >
            <View style={styles.settingMain}>
              <View
                style={[
                  styles.settingIcon,
                  { backgroundColor: '#EDEBFF' },
                ]}
              >
                <Ionicons
                  name="help-circle-outline"
                  size={21}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>
                  Help & Support
                </Text>
                <Text style={styles.settingDescription}>
                  Get help with the application
                </Text>
              </View>
            </View>

            <Ionicons
              name="chevron-forward"
              size={19}
              color={COLORS.muted}
            />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <View style={styles.logoutIcon}>
            <Ionicons
              name="log-out-outline"
              size={21}
              color={COLORS.red}
            />
          </View>

          <View style={styles.logoutTextContainer}>
            <Text style={styles.logoutText}>Log Out</Text>
            <Text style={styles.logoutSubtext}>
              Sign out of your account
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={19}
            color={COLORS.red}
          />
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Smart To-Do List Tracker
        </Text>

        <Text style={styles.footerVersion}>
          Made for better productivity
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },

  /* Loading */

  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  loadingIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },

  loadingTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },

  loadingSubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.muted,
  },

  /* Header */

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },

  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: COLORS.primary,
    marginBottom: 5,
  },

  title: {
    fontSize: 31,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.7,
  },

  subtitle: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 5,
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1C1F3A',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  /* Profile */

  profileCard: {
    minHeight: 115,
    borderRadius: 24,
    backgroundColor: COLORS.dark,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: '#1C1F3A',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
  },

  profileAvatar: {
    width: 62,
    height: 62,
    borderRadius: 21,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  avatarText: {
    fontSize: 25,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  profileDetails: {
    flex: 1,
  },

  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  profileEmail: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.58)',
    marginTop: 4,
  },

  accountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 9,
  },

  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.green,
    marginRight: 6,
  },

  accountBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
  },

  profileArrow: {
    marginLeft: 8,
  },

  /* Sections */

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 11,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
  },

  sectionHint: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.muted,
  },

  /* Settings card */

  settingsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 21,
    paddingHorizontal: 17,
    paddingVertical: 4,
    marginBottom: 25,
    shadowColor: '#1C1F3A',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.045,
    shadowRadius: 12,
    elevation: 2,
  },

  settingItem: {
    paddingVertical: 17,
  },

  settingMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  settingIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  settingTextContainer: {
    flex: 1,
  },

  settingLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },

  settingDescription: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 3,
    lineHeight: 16,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },

  /* Theme */

  themeOptions: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 7,
  },

  themeButton: {
    flex: 1,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#F7F8FC',
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },

  themeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  themeButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.muted,
  },

  themeButtonTextActive: {
    color: '#FFFFFF',
  },

  /* Daily Goal */

  goalContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 17,
  },

  goalButton: {
    flex: 1,
    minHeight: 58,
    borderRadius: 15,
    backgroundColor: '#F7F8FC',
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },

  goalButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  goalNumber: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
  },

  goalNumberActive: {
    color: '#FFFFFF',
  },

  goalLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.muted,
    marginTop: 2,
  },

  goalLabelActive: {
    color: 'rgba(255,255,255,0.75)',
  },

  /* Productivity */

  productivityCard: {
    backgroundColor: '#F0EEFF',
    borderRadius: 21,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },

  productivityIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  productivityContent: {
    flex: 1,
  },

  productivityTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },

  productivityText: {
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.muted,
    marginTop: 3,
  },

  /* About */

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },

  versionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
    backgroundColor: '#F2F3F8',
  },

  versionText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.muted,
  },

  /* Logout */

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F3',
    borderRadius: 20,
    padding: 15,
    marginTop: 2,
    borderWidth: 1,
    borderColor: '#FFE0E5',
  },

  logoutIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  logoutTextContainer: {
    flex: 1,
  },

  logoutText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.red,
  },

  logoutSubtext: {
    fontSize: 11,
    color: '#C98B98',
    marginTop: 3,
  },

  /* Footer */

  footerText: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.muted,
    marginTop: 28,
  },

  footerVersion: {
    textAlign: 'center',
    fontSize: 10,
    color: '#B0B5C5',
    marginTop: 4,
  },
});

export default SettingsScreen;