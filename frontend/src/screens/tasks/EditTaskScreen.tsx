import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { taskApi } from '../../api/taskApi';
import { categoryApi } from '../../api/categoryApi';
import { UpdateTaskDto, Category, TaskPriority, Task } from '../../types';

const EditTaskScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { taskId } = route.params as { taskId: string };

  const [task, setTask] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [dueTime, setDueTime] = useState<Date | undefined>();
  const [notificationDate, setNotificationDate] = useState<Date | undefined>();
  const [notificationTime, setNotificationTime] = useState<Date | undefined>();
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [tags, setTags] = useState('');
  const [responsiblePerson, setResponsiblePerson] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Date picker states
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [showDueTimePicker, setShowDueTimePicker] = useState(false);
  const [showNotificationDatePicker, setShowNotificationDatePicker] = useState(false);
  const [showNotificationTimePicker, setShowNotificationTimePicker] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);

  useEffect(() => {
    loadTaskData();
  }, [taskId]);

  const loadTaskData = async () => {
    setIsLoading(true);
    try {
      const [taskData, cats] = await Promise.all([
        taskApi.getById(taskId),
        categoryApi.getAll(),
      ]);
      setTask(taskData);
      setTitle(taskData.title);
      setDescription(taskData.description || '');
      setPriority(taskData.priority);
      setCategoryId(taskData.category_id);
      setDueDate(taskData.due_date ? new Date(taskData.due_date) : undefined);
      setDueTime(taskData.due_time ? new Date(taskData.due_time) : undefined);
      if (taskData.notification_time) {
        const notifTime = new Date(taskData.notification_time);
        setNotificationDate(notifTime);
        setNotificationTime(notifTime);
      }
      setStartDate(taskData.start_date ? new Date(taskData.start_date) : undefined);
      setTags(taskData.tags?.join(', ') || '');
      setResponsiblePerson(taskData.responsible_person || '');
      setCategories(cats);
    } catch (error) {
      console.error('Error loading task data:', error);
      Alert.alert('Error', 'Failed to load task');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    setIsSaving(true);
    try {
      // Combine notification date and time into a single timestamp
      let combinedNotificationTime: string | undefined;
      if (notificationDate && notificationTime) {
        const combined = new Date(notificationDate);
        combined.setHours(notificationTime.getHours());
        combined.setMinutes(notificationTime.getMinutes());
        combinedNotificationTime = combined.toISOString();
      } else if (notificationDate) {
        combinedNotificationTime = notificationDate.toISOString();
      } else if (notificationTime) {
        combinedNotificationTime = notificationTime.toISOString();
      }

      const taskData: UpdateTaskDto = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        category_id: categoryId,
        due_date: dueDate ? dueDate.toISOString().split('T')[0] : undefined,
        due_time: dueTime ? dueTime.toISOString() : undefined,
        notification_time: combinedNotificationTime,
        start_date: startDate ? startDate.toISOString().split('T')[0] : undefined,
        tags: tags.trim() ? tags.split(',').map(t => t.trim()) : undefined,
        responsible_person: responsiblePerson.trim() || undefined,
      };

      await taskApi.update(taskId, taskData);
      navigation.goBack();
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update task');
    } finally {
      setIsSaving(false);
    }
  };

  const getPriorityColor = (p: TaskPriority) => {
    switch (p) {
      case TaskPriority.HIGH: return '#FF3B30';
      case TaskPriority.MEDIUM: return '#FF9500';
      case TaskPriority.LOW: return '#34C759';
      default: return '#8E8E93';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Task Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="What needs to be done?"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add details..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityOptions}>
              {([TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH] as TaskPriority[]).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityButton,
                    priority === p && { backgroundColor: getPriorityColor(p) },
                  ]}
                  onPress={() => setPriority(p)}
                >
                  <Text style={[
                    styles.priorityButtonText,
                    priority === p && styles.priorityButtonTextActive,
                  ]}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
            >
              <TouchableOpacity
                style={[styles.categoryChip, !categoryId && styles.categoryChipActive]}
                onPress={() => setCategoryId(undefined)}
              >
                <Text style={[styles.categoryChipText, !categoryId && styles.categoryChipTextActive]}>
                  No Category
                </Text>
              </TouchableOpacity>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryChip, categoryId === cat.id && styles.categoryChipActive]}
                  onPress={() => setCategoryId(cat.id)}
                >
                  <Text style={styles.categoryChipText}>{cat.icon} {cat.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Due Date</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDueDatePicker(true)}
            >
              <Text style={[styles.datePickerText, dueDate && styles.datePickerTextSelected]}>
                {dueDate ? formatDate(dueDate) : 'Select due date'}
              </Text>
              <Text style={styles.icon}>📅</Text>
            </TouchableOpacity>
            {showDueDatePicker && (
              <DateTimePicker
                value={dueDate || new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDueDatePicker(false);
                  if (selectedDate) setDueDate(selectedDate);
                }}
              />
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Due Time</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDueTimePicker(true)}
            >
              <Text style={[styles.datePickerText, dueTime && styles.datePickerTextSelected]}>
                {dueTime ? formatTime(dueTime) : 'Select due time'}
              </Text>
              <Text style={styles.icon}>⏰</Text>
            </TouchableOpacity>
            {showDueTimePicker && (
              <DateTimePicker
                value={dueTime || new Date()}
                mode="time"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDueTimePicker(false);
                  if (selectedDate) setDueTime(selectedDate);
                }}
              />
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notification Date</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowNotificationDatePicker(true)}
            >
              <Text style={[styles.datePickerText, notificationDate && styles.datePickerTextSelected]}>
                {notificationDate ? formatDate(notificationDate) : 'Select notification date'}
              </Text>
              <Text style={styles.icon}>📅</Text>
            </TouchableOpacity>
            {showNotificationDatePicker && (
              <DateTimePicker
                value={notificationDate || new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowNotificationDatePicker(false);
                  if (selectedDate) setNotificationDate(selectedDate);
                }}
              />
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notification Time</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowNotificationTimePicker(true)}
            >
              <Text style={[styles.datePickerText, notificationTime && styles.datePickerTextSelected]}>
                {notificationTime ? formatTime(notificationTime) : 'Select notification time'}
              </Text>
              <Text style={styles.icon}>⏰</Text>
            </TouchableOpacity>
            {showNotificationTimePicker && (
              <DateTimePicker
                value={notificationTime || new Date()}
                mode="time"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowNotificationTimePicker(false);
                  if (selectedDate) setNotificationTime(selectedDate);
                }}
              />
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Start Date</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Text style={[styles.datePickerText, startDate && styles.datePickerTextSelected]}>
                {startDate ? formatDate(startDate) : 'Select start date'}
              </Text>
              <Text style={styles.icon}>📅</Text>
            </TouchableOpacity>
            {showStartDatePicker && (
              <DateTimePicker
                value={startDate || new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowStartDatePicker(false);
                  if (selectedDate) setStartDate(selectedDate);
                }}
              />
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Responsible Person</Text>
            <TextInput
              style={styles.input}
              placeholder="Who is responsible for this task?"
              value={responsiblePerson}
              onChangeText={setResponsiblePerson}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tags (comma separated)</Text>
            <TextInput
              style={styles.input}
              placeholder="work, urgent, project"
              value={tags}
              onChangeText={setTags}
            />
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, isSaving && styles.buttonDisabled]}
              onPress={handleUpdate}
              disabled={isSaving}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  textArea: {
    height: 100,
  },
  priorityOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    alignItems: 'center',
  },
  priorityButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  priorityButtonTextActive: {
    color: '#fff',
  },
  categoryScroll: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  categoryChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#333',
  },
  categoryChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  datePickerButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  datePickerText: {
    fontSize: 16,
    color: '#999',
  },
  datePickerTextSelected: {
    color: '#333',
  },
  icon: {
    fontSize: 20,
  },
});

export default EditTaskScreen;