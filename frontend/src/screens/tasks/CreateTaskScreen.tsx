import React, { useEffect, useState } from 'react';
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
  SafeAreaView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { taskApi } from '../../api/taskApi';
import { categoryApi } from '../../api/categoryApi';
import { CreateTaskDto, Category, TaskPriority } from '../../types';

const CreateTaskScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const params = route.params as { dueDate?: string } | undefined;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(
    TaskPriority.MEDIUM
  );
  const [categoryId, setCategoryId] = useState<string | undefined>();

  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [dueTime, setDueTime] = useState<Date | undefined>();

  const [notificationDate, setNotificationDate] =
    useState<Date | undefined>();
  const [notificationTime, setNotificationTime] =
    useState<Date | undefined>();

  const [startDate, setStartDate] = useState<Date | undefined>();

  const [tags, setTags] = useState('');
  const [responsiblePerson, setResponsiblePerson] = useState('');

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [showDueTimePicker, setShowDueTimePicker] = useState(false);
  const [showNotificationDatePicker, setShowNotificationDatePicker] =
    useState(false);
  const [showNotificationTimePicker, setShowNotificationTimePicker] =
    useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);

  useEffect(() => {
    loadCategories();

    if (params?.dueDate) {
      const parsedDate = new Date(params.dueDate);

      if (!isNaN(parsedDate.getTime())) {
        setDueDate(parsedDate);
      }
    }
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await categoryApi.getAll();
      setCategories(cats);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Missing title', 'Please enter a task title.');
      return;
    }

    setIsLoading(true);

    try {
      let combinedNotificationTime: string | undefined;

      if (notificationDate && notificationTime) {
        const combined = new Date(notificationDate);

        combined.setHours(notificationTime.getHours());
        combined.setMinutes(notificationTime.getMinutes());
        combined.setSeconds(0);
        combined.setMilliseconds(0);

        combinedNotificationTime = combined.toISOString();
      } else if (notificationDate) {
        combinedNotificationTime = notificationDate.toISOString();
      } else if (notificationTime) {
        combinedNotificationTime = notificationTime.toISOString();
      }

      const taskData: CreateTaskDto = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        category_id: categoryId,

        due_date: dueDate
          ? dueDate.toISOString().split('T')[0]
          : undefined,

        due_time: dueTime
          ? dueTime.toISOString()
          : undefined,

        notification_time: combinedNotificationTime,

        start_date: startDate
          ? startDate.toISOString().split('T')[0]
          : undefined,

        tags: tags.trim()
          ? tags
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean)
          : undefined,

        responsible_person:
          responsiblePerson.trim() || undefined,
      };

      await taskApi.create(taskData);

      navigation.goBack();
    } catch (error) {
      console.error('Error creating task:', error);
      Alert.alert(
        'Something went wrong',
        'Failed to create your task. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPriorityColor = (p: TaskPriority) => {
    switch (p) {
      case TaskPriority.HIGH:
        return '#FF4D67';
      case TaskPriority.MEDIUM:
        return '#FF9F43';
      case TaskPriority.LOW:
        return '#2BC48A';
      default:
        return '#8E8E93';
    }
  };

  const getPriorityIcon = (p: TaskPriority) => {
    switch (p) {
      case TaskPriority.HIGH:
        return 'flame';
      case TaskPriority.MEDIUM:
        return 'alert-circle';
      case TaskPriority.LOW:
        return 'leaf';
      default:
        return 'remove-circle';
    }
  };

  const renderDatePicker = (
    type: 'dueDate' | 'dueTime' | 'notificationDate' | 'notificationTime' | 'startDate'
  ) => {
    const config = {
      dueDate: {
        visible: showDueDatePicker,
        setVisible: setShowDueDatePicker,
        value: dueDate,
        setValue: setDueDate,
        mode: 'date' as const,
      },
      dueTime: {
        visible: showDueTimePicker,
        setVisible: setShowDueTimePicker,
        value: dueTime,
        setValue: setDueTime,
        mode: 'time' as const,
      },
      notificationDate: {
        visible: showNotificationDatePicker,
        setVisible: setShowNotificationDatePicker,
        value: notificationDate,
        setValue: setNotificationDate,
        mode: 'date' as const,
      },
      notificationTime: {
        visible: showNotificationTimePicker,
        setVisible: setShowNotificationTimePicker,
        value: notificationTime,
        setValue: setNotificationTime,
        mode: 'time' as const,
      },
      startDate: {
        visible: showStartDatePicker,
        setVisible: setShowStartDatePicker,
        value: startDate,
        setValue: setStartDate,
        mode: 'date' as const,
      },
    }[type];

    if (!config.visible) return null;

    return (
      <DateTimePicker
        value={config.value || new Date()}
        mode={config.mode}
        display="default"
        onChange={(event, selectedDate) => {
          config.setVisible(false);

          if (selectedDate) {
            config.setValue(selectedDate);
          }
        }}
      />
    );
  };

  const DateField = ({
    label,
    value,
    placeholder,
    icon,
    onPress,
  }: {
    label: string;
    value?: Date;
    placeholder: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
  }) => (
    <View style={styles.dateFieldWrapper}>
      <Text style={styles.smallLabel}>{label}</Text>

      <TouchableOpacity
        activeOpacity={0.75}
        style={[
          styles.dateField,
          value && styles.dateFieldSelected,
        ]}
        onPress={onPress}
      >
        <View style={styles.dateIconContainer}>
          <Ionicons
            name={icon}
            size={20}
            color="#5B5FEF"
          />
        </View>

        <View style={styles.dateTextContainer}>
          <Text
            style={[
              styles.dateValue,
              !value && styles.placeholderText,
            ]}
          >
            {value
              ? label.toLowerCase().includes('time')
                ? formatTime(value)
                : formatDate(value)
              : placeholder}
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={18}
          color="#A1A1AA"
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#18181B"
            />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Create Task</Text>
            <Text style={styles.headerSubtitle}>
              Plan something productive
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="checkmark-circle"
              size={27}
              color="#5B5FEF"
            />
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Basic Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons
                  name="create-outline"
                  size={18}
                  color="#5B5FEF"
                />
              </View>

              <View>
                <Text style={styles.sectionTitle}>
                  Task Details
                </Text>
                <Text style={styles.sectionSubtitle}>
                  What do you need to accomplish?
                </Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>
                Task Title <Text style={styles.required}>*</Text>
              </Text>

              <TextInput
                style={styles.titleInput}
                placeholder="e.g. Complete project report"
                placeholderTextColor="#A1A1AA"
                value={title}
                onChangeText={setTitle}
                autoFocus
              />

              <View style={styles.divider} />

              <Text style={styles.label}>Description</Text>

              <TextInput
                style={styles.descriptionInput}
                placeholder="Add some details about this task..."
                placeholderTextColor="#A1A1AA"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Priority */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons
                  name="flag-outline"
                  size={18}
                  color="#5B5FEF"
                />
              </View>

              <View>
                <Text style={styles.sectionTitle}>
                  Priority
                </Text>
                <Text style={styles.sectionSubtitle}>
                  How important is this task?
                </Text>
              </View>
            </View>

            <View style={styles.priorityContainer}>
              {[
                TaskPriority.LOW,
                TaskPriority.MEDIUM,
                TaskPriority.HIGH,
              ].map((p) => {
                const active = priority === p;
                const color = getPriorityColor(p);

                return (
                  <TouchableOpacity
                    key={p}
                    activeOpacity={0.8}
                    style={[
                      styles.priorityCard,
                      active && {
                        borderColor: color,
                        backgroundColor: `${color}12`,
                      },
                    ]}
                    onPress={() => setPriority(p)}
                  >
                    <View
                      style={[
                        styles.priorityIcon,
                        active && {
                          backgroundColor: color,
                        },
                      ]}
                    >
                      <Ionicons
                        name={getPriorityIcon(p)}
                        size={17}
                        color={active ? '#fff' : color}
                      />
                    </View>

                    <Text
                      style={[
                        styles.priorityText,
                        active && {
                          color,
                          fontWeight: '700',
                        },
                      ]}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </Text>

                    {active && (
                      <View
                        style={[
                          styles.priorityCheck,
                          { backgroundColor: color },
                        ]}
                      >
                        <Ionicons
                          name="checkmark"
                          size={12}
                          color="#fff"
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Category */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons
                  name="pricetags-outline"
                  size={18}
                  color="#5B5FEF"
                />
              </View>

              <View>
                <Text style={styles.sectionTitle}>
                  Category
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Organize your task
                </Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.categoryChip,
                  !categoryId && styles.categoryChipActive,
                ]}
                onPress={() => setCategoryId(undefined)}
              >
                <Ionicons
                  name="apps-outline"
                  size={16}
                  color={!categoryId ? '#fff' : '#71717A'}
                />

                <Text
                  style={[
                    styles.categoryChipText,
                    !categoryId &&
                      styles.categoryChipTextActive,
                  ]}
                >
                  General
                </Text>
              </TouchableOpacity>

              {categories.map((cat) => {
                const active = categoryId === cat.id;

                return (
                  <TouchableOpacity
                    key={cat.id}
                    activeOpacity={0.8}
                    style={[
                      styles.categoryChip,
                      active && styles.categoryChipActive,
                    ]}
                    onPress={() => setCategoryId(cat.id)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        active &&
                          styles.categoryChipTextActive,
                      ]}
                    >
                      {cat.icon} {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Schedule */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color="#5B5FEF"
                />
              </View>

              <View>
                <Text style={styles.sectionTitle}>
                  Schedule
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Set dates and deadlines
                </Text>
              </View>
            </View>

            <View style={styles.card}>
              <DateField
                label="Due Date"
                value={dueDate}
                placeholder="Select due date"
                icon="calendar-outline"
                onPress={() => setShowDueDatePicker(true)}
              />

              {renderDatePicker('dueDate')}

              <DateField
                label="Due Time"
                value={dueTime}
                placeholder="Select due time"
                icon="time-outline"
                onPress={() => setShowDueTimePicker(true)}
              />

              {renderDatePicker('dueTime')}

              <DateField
                label="Start Date"
                value={startDate}
                placeholder="Select start date"
                icon="play-circle-outline"
                onPress={() => setShowStartDatePicker(true)}
              />

              {renderDatePicker('startDate')}
            </View>
          </View>

          {/* Reminder */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons
                  name="notifications-outline"
                  size={18}
                  color="#5B5FEF"
                />
              </View>

              <View>
                <Text style={styles.sectionTitle}>
                  Reminder
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Never miss this task
                </Text>
              </View>
            </View>

            <View style={styles.card}>
              <DateField
                label="Notification Date"
                value={notificationDate}
                placeholder="Select notification date"
                icon="calendar-outline"
                onPress={() =>
                  setShowNotificationDatePicker(true)
                }
              />

              {renderDatePicker('notificationDate')}

              <DateField
                label="Notification Time"
                value={notificationTime}
                placeholder="Select notification time"
                icon="alarm-outline"
                onPress={() =>
                  setShowNotificationTimePicker(true)
                }
              />

              {renderDatePicker('notificationTime')}
            </View>
          </View>

          {/* Additional Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons
                  name="options-outline"
                  size={18}
                  color="#5B5FEF"
                />
              </View>

              <View>
                <Text style={styles.sectionTitle}>
                  Additional Information
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Add useful task details
                </Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>
                Responsible Person
              </Text>

              <View style={styles.inputWithIcon}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#8E8E93"
                />

                <TextInput
                  style={styles.iconInput}
                  placeholder="Who is responsible?"
                  placeholderTextColor="#A1A1AA"
                  value={responsiblePerson}
                  onChangeText={setResponsiblePerson}
                />
              </View>

              <View style={styles.divider} />

              <Text style={styles.label}>
                Tags
              </Text>

              <View style={styles.inputWithIcon}>
                <Ionicons
                  name="pricetag-outline"
                  size={20}
                  color="#8E8E93"
                />

                <TextInput
                  style={styles.iconInput}
                  placeholder="work, urgent, project"
                  placeholderTextColor="#A1A1AA"
                  value={tags}
                  onChangeText={setTags}
                />
              </View>

              <Text style={styles.helperText}>
                Separate multiple tags with commas
              </Text>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.bottomActions}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.createButton,
                isLoading && styles.createButtonDisabled,
              ]}
              onPress={handleCreate}
              disabled={isLoading}
            >
              <Ionicons
                name={isLoading ? 'hourglass-outline' : 'checkmark'}
                size={20}
                color="#fff"
              />

              <Text style={styles.createText}>
                {isLoading ? 'Creating...' : 'Create Task'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpace} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7FB',
  },

  container: {
    flex: 1,
  },

  /* Header */
  header: {
    height: 78,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEF2',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F5F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitleContainer: {
    flex: 1,
    marginLeft: 14,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#18181B',
  },

  headerSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },

  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#EEEEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  scrollView: {
    flex: 1,
  },

  content: {
    padding: 20,
  },

  /* Sections */
  section: {
    marginBottom: 26,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
  },

  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EEEEFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#18181B',
  },

  sectionSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },

  /* Cards */
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EEEEF2',
    shadowColor: '#000',
    shadowOpacity: 0.035,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3F3F46',
    marginBottom: 9,
  },

  required: {
    color: '#FF4D67',
  },

  titleInput: {
    fontSize: 17,
    fontWeight: '600',
    color: '#18181B',
    paddingVertical: 8,
  },

  descriptionInput: {
    minHeight: 90,
    fontSize: 14,
    color: '#3F3F46',
    lineHeight: 21,
    paddingTop: 4,
  },

  divider: {
    height: 1,
    backgroundColor: '#F0F0F3',
    marginVertical: 15,
  },

  /* Priority */
  priorityContainer: {
    flexDirection: 'row',
    gap: 10,
  },

  priorityCard: {
    flex: 1,
    minHeight: 85,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E8E8ED',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  priorityIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F7',
    marginBottom: 6,
  },

  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#71717A',
  },

  priorityCheck: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Category */
  categoryList: {
    gap: 9,
    paddingVertical: 2,
  },

  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E7E7EC',
  },

  categoryChipActive: {
    backgroundColor: '#5B5FEF',
    borderColor: '#5B5FEF',
  },

  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#52525B',
  },

  categoryChipTextActive: {
    color: '#fff',
  },

  /* Date fields */
  dateFieldWrapper: {
    marginBottom: 14,
  },

  smallLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#71717A',
    marginBottom: 7,
  },

  dateField: {
    minHeight: 58,
    borderRadius: 14,
    backgroundColor: '#F9F9FB',
    borderWidth: 1,
    borderColor: '#EEEEF2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  dateFieldSelected: {
    backgroundColor: '#F7F7FF',
    borderColor: '#DCDDFB',
  },

  dateIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#EEEEFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  dateTextContainer: {
    flex: 1,
  },

  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#27272A',
  },

  placeholderText: {
    color: '#A1A1AA',
    fontWeight: '500',
  },

  /* Inputs */
  inputWithIcon: {
    minHeight: 52,
    backgroundColor: '#F9F9FB',
    borderRadius: 13,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#27272A',
  },

  helperText: {
    fontSize: 11,
    color: '#A1A1AA',
    marginTop: 7,
    marginLeft: 2,
  },

  /* Bottom buttons */
  bottomActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 2,
  },

  cancelButton: {
    flex: 0.8,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E4E4E9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#71717A',
  },

  createButton: {
    flex: 1.5,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#5B5FEF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    shadowColor: '#5B5FEF',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 5,
  },

  createButtonDisabled: {
    opacity: 0.6,
  },

  createText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },

  bottomSpace: {
    height: 30,
  },
});

export default CreateTaskScreen;

