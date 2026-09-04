import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { analyticsApi } from '../api/analyticsApi';
import { taskApi } from '../api/taskApi';
import { DashboardStats, Task } from '../types';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();

  const [dashboardStats, setDashboardStats] =
    useState<DashboardStats | null>(null);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [stats, tasks] = await Promise.all([
        analyticsApi.getDashboard(),
        taskApi.getToday(),
      ]);

      setDashboardStats(stats);
      setTodayTasks(tasks);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleTaskComplete = async (task: Task) => {
    try {
      if (task.status === 'completed') {
        await taskApi.markIncomplete(task.id);
      } else {
        await taskApi.markComplete(task.id);
      }

      loadData();
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    };

    return new Date().toLocaleDateString('en-US', options);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#FF5C7A';
      case 'medium':
        return '#FFB547';
      case 'low':
        return '#4CD7A5';
      default:
        return '#8B92A8';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingIcon}>
          <Ionicons name="checkmark" size={30} color="#FFFFFF" />
        </View>

        <Text style={styles.loadingTitle}>Loading your day...</Text>
        <Text style={styles.loadingSubtitle}>
          Getting everything ready for you
        </Text>
      </View>
    );
  }

  const progress = dashboardStats?.todayProgress?.percentage ?? 0;
  const completed = dashboardStats?.todayProgress?.completed ?? 0;
  const goal = dashboardStats?.todayProgress?.goal ?? 0;
  const streak = dashboardStats?.streak ?? 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6C63FF"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>{getGreeting()} 👋</Text>

            <Text style={styles.userName}>
              {user?.name || 'there'}
            </Text>

            <Text style={styles.date}>{formatDate()}</Text>
          </View>

          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.8}
          >
            <Text style={styles.profileLetter}>
              {(user?.name?.charAt(0) || 'U').toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hero Progress Card */}
        {dashboardStats && (
          <View style={styles.heroCard}>
            <View style={styles.heroTop}>
              <View>
                <Text style={styles.heroSmallTitle}>TODAY'S FOCUS</Text>

                <Text style={styles.heroTitle}>
                  Keep going!
                </Text>

                <Text style={styles.heroSubtitle}>
                  {completed} of {goal} tasks completed
                </Text>
              </View>

              <View style={styles.progressCircle}>
                <Text style={styles.progressPercentage}>
                  {Math.round(progress)}%
                </Text>

                <Text style={styles.progressLabel}>
                  done
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(Math.max(progress, 0), 100)}%`,
                  },
                ]}
              />
            </View>

            {/* Streak */}
            <View style={styles.heroBottom}>
              <View style={styles.streakIcon}>
                <Ionicons
                  name="flame"
                  size={19}
                  color="#FFB547"
                />
              </View>

              <View>
                <Text style={styles.streakTitle}>
                  {streak > 0
                    ? `${streak} day streak`
                    : 'Start your streak'}
                </Text>

                <Text style={styles.streakSubtitle}>
                  {streak > 0
                    ? 'You are on fire!'
                    : 'Complete a task today'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Tasks')}
            activeOpacity={0.8}
          >
            <View style={styles.quickIcon}>
              <Ionicons
                name="list"
                size={21}
                color="#6C63FF"
              />
            </View>

            <Text style={styles.quickText}>All Tasks</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('CreateTask')}
            activeOpacity={0.8}
          >
            <View style={styles.quickIcon}>
              <Ionicons
                name="add"
                size={22}
                color="#6C63FF"
              />
            </View>

            <Text style={styles.quickText}>New Task</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Analytics')}
            activeOpacity={0.8}
          >
            <View style={styles.quickIcon}>
              <Ionicons
                name="stats-chart"
                size={20}
                color="#6C63FF"
              />
            </View>

            <Text style={styles.quickText}>Analytics</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Tasks Header */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Today's Tasks</Text>

            <Text style={styles.sectionSubtitle}>
              {todayTasks.length === 0
                ? 'Nothing scheduled'
                : `${todayTasks.length} ${todayTasks.length === 1 ? 'task' : 'tasks'
                } for today`}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('Tasks')}
            activeOpacity={0.7}
          >
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {/* Empty State */}
        {todayTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="checkmark-done"
                size={35}
                color="#4CD7A5"
              />
            </View>

            <Text style={styles.emptyTitle}>
              All clear! 🎉
            </Text>

            <Text style={styles.emptyText}>
              You have no tasks scheduled for today.
            </Text>

            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('CreateTask')}
              activeOpacity={0.85}
            >
              <Ionicons
                name="add"
                size={18}
                color="#FFFFFF"
              />

              <Text style={styles.emptyButtonText}>
                Create a task
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.tasksContainer}>
            {todayTasks.map((task) => {
              const isCompleted = task.status === 'completed';

              return (
                <TouchableOpacity
                  key={task.id}
                  style={[
                    styles.taskCard,
                    isCompleted && styles.completedTaskCard,
                  ]}
                  onPress={() =>
                    navigation.navigate('TaskDetail', {
                      taskId: task.id,
                    })
                  }
                  activeOpacity={0.85}
                >
                  <View style={styles.taskContent}>
                    {/* Checkbox */}
                    <TouchableOpacity
                      style={[
                        styles.checkbox,
                        isCompleted && styles.checkboxChecked,
                      ]}
                      onPress={() => handleTaskComplete(task)}
                      activeOpacity={0.8}
                    >
                      {isCompleted && (
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color="#FFFFFF"
                        />
                      )}
                    </TouchableOpacity>

                    {/* Task Information */}
                    <View style={styles.taskInfo}>
                      <Text
                        numberOfLines={2}
                        style={[
                          styles.taskTitle,
                          isCompleted &&
                          styles.taskTitleCompleted,
                        ]}
                      >
                        {task.title}
                      </Text>

                      <View style={styles.taskMeta}>
                        <View
                          style={[
                            styles.priorityBadge,
                            {
                              backgroundColor: `${getPriorityColor(
                                task.priority
                              )}18`,
                            },
                          ]}
                        >
                          <View
                            style={[
                              styles.priorityDot,
                              {
                                backgroundColor:
                                  getPriorityColor(task.priority),
                              },
                            ]}
                          />

                          <Text
                            style={[
                              styles.priorityText,
                              {
                                color: getPriorityColor(
                                  task.priority
                                ),
                              },
                            ]}
                          >
                            {task.priority || 'normal'}
                          </Text>
                        </View>

                        {task.category?.name && (
                          <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>
                              {task.category.name}
                            </Text>
                          </View>
                        )}

                        {task.due_date && (
                          <View style={styles.timeContainer}>
                            <Ionicons
                              name="time-outline"
                              size={13}
                              color="#8B92A8"
                            />

                            <Text style={styles.taskTime}>
                              {new Date(
                                task.due_date
                              ).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={19}
                    color="#B0B5C4"
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Bottom Space */}
        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateTask')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F7FB',
  },

  container: {
    flex: 1,
    backgroundColor: '#F6F7FB',
  },

  contentContainer: {
    paddingTop: 12,
    paddingHorizontal: 20,
  },

  /* Loading */

  loadingContainer: {
    flex: 1,
    backgroundColor: '#F6F7FB',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  loadingIcon: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },

  loadingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#171A2B',
  },

  loadingSubtitle: {
    fontSize: 14,
    color: '#8B92A8',
    marginTop: 6,
  },

  /* Header */

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },

  headerText: {
    flex: 1,
  },

  greeting: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C63FF',
    marginBottom: 3,
  },

  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#171A2B',
    letterSpacing: -0.6,
  },

  date: {
    fontSize: 13,
    color: '#8B92A8',
    marginTop: 5,
  },

  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 17,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 5,
  },

  profileLetter: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },

  /* Hero */

  heroCard: {
    backgroundColor: '#1C1F3A',
    borderRadius: 26,
    padding: 22,
    marginBottom: 18,
    shadowColor: '#1C1F3A',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },

  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  heroSmallTitle: {
    color: '#9EA4C4',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 6,
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '800',
  },

  heroSubtitle: {
    color: '#AEB3CE',
    fontSize: 13,
    marginTop: 5,
  },

  progressCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 5,
    borderColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  progressPercentage: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },

  progressLabel: {
    color: '#AEB3CE',
    fontSize: 10,
    marginTop: 1,
  },

  progressTrack: {
    height: 8,
    borderRadius: 10,
    backgroundColor: '#303451',
    overflow: 'hidden',
    marginTop: 23,
  },

  progressFill: {
    height: '100%',
    borderRadius: 10,
    backgroundColor: '#6C63FF',
  },

  heroBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },

  streakIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: '#FFB54718',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  streakTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  streakSubtitle: {
    color: '#8F95B1',
    fontSize: 11,
    marginTop: 2,
  },

  /* Quick Actions */

  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },

  quickAction: {
    width: '31.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#171A2B',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  quickIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: '#F0EEFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 7,
  },

  quickText: {
    fontSize: 11,
    color: '#454A61',
    fontWeight: '700',
  },

  /* Section */

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#171A2B',
  },

  sectionSubtitle: {
    fontSize: 12,
    color: '#8B92A8',
    marginTop: 3,
  },

  seeAll: {
    color: '#6C63FF',
    fontSize: 13,
    fontWeight: '700',
  },

  /* Empty State */

  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 34,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#171A2B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },

  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 24,
    backgroundColor: '#EAFBF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#171A2B',
  },

  emptyText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#8B92A8',
    lineHeight: 20,
    marginTop: 5,
    marginBottom: 18,
  },

  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6C63FF',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 13,
  },

  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },

  /* Tasks */

  tasksContainer: {
    gap: 11,
  },

  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#171A2B',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.035,
    shadowRadius: 8,
    elevation: 2,
  },

  completedTaskCard: {
    opacity: 0.72,
  },

  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },

  checkbox: {
    width: 25,
    height: 25,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#D6D9E4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  checkboxChecked: {
    backgroundColor: '#4CD7A5',
    borderColor: '#4CD7A5',
  },

  taskInfo: {
    flex: 1,
  },

  taskTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#25283A',
    lineHeight: 20,
    marginBottom: 7,
  },

  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9297A8',
  },

  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },

  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 7,
  },

  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },

  priorityText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'capitalize',
  },

  categoryBadge: {
    backgroundColor: '#F1F2F7',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 7,
  },

  categoryText: {
    color: '#73798D',
    fontSize: 9,
    fontWeight: '700',
  },

  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  taskTime: {
    color: '#8B92A8',
    fontSize: 10,
    fontWeight: '600',
  },

  bottomSpace: {
    height: 100,
  },

  /* FAB */

  fab: {
    position: 'absolute',
    right: 22,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 8,
  },
});

export default HomeScreen;

