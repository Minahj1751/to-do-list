import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { taskApi } from '../../api/taskApi';
import { subtaskApi } from '../../api/subtaskApi';
import { Task, Subtask } from '../../types';
import { Ionicons } from '@expo/vector-icons';

const TaskDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { taskId } = route.params as { taskId: string };
  
  const [task, setTask] = useState<Task | null>(null);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [taskData, subtasksData] = await Promise.all([
        taskApi.getById(taskId),
        subtaskApi.getByTask(taskId),
      ]);
      setTask(taskData);
      setSubtasks(subtasksData);
    } catch (error) {
      console.error('Error loading task details:', error);
      Alert.alert('Error', 'Failed to load task details');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [taskId]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await taskApi.delete(taskId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete task');
            }
          },
        },
      ]
    );
  };

  const handleToggleComplete = async () => {
    if (!task) return;
    try {
      if (task.status === 'completed') {
        await taskApi.markIncomplete(taskId);
      } else {
        await taskApi.markComplete(taskId);
      }
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to update task status');
    }
  };

  const handleToggleSubtask = async (subtask: Subtask) => {
    try {
      await subtaskApi.update(taskId, subtask.id, {
        is_completed: !subtask.is_completed,
      });
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to update subtask');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#FF3B30';
      case 'medium': return '#FF9500';
      case 'low': return '#34C759';
      default: return '#8E8E93';
    }
  };

  const getPriorityLabel = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.errorContainer}>
        <Text>Task not found</Text>
      </View>
    );
  }

  const progress = subtasks.length > 0 
    ? Math.round((subtasks.filter(s => s.is_completed).length / subtasks.length) * 100)
    : 0;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={[styles.completeButton, task.status === 'completed' && styles.completeButtonActive]}
            onPress={handleToggleComplete}
          >
            <Ionicons 
              name={task.status === 'completed' ? 'checkmark-circle' : 'radio-button-off'} 
              size={28} 
              color={task.status === 'completed' ? '#34C759' : '#007AFF'} 
            />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={[styles.title, task.status === 'completed' && styles.titleCompleted]}>
              {task.title}
            </Text>
            <View style={styles.metaRow}>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
                <Text style={styles.priorityText}>{getPriorityLabel(task.priority)}</Text>
              </View>
              {task.category && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{task.category.icon} {task.category.name}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditTask', { taskId })}
        >
          <Ionicons name="create" size={20} color="#007AFF" />
          <Text style={styles.editButtonText}>Edit Task</Text>
        </TouchableOpacity>
      </View>

      {task.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{task.description}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        
        {task.due_date && (
          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={20} color="#007AFF" />
            <Text style={styles.detailLabel}>Due Date:</Text>
            <Text style={styles.detailValue}>
              {new Date(task.due_date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        )}

        {task.start_date && (
          <View style={styles.detailRow}>
            <Ionicons name="time" size={20} color="#007AFF" />
            <Text style={styles.detailLabel}>Start Date:</Text>
            <Text style={styles.detailValue}>
              {new Date(task.start_date).toLocaleDateString()}
            </Text>
          </View>
        )}

        {task.tags && task.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            <Ionicons name="pricetag" size={20} color="#007AFF" />
            <View style={styles.tagsList}>
              {task.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Subtasks</Text>
          <TouchableOpacity>
            <Text style={styles.addSubtaskText}>+ Add</Text>
          </TouchableOpacity>
        </View>
        
        {subtasks.length === 0 ? (
          <Text style={styles.emptyText}>No subtasks</Text>
        ) : (
          <>
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>{progress}% Complete</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
            </View>
            
            {subtasks.map((subtask) => (
              <TouchableOpacity
                key={subtask.id}
                style={styles.subtaskRow}
                onPress={() => handleToggleSubtask(subtask)}
              >
                <Ionicons
                  name={subtask.is_completed ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={subtask.is_completed ? '#34C759' : '#8E8E93'}
                />
                <Text style={[
                  styles.subtaskText,
                  subtask.is_completed && styles.subtaskTextCompleted
                ]}>
                  {subtask.title}
                </Text>
              </TouchableOpacity>
            ))}
          </>
        )}
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Ionicons name="trash" size={20} color="#FF3B30" />
        <Text style={styles.deleteButtonText}>Delete Task</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  completeButton: {
    marginTop: 4,
  },
  completeButtonActive: {
    opacity: 0.7,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#E5E5EA',
  },
  categoryText: {
    fontSize: 12,
    color: '#333',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addSubtaskText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E5E5EA',
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: '#007AFF',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    padding: 20,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  subtaskText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  subtaskTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
  },
  deleteButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TaskDetailScreen;