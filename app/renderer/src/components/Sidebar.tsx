import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { List } from '../../../shared/types';

interface SidebarProps {
  onNewList: () => void;
  onEditList: (list: List) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNewList, onEditList }) => {
  const { currentView, setCurrentView, selectedListId, setSelectedListId, lists, tasks, setLists } = useAppStore();
  const [hoveredListId, setHoveredListId] = useState<number | null>(null);

  const handleListSelect = (listId: number | null) => {
    setSelectedListId(listId);
    if (currentView !== 'list') {
      setCurrentView('list');
    }
  };

  const getTaskCount = (listId: number | null) => {
    return tasks.filter(task => task.list_id === listId && task.status === 'pending').length;
  };

  const handleDeleteList = async (listId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (window.confirm('确定要删除这个清单吗？清单中的所有任务也会被删除。')) {
      try {
        if (window.electronAPI) {
          await window.electronAPI.lists.delete(listId);
          const result = await window.electronAPI.lists.getAll();
          if (result.ok && result.data) {
            setLists(result.data);
          }
          
          // 如果删除的是当前选中的清单，切换到收件箱
          if (selectedListId === listId) {
            setSelectedListId(null);
          }
        }
      } catch (error) {
        console.error('删除清单失败:', error);
        alert('删除清单失败，请重试');
      }
    }
  };

  const handleEditList = (list: List, event: React.MouseEvent) => {
    event.stopPropagation();
    onEditList(list);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* 顶部导航 */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900">日程管理</h1>
      </div>

      {/* 视图切换 */}
      <div className="p-4 space-y-2">
        <button
          onClick={() => setCurrentView('list')}
          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
            currentView === 'list'
              ? 'bg-blue-50 text-blue-700 font-medium'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          📋 清单视图
        </button>
        <button
          onClick={() => setCurrentView('calendar')}
          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
            currentView === 'calendar'
              ? 'bg-blue-50 text-blue-700 font-medium'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          📅 日历视图
        </button>
        <button
          onClick={() => setCurrentView('stats')}
          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
            currentView === 'stats'
              ? 'bg-blue-50 text-blue-700 font-medium'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          📊 统计总结
        </button>
        <button
          onClick={() => setCurrentView('settings')}
          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
            currentView === 'settings'
              ? 'bg-blue-50 text-blue-700 font-medium'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          ⚙️ 设置
        </button>
      </div>

      {/* 清单列表 */}
      <div className="flex-1 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-900">清单</h2>
          <button
            onClick={onNewList}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            + 新建
          </button>
        </div>
        
        {/* 收件箱 */}
        <div className="space-y-1 mb-4">
          <button
            onClick={() => handleListSelect(null)}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
              selectedListId === null
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              <span>收件箱</span>
            </div>
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
              {getTaskCount(null)}
            </span>
          </button>
        </div>

        {/* 自定义清单 */}
        <div className="space-y-1">
          {lists.map((list) => (
            <div key={list.id}>
              <button
                onClick={() => handleListSelect(list.id)}
                onMouseEnter={() => setHoveredListId(list.id)}
                onMouseLeave={() => setHoveredListId(null)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                  selectedListId === list.id
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: list.color || '#6B7280' }}
                  />
                  <span>{list.name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  {hoveredListId === list.id && (
                    <>
                      <button
                        onClick={(e) => handleEditList(list, e)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="编辑清单"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => handleDeleteList(list.id, e)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="删除清单"
                      >
                        🗑️
                      </button>
                    </>
                  )}
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                    {getTaskCount(list.id)}
                  </span>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};