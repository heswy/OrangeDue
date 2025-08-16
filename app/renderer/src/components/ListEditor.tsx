import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { List } from '../../../shared/types';

interface ListEditorProps {
  isOpen: boolean;
  onClose: () => void;
  list?: List | null;
}

export const ListEditor: React.FC<ListEditorProps> = ({ isOpen, onClose, list }) => {
  const { addList, updateList } = useAppStore();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6'
  });

  const colorOptions = [
    { name: '蓝色', value: '#3B82F6' },
    { name: '绿色', value: '#10B981' },
    { name: '紫色', value: '#8B5CF6' },
    { name: '红色', value: '#EF4444' },
    { name: '黄色', value: '#F59E0B' },
    { name: '粉色', value: '#EC4899' },
    { name: '青色', value: '#06B6D4' },
    { name: '橙色', value: '#F97316' }
  ];

  // 初始化表单数据
  useEffect(() => {
    if (isOpen) {
      if (list) {
        // 编辑模式
        setFormData({
          name: list.name,
          color: list.color
        });
      } else {
        // 新建模式
        setFormData({
          name: '',
          color: '#3B82F6'
        });
      }
    }
  }, [isOpen, list]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      if (list) {
        // 更新清单
        const result = await window.electronAPI.lists.update(list.id, {
          name: formData.name,
          color: formData.color
        });
        if (result.ok && result.data) {
          updateList(result.data);
          onClose();
        }
      } else {
        // 创建新清单
        const result = await window.electronAPI.lists.create({
          name: formData.name,
          color: formData.color
        });
        if (result.ok && result.data) {
          addList(result.data);
          onClose();
        }
      }
    } catch (error) {
      console.error('Failed to save list:', error);
      
      let errorMessage = '保存清单失败，请重试';
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4">
        <form onSubmit={handleSubmit}>
          {/* 头部 */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {list ? '编辑清单' : '新建清单'}
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
            {/* 清单名称 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                清单名称 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="输入清单名称"
                required
              />
            </div>

            {/* 颜色选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                颜色
              </label>
              <div className="grid grid-cols-4 gap-3">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => handleInputChange('color', color.value)}
                    className={`w-full h-10 rounded-lg border-2 transition-all ${
                      formData.color === color.value
                        ? 'border-gray-900 ring-2 ring-gray-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {formData.color === color.value && (
                      <svg className="w-5 h-5 text-white mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 预览 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                预览
              </label>
              <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: formData.color }}
                  />
                  <span className="text-sm text-gray-900">
                    {formData.name || '清单名称'}
                  </span>
                </div>
              </div>
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
              {loading ? '保存中...' : (list ? '更新' : '创建')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};