import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Pressable, Alert, TextInput, Modal, GestureResponderEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Task type definition
interface Task {
  id: string;
  title: string;
  completed: boolean;
  date: 'today' | 'tomorrow';
}

export default function TaskScreen() {
  // State for tasks
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Complete React Native app', completed: false, date: 'today' },
    { id: '2', title: 'Go for a run', completed: true, date: 'today' },
    { id: '3', title: 'Buy groceries', completed: false, date: 'tomorrow' },
  ]);
  
  // State for filter (today/tomorrow)
  const [filter, setFilter] = useState<'today' | 'tomorrow'>('today');
  
  // State for editing task
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  
  // State for menu visibility
  const [menuVisible, setMenuVisible] = useState(false);
  
  // Filter tasks based on the selected date
  const filteredTasks = tasks.filter(task => task.date === filter);
  
  // Toggle task completion
  const toggleTaskCompletion = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };
  
  // Create new task
  const createNewTask = () => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: 'New Task',
      completed: false,
      date: filter,
    };
    setTasks([...tasks, newTask]);
    // Start editing the new task
    setEditingTask(newTask);
    setEditedTitle(newTask.title);
  };
  
  // Delete task
  const deleteTask = (id: string) => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            setTasks(tasks.filter(task => task.id !== id));
          }
        }
      ]
    );
  };
  
  // Clear all tasks for the current date
  const clearTasks = () => {
    Alert.alert(
      "Clear Tasks",
      `Are you sure you want to clear all ${filter} tasks?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear", 
          style: "destructive",
          onPress: () => {
            setTasks(tasks.filter(task => task.date !== filter));
            setMenuVisible(false);
          }
        }
      ]
    );
  };
  
  // Start editing task
  const startEditing = (task: Task) => {
    setEditingTask(task);
    setEditedTitle(task.title);
  };
  
  // Save edited task
  const saveEditedTask = () => {
    if (!editingTask) return;
    
    setTasks(tasks.map(task => 
      task.id === editingTask.id ? { ...task, title: editedTitle } : task
    ));
    
    setEditingTask(null);
    setEditedTitle('');
  };
  
  // A ref to track if a task item was tapped
  const taskItemTapped = useRef(false);
  
  // Handle tap on the task list area
  const handleTaskListTap = (event: GestureResponderEvent) => {
    // Only create a task if no task item was tapped
    if (!taskItemTapped.current) {
      createNewTask();
    }
    // Reset the flag
    taskItemTapped.current = false;
  };
  
  // Handle tap on a task item
  const handleTaskItemTap = () => {
    // Set the flag to indicate a task item was tapped
    taskItemTapped.current = true;
  };
  
  // Render each task
  const renderTask = ({ item }: { item: Task }) => {
    // If task is being edited, show edit form
    if (editingTask && editingTask.id === item.id) {
      return (
        <View style={styles.editTaskContainer} onTouchStart={handleTaskItemTap}>
          <TextInput 
            style={styles.editTaskInput}
            value={editedTitle}
            onChangeText={setEditedTitle}
            autoFocus
            onBlur={saveEditedTask}
            onSubmitEditing={saveEditedTask}
          />
          <TouchableOpacity style={styles.saveButton} onPress={saveEditedTask}>
            <Ionicons name="checkmark" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <View style={styles.taskItemContainer} onTouchStart={handleTaskItemTap}>
        <TouchableOpacity 
          style={styles.taskItem}
          onPress={() => toggleTaskCompletion(item.id)}
        >
          <TouchableOpacity 
            style={[styles.checkbox, item.completed && styles.checkboxChecked]}
            onPress={() => toggleTaskCompletion(item.id)}
          >
            {item.completed && <Ionicons name="checkmark" size={16} color="#fff" />}
          </TouchableOpacity>
          <Text style={[styles.taskText, item.completed && styles.taskTextCompleted]}>
            {item.title}
          </Text>
        </TouchableOpacity>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            onPress={() => startEditing(item)}
            style={styles.actionButton}
          >
            <Ionicons name="pencil-outline" size={20} color="#2196F3" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => deleteTask(item.id)}
            style={styles.actionButton}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Empty state component
  const EmptyTaskList = () => (
    <Pressable 
      style={styles.emptyState}
      onPress={createNewTask}
    >
      <Ionicons name="add-circle-outline" size={40} color="#C7C7CC" />
      <Text style={styles.emptyStateText}>Click to add a task</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
        <View style={styles.dateToggle}>
          <Pressable 
            style={[styles.toggleButton, filter === 'today' && styles.toggleButtonActive]} 
            onPress={() => setFilter('today')}
          >
            <Text style={[styles.toggleText, filter === 'today' && styles.toggleTextActive]}>Today</Text>
          </Pressable>
          <Pressable 
            style={[styles.toggleButton, filter === 'tomorrow' && styles.toggleButtonActive]} 
            onPress={() => setFilter('tomorrow')}
          >
            <Text style={[styles.toggleText, filter === 'tomorrow' && styles.toggleTextActive]}>Tomorrow</Text>
          </Pressable>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => setMenuVisible(true)}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Task List */}
      <Pressable 
        style={styles.taskList}
        onPress={handleTaskListTap}
      >
        {filteredTasks.length === 0 ? (
          <Pressable 
            style={styles.emptyTaskArea}
            onPress={createNewTask}
          >
            <EmptyTaskList />
          </Pressable>
        ) : (
          <FlatList
            data={filteredTasks}
            renderItem={renderTask}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.taskListContent}
            ListFooterComponent={
              <Pressable 
                style={styles.addTaskFooter}
                onPress={createNewTask}
                onTouchStart={handleTaskItemTap}
              >
                <Text style={styles.addTaskFooterText}>Tap here to add a task</Text>
              </Pressable>
            }
          />
        )}
      </Pressable>

      {/* Add Task Button */}
      <TouchableOpacity style={styles.addButton} onPress={createNewTask}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuModal}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={clearTasks}
            >
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              <Text style={styles.menuItemText}>Clear {filter} tasks</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => setMenuVisible(false)}
            >
              <Ionicons name="close-outline" size={20} color="#8E8E93" />
              <Text style={styles.menuItemText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  dateToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E9E9EB',
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#fff',
  },
  toggleText: {
    color: '#636366',
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#000',
  },
  menuButton: {
    marginLeft: 'auto',
    paddingHorizontal: 10,
  },
  taskList: {
    flex: 1,
  },
  taskListContent: {
    paddingBottom: 20,
  },
  taskItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#C7C7CC',
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  taskText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
  },
  addButton: {
    position: 'absolute',
    bottom: 32,
    left: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
  },
  editTaskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginVertical: 2,
  },
  editTaskInput: {
    flex: 1,
    fontSize: 16,
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 8,
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  emptyTaskArea: {
    flex: 1,
  },
  addTaskFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  addTaskFooterText: {
    color: '#8E8E93',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuModal: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
  },
});
