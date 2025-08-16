import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { Task, List, Priority } from '../../../shared/types';

interface TaskEditorProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  initialData?: Partial<Task>;
}

export const TaskEditor: React.FC<TaskEditorProps> = ({ isOpen, onClose, task, initialData }) => {
  const { lists, addTask, updateTask } = useAppStore();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    start_time: '',
    end_time: '',
    priority: 'medium' as Priority,
    list_id: null as number | null,
    notes: '',
    remind_at: ''
  });

  // 初始化表单数据
  useEffect(() => {
    if (isOpen) {
      if (task) {
        // 编辑模式
        setFormData({
          title: task.title,
          date: task.date,
          start_time: task.start_time || '',
          end_time: task.end_time || '',
          priority: task.priority,
          list_id: task.list_id,
          notes: task.notes || '',
          remind_at: task.remind_at || ''
        });
      } else if (initialData) {
        // 使用初始数据
        setFormData({
          title: initialData.title || '',
          date: initialData.date || new Date().toISOString().split('T')[0],
          start_time: initialData.start_time || '',
          end_time: initialData.end_time || '',
          priority: initialData.priority || 'medium',
          list_id: initialData.list_id || null,
          notes: initialData.notes || '',
          remind_at: initialData.remind_at || ''
        });
      } else {
        // 新建模式
        setFormData({
          title: '',
          date: new Date().toISOString().split('T')[0],
          start_time: '',
          end_time: '',
          priority: 'medium',
          list_id: null,
          notes: '',
          remind_at: ''
        });
      }
    }
  }, [isOpen, task, initialData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 调度提醒
  const scheduleReminder = async (taskId: number, remindAt: string, title: string) => {
    try {
      if (window.electronAPI && window.electronAPI.reminder) {
        await window.electronAPI.reminder.schedule({
          taskId,
          remindAt,
          title,
          body: `任务提醒: ${title}`
        });
      }
    } catch (error) {
      console.error('Failed to schedule reminder:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setLoading(true);
    try {
      if (task) {
        // 更新任务
        const result = await window.electronAPI.tasks.update(task.id, {
          title: formData.title,
          date: formData.date,
          start_time: formData.start_time || undefined,
          end_time: formData.end_time || undefined,
          priority: formData.priority,
          list_id: formData.list_id ?? null,
          notes: formData.notes || undefined,
          remind_at: formData.remind_at || undefined
        });
        if (result.ok && result.data) {
          updateTask(result.data);
          
          // 调度提醒
          if (formData.remind_at) {
            await scheduleReminder(result.data.id, formData.remind_at, formData.title);
          }
          
          onClose();
        }
      } else {
        // 创建新任务
        const result = await window.electronAPI.tasks.create({
          title: formData.title,
          date: formData.date,
          start_time: formData.start_time || undefined,
          end_time: formData.end_time || undefined,
          priority: formData.priority,
          list_id: formData.list_id ?? null,
          notes: formData.notes || undefined,
          remind_at: formData.remind_at || undefined
        });
        if (result.ok && result.data) {
          addTask(result.data);
          
          // 调度提醒
          if (formData.remind_at) {
            await scheduleReminder(result.data.id, formData.remind_at, formData.title);
          }
          
          onClose();
        }
      }
    } catch (error) {
      console.error('Failed to save task:', error);
      console.error('Form data:', formData);
      console.error('Window electronAPI:', window.electronAPI);
      
      let errorMessage = '保存任务失败，请重试';
      if (error instanceof Error) {
        errorMessage += `\n错误详情: ${error.message}`;
      }
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* 头部 */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {task ? '编辑任务' : '新建任务'}
              </h2>
              <button
                type="button"
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* 表单内容 */}
          <div className="p-6 space-y-4">
            {/* 任务标题 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                任务标题 *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="输入任务标题"
                required
              />
            </div>

            {/* 日期 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                日期 *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* 时间范围 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  开始时间
                </label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => handleInputChange('start_time', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  结束时间
                </label>
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => handleInputChange('end_time', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* 优先级 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                优先级
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value as Priority)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
            </div>

            {/* 清单 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                清单
              </label>
              <select
                value={formData.list_id || ''}
                onChange={(e) => handleInputChange('list_id', e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">收件箱</option>
                {lists.map((list: List) => (
                  <option key={list.id} value={list.id}>
                    {list.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 备注 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                备注
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="添加备注信息"
              />
            </div>

            {/* 提醒时间 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                提醒时间
              </label>
              <input
                type="datetime-local"
                value={formData.remind_at}
                onChange={(e) => handleInputChange('remind_at', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={loading}
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? '保存中...' : (task ? '更新' : '创建')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};