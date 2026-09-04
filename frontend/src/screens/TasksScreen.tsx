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
import { taskApi } from '../api/taskApi';
import { Task } from '../types';
import { Ionicons } from '@expo/vector-icons';

const TasksScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<
    'all' | 'today' | 'upcoming' | 'completed' | 'overdue'
  >('all');

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const filters = [
    { key: 'all', label: 'All', icon: 'apps-outline' },
    { key: 'today', label: 'Today', icon: 'today-outline' },
    { key: 'upcoming', label: 'Upcoming', icon: 'calendar-outline' },
    { key: 'completed', label: 'Completed', icon: 'checkmark-circle-outline' },
    { key: 'overdue', label: 'Overdue', icon: 'alert-circle-outline' },
  ] as const;

  const loadTasks = async () => {
    try {
      let response;

      switch (filter) {
        case 'today':
          response = await taskApi.getToday();
          break;

        case 'upcoming':
          response = await taskApi.getUpcoming();
          break;

        case 'completed':
          response = await taskApi.getCompleted();
          break;

        case 'overdue':
          response = await taskApi.getOverdue();
          break;

        default:
          response = await taskApi.getAll();
      }

      setTasks(response);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    loadTasks();
  }, [filter]);

  const onRefresh = () => {
    setRefreshing(true);
    loadTasks();
  };

  const handleTaskComplete = async (task: Task) => {
    try {
      if (task.status === 'completed') {
        await taskApi.markIncomplete(task.id);
      } else {
        await taskApi.markComplete(task.id);
      }

      loadTasks();
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
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

  const getFilterCount = () => {
    return tasks.length;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingIcon}>
          <Ionicons name="checkmark" size={30} color="#FFFFFF" />
        </View>

        <Text style={styles.loadingTitle}>Loading tasks...</Text>

        <Text style={styles.loadingSubtitle}>
          Organizing your productivity
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerEyebrow}>
              YOUR PRODUCTIVITY
            </Text>

            <Text style={styles.headerTitle}>
              My Tasks
            </Text>

            <Text style={styles.headerSubtitle}>
              Stay organized. Get things done.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.headerAddButton}
            onPress={() => navigation.navigate('CreateTask')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="add"
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            {filters.map((item) => {
              const isActive = filter === item.key;

              return (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.filterButton,
                    isActive && styles.filterButtonActive,
                  ]}
                  onPress={() => setFilter(item.key)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={16}
                    color={
                      isActive ? '#FFFFFF' : '#7C8298'
                    }
                  />

                  <Text
                    style={[
                      styles.filterText,
                      isActive && styles.filterTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Task Summary */}
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.summaryTitle}>
              {filters.find((item) => item.key === filter)?.label}
            </Text>

            <Text style={styles.summarySubtitle}>
              {getFilterCount() === 0
                ? 'Nothing here right now'
                : `${getFilterCount()} ${
                    getFilterCount() === 1 ? 'task' : 'tasks'
                  }`}
            </Text>
          </View>

          <View style={styles.taskCountBadge}>
            <Text style={styles.taskCountText}>
              {getFilterCount()}
            </Text>
          </View>
        </View>

        {/* Tasks */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#6C63FF"
            />
          }
        >
          {tasks.length === 0 ? (
            <View style={styles.emptyState}>

              <View style={styles.emptyIcon}>
                <Ionicons
                  name={
                    filter === 'completed'
                      ? 'checkmark-done'
                      : filter === 'overdue'
                      ? 'time-outline'
                      : 'list-outline'
                  }
                  size={38}
                  color="#6C63FF"
                />
              </View>

              <Text style={styles.emptyTitle}>
                {filter === 'completed'
                  ? 'No completed tasks'
                  : filter === 'overdue'
                  ? 'No overdue tasks'
                  : 'Nothing here yet'}
              </Text>

              <Text style={styles.emptyText}>
                {filter === 'all'
                  ? 'Create your first task and start getting things done.'
                  : 'There are no tasks in this view right now.'}
              </Text>

              {filter === 'all' && (
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() =>
                    navigation.navigate('CreateTask')
                  }
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name="add"
                    size={18}
                    color="#FFFFFF"
                  />

                  <Text style={styles.emptyButtonText}>
                    Create your first task
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.tasksContainer}>
              {tasks.map((task) => {
                const isCompleted =
                  task.status === 'completed';

                const priorityColor =
                  getPriorityColor(task.priority);

                return (
                  <TouchableOpacity
                    key={task.id}
                    style={[
                      styles.taskCard,
                      isCompleted &&
                        styles.completedTaskCard,
                    ]}
                    onPress={() =>
                      navigation.navigate(
                        'TaskDetail',
                        {
                          taskId: task.id,
                        }
                      )
                    }
                    activeOpacity={0.85}
                  >
                    {/* Left Accent */}
                    <View
                      style={[
                        styles.taskAccent,
                        {
                          backgroundColor:
                            priorityColor,
                        },
                      ]}
                    />

                    <View style={styles.taskContent}>

                      {/* Checkbox */}
                      <TouchableOpacity
                        style={[
                          styles.checkbox,
                          isCompleted &&
                            styles.checkboxChecked,
                        ]}
                        onPress={() =>
                          handleTaskComplete(task)
                        }
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

                      {/* Task Details */}
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

                          {/* Priority */}
                          <View
                            style={[
                              styles.priorityBadge,
                              {
                                backgroundColor:
                                  `${priorityColor}18`,
                              },
                            ]}
                          >
                            <View
                              style={[
                                styles.priorityDot,
                                {
                                  backgroundColor:
                                    priorityColor,
                                },
                              ]}
                            />

                            <Text
                              style={[
                                styles.priorityText,
                                {
                                  color:
                                    priorityColor,
                                },
                              ]}
                            >
                              {task.priority ||
                                'normal'}
                            </Text>
                          </View>

                          {/* Category */}
                          {task.category?.name && (
                            <View
                              style={
                                styles.categoryBadge
                              }
                            >
                              <Ionicons
                                name="pricetag-outline"
                                size={11}
                                color="#777D91"
                              />

                              <Text
                                style={
                                  styles.categoryText
                                }
                              >
                                {task.category.name}
                              </Text>
                            </View>
                          )}
                        </View>

                        {/* Due Date */}
                        {task.due_date && (
                          <View
                            style={
                              styles.dueDateContainer
                            }
                          >
                            <Ionicons
                              name="calendar-outline"
                              size={13}
                              color="#8B92A8"
                            />

                            <Text
                              style={styles.dueDate}
                            >
                              {new Date(
                                task.due_date
                              ).toLocaleDateString(
                                'en-US',
                                {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                }
                              )}
                            </Text>

                            <Text style={styles.dotSeparator}>
                              •
                            </Text>

                            <Ionicons
                              name="time-outline"
                              size={13}
                              color="#8B92A8"
                            />

                            <Text
                              style={styles.dueDate}
                            >
                              {new Date(
                                task.due_date
                              ).toLocaleTimeString(
                                [],
                                {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                }
                              )}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Arrow */}
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#B8BDCB"
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <View style={styles.bottomSpace} />
        </ScrollView>

        {/* Floating Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() =>
            navigation.navigate('CreateTask')
          }
          activeOpacity={0.85}
        >
          <Ionicons
            name="add"
            size={30}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 18,
  },

  headerEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6C63FF',
    letterSpacing: 1.3,
    marginBottom: 4,
  },

  headerTitle: {
    fontSize: 29,
    fontWeight: '800',
    color: '#171A2B',
    letterSpacing: -0.6,
  },

  headerSubtitle: {
    fontSize: 12,
    color: '#8B92A8',
    marginTop: 4,
  },

  headerAddButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.23,
    shadowRadius: 10,
    elevation: 6,
  },

  /* Filters */

  filterWrapper: {
    marginBottom: 4,
  },

  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 4,
    gap: 9,
  },

  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E9EAF0',
  },

  filterButtonActive: {
    backgroundColor: '#6C63FF',
    borderColor: '#6C63FF',
  },

  filterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C8298',
  },

  filterTextActive: {
    color: '#FFFFFF',
  },

  /* Summary */

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 13,
  },

  summaryTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#171A2B',
  },

  summarySubtitle: {
    fontSize: 12,
    color: '#8B92A8',
    marginTop: 3,
  },

  taskCountBadge: {
    minWidth: 38,
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 11,
    backgroundColor: '#EDEBFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  taskCountText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6C63FF',
  },

  /* Scroll */

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
  },

  /* Tasks */

  tasksContainer: {
    gap: 11,
  },

  taskCard: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    paddingVertical: 16,
    paddingRight: 14,
    paddingLeft: 17,
    overflow: 'hidden',

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
    opacity: 0.68,
  },

  taskAccent: {
    position: 'absolute',
    left: 0,
    top: 15,
    bottom: 15,
    width: 4,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },

  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },

  checkbox: {
    width: 26,
    height: 26,
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
    lineHeight: 20,
    fontWeight: '700',
    color: '#25283A',
    marginBottom: 8,
  },

  taskTitleCompleted: {
    color: '#9297A8',
    textDecorationLine: 'line-through',
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
    paddingHorizontal: 8,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
  },

  categoryText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#777D91',
  },

  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },

  dueDate: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8B92A8',
  },

  dotSeparator: {
    color: '#C5C9D4',
    fontSize: 10,
    marginHorizontal: 1,
  },

  /* Empty */

  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 40,
    marginTop: 8,

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
    width: 76,
    height: 76,
    borderRadius: 25,
    backgroundColor: '#EEECFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#171A2B',
  },

  emptyText: {
    textAlign: 'center',
    color: '#8B92A8',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 20,
  },

  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6C63FF',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 13,
  },

  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
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

export default TasksScreen;

