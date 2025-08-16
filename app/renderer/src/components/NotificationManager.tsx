import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { Task } from '../../../shared/types';

interface NotificationManagerProps {
  onEditTask: (task: Task) => void;
}

export const NotificationManager: React.FC<NotificationManagerProps> = ({ onEditTask }) => {
  const { tasks } = useAppStore();
  const [upcomingReminders, setUpcomingReminders] = useState<Task[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // 检查即将到来的提醒
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const nextHour = new Date(now.getTime() + 60 * 60 * 1000); // 下一小时
      
      const upcoming = tasks.filter(task => {
        if (!task.remind_at || task.status === 'completed') return false;
        
        const remindTime = new Date(task.remind_at);
        return remindTime > now && remindTime <= nextHour;
      });
      
      setUpcomingReminders(upcoming);
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60000); // 每分钟检查一次

    return () => clearInterval(interval);
  }, [tasks]);

  // 测试通知功能
  const testNotification = async () => {
    try {
      if (window.electronAPI && window.electronAPI.reminder) {
        await window.electronAPI.reminder.showNotification({
          title: '测试通知',
          body: '这是一个测试通知，用于验证通知功能是否正常工作。',
        });
      } else {
        // 浏览器环境下的通知
        if ('Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification('测试通知', {
              body: '这是一个测试通知，用于验证通知功能是否正常工作。',
              icon: '/favicon.ico'
            });
          } else if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
              new Notification('测试通知', {
                body: '这是一个测试通知，用于验证通知功能是否正常工作。',
                icon: '/favicon.ico'
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to show test notification:', error);
    }
  };

  // 立即提醒任务
  const remindNow = async (task: Task) => {
    try {
      if (window.electronAPI && window.electronAPI.reminder) {
        await window.electronAPI.reminder.showNotification({
          title: `任务提醒: ${task.title}`,
          body: task.notes || '您有一个任务需要处理',
        });
      }
    } catch (error) {
      console.error('Failed to show reminder:', error);
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <div className="relative">
      {/* 通知按钮 */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        title="通知管理"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 19H6.5A2.5 2.5 0 014 16.5v-9A2.5 2.5 0 016.5 5h11A2.5 2.5 0 0120 7.5v3.5" />
        </svg>
        {upcomingReminders.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {upcomingReminders.length}
          </span>
        )}
      </button>

      {/* 通知面板 */}
      {showNotifications && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">通知管理</h3>
              <button
                onClick={testNotification}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                测试通知
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {upcomingReminders.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 19H6.5A2.5 2.5 0 014 16.5v-9A2.5 2.5 0 016.5 5h11A2.5 2.5 0 0120 7.5v3.5" />
                </svg>
                <p>暂无即将到来的提醒</p>
                <p className="text-sm mt-1">下一小时内的任务提醒将显示在这里</p>
              </div>
            ) : (
              <div className="p-2">
                <h4 className="text-sm font-medium text-gray-700 mb-3 px-2">即将到来的提醒</h4>
                <div className="space-y-2">
                  {upcomingReminders.map(task => (
                    <div key={task.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 text-sm">{task.title}</h5>
                          <p className="text-xs text-gray-600 mt-1">
                            提醒时间: {task.remind_at ? formatDateTime(task.remind_at) : ''}
                          </p>
                          {task.notes && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          <button
                            onClick={() => remindNow(task)}
                            className="p-1 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 rounded"
                            title="立即提醒"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 19H6.5A2.5 2.5 0 014 16.5v-9A2.5 2.5 0 016.5 5h11A2.5 2.5 0 0120 7.5v3.5" />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              onEditTask(task);
                              setShowNotifications(false);
                            }}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
                            title="编辑任务"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 点击外部关闭 */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
};