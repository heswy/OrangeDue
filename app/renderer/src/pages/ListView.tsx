import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { Task } from '../../../shared/types';

interface ListViewProps {
  onEditTask: (task: Task) => void;
}

export const ListView: React.FC<ListViewProps> = ({ onEditTask }) => {
  const { 
    selectedListId, 
    tasks, 
    lists, 
    setTasks, 
    setLists, 
    updateTask, 
    removeTask 
  } = useAppStore();
  
  const [loading, setLoading] = useState(false);

  // 获取当前选中的清单
  const selectedList = selectedListId ? lists.find(l => l.id === selectedListId) : null;
  const listName = selectedList ? selectedList.name : '收件箱';

  // 筛选当前清单的任务
  const filteredTasks = tasks.filter(task => task.list_id === selectedListId);
  const pendingTasks = filteredTasks.filter(task => task.status === 'pending');
  const completedTasks = filteredTasks.filter(task => task.status === 'completed');

  // 加载数据
  useEffect(() => {
    loadData();
  }, [selectedListId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 检查是否在 Electron 环境中
      if (window.electronAPI) {
        // 加载清单
         const listsResult = await window.electronAPI.lists.getAll();
         if (listsResult.ok && listsResult.data) {
           setLists(listsResult.data);
         }

         // 加载所有任务（不限制清单）
         const tasksResult = await window.electronAPI.tasks.query({});
         if (tasksResult.ok && tasksResult.data) {
           setTasks(tasksResult.data);
         }
      } else {
        // 浏览器环境下的模拟数据
        console.log('Running in browser mode with mock data');
        setLists([
            { id: 1, name: '收件箱', color: '#6B7280', sort_order: 0, created_at: Date.now().toString(), updated_at: Date.now().toString() },
            { id: 2, name: '工作', color: '#3B82F6', sort_order: 1, created_at: Date.now().toString(), updated_at: Date.now().toString() }
          ]);
        setTasks([]);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      if (window.electronAPI) {
         const result = await window.electronAPI.tasks.toggleComplete(task.id);
         if (result.ok && result.data) {
           updateTask(result.data);
         }
       } else {
         // 浏览器环境下的模拟操作
         const updatedTask: Task = {
           ...task,
           status: task.status === 'pending' ? 'completed' : 'pending'
         };
         updateTask(updatedTask);
       }
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (confirm('确定要删除这个任务吗？')) {
      try {
        if (window.electronAPI) {
          const result = await window.electronAPI.tasks.delete(taskId);
          if (result.ok) {
            removeTask(taskId);
          }
        } else {
          // 浏览器环境下的模拟操作
          removeTask(taskId);
        }
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityText = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return '高';
      case 'medium': return '中';
      case 'low': return '低';
      default: return '无';
    }
  };

  const TaskItem: React.FC<{ task: Task; completed?: boolean }> = ({ task, completed = false }) => (
    <div className={`p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow ${
      completed ? 'bg-gray-50' : 'bg-white'
    }`}>
      <div className="flex items-start space-x-3">
        <button
          onClick={() => handleToggleComplete(task)}
          className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            completed 
              ? 'bg-green-500 border-green-500 text-white' 
              : 'border-gray-300 hover:border-green-400'
          }`}
        >
          {completed && (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-medium ${
              completed ? 'text-gray-500 line-through' : 'text-gray-900'
            }`}>
              {task.title}
            </h3>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                getPriorityColor(task.priority)
              }`}>
                {getPriorityText(task.priority)}
              </span>
              <button
                onClick={() => onEditTask(task)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="text-gray-400 hover:text-red-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          
          {task.notes && (
            <p className={`mt-1 text-sm ${
              completed ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {task.notes}
            </p>
          )}
          
          <div className={`mt-2 flex items-center space-x-4 text-xs ${
            completed ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <span>📅 {task.date}</span>
            {task.start_time && <span>🕐 {task.start_time}</span>}
            {task.end_time && <span>- {task.end_time}</span>}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* 头部 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{listName}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {pendingTasks.length} 个待办任务，{completedTasks.length} 个已完成
            </p>
          </div>
        </div>
      </div>

      {/* 任务列表 */}
      <div className="flex-1 p-6 overflow-y-auto">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">📝</div>
            <p className="text-gray-500">暂无任务</p>
            <p className="text-sm text-gray-400 mt-1">点击右下角的 + 按钮添加新任务</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 待办任务 */}
            {pendingTasks.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">待办任务</h2>
                <div className="space-y-3">
                  {pendingTasks.map(task => (
                    <TaskItem key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}

            {/* 已完成任务 */}
            {completedTasks.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">已完成</h2>
                <div className="space-y-3">
                  {completedTasks.map(task => (
                    <TaskItem key={task.id} task={task} completed />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};