import { create } from 'zustand';
import type { List, Task, ID } from '../../../shared/types';

interface AppState {
  // UI 状态
  isTaskEditorOpen: boolean;
  editingTask: Task | null;
  selectedListId: ID | null;
  currentView: 'list' | 'calendar' | 'stats' | 'settings';
  
  // 数据状态
  lists: List[];
  tasks: Task[];
  loading: boolean;
  error: string | null;
  
  // 筛选状态
  dateRange: {
    from: string;
    to: string;
  };
  
  // Actions
  openTaskEditor: (task?: Task) => void;
  closeTaskEditor: () => void;
  setSelectedListId: (listId: ID | null) => void;
  setCurrentView: (view: 'list' | 'calendar' | 'stats' | 'settings') => void;
  setLists: (lists: List[]) => void;
  setTasks: (tasks: Task[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setDateRange: (range: { from: string; to: string }) => void;
  
  // 数据操作
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  removeTask: (taskId: ID) => void;
  addList: (list: List) => void;
  updateList: (list: List) => void;
  removeList: (listId: ID) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // 初始状态
  isTaskEditorOpen: false,
  editingTask: null,
  selectedListId: null,
  currentView: 'list',
  lists: [],
  tasks: [],
  loading: false,
  error: null,
  dateRange: {
    from: new Date().toISOString().split('T')[0],
    to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  
  // Actions
  openTaskEditor: (task) => set({ isTaskEditorOpen: true, editingTask: task || null }),
  closeTaskEditor: () => set({ isTaskEditorOpen: false, editingTask: null }),
  setSelectedListId: (listId) => set({ selectedListId: listId }),
  setCurrentView: (view) => set({ currentView: view }),
  
  // 数据 Actions
  setLists: (lists) => set({ lists }),
  setTasks: (tasks) => set({ tasks }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setDateRange: (range) => set({ dateRange: range }),
  
  // 数据操作
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (updatedTask) => set((state) => ({
    tasks: state.tasks.map(task => task.id === updatedTask.id ? updatedTask : task)
  })),
  removeTask: (taskId) => set((state) => ({
    tasks: state.tasks.filter(task => task.id !== taskId)
  })),
  
  addList: (list) => set((state) => ({ lists: [...state.lists, list] })),
  updateList: (updatedList) => set((state) => ({
    lists: state.lists.map(list => list.id === updatedList.id ? updatedList : list)
  })),
  removeList: (listId) => set((state) => ({
    lists: state.lists.filter(list => list.id !== listId)
  })),
}));

// 选择器
export const useSelectedTasks = () => {
  const { tasks, selectedListId } = useAppStore();
  
  if (selectedListId === null) {
    return tasks;
  }
  
  return tasks.filter(task => task.list_id === selectedListId);
};

export const useTasksByDate = (date: string) => {
  const { tasks } = useAppStore();
  return tasks.filter(task => task.date === date);
};

export const useTasksInRange = (from: string, to: string) => {
  const { tasks } = useAppStore();
  return tasks.filter(task => task.date >= from && task.date <= to);
};