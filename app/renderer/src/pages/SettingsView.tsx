import React from 'react';
import { Settings, Database, Info } from 'lucide-react';
import { BackupManager } from '../components/BackupManager';

interface SettingsViewProps {
  className?: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ className = '' }) => {
  return (
    <div className={`flex-1 overflow-y-auto p-6 max-w-4xl mx-auto bg-gray-50 ${className}`}>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-6 h-6 text-gray-700" />
          <h1 className="text-2xl font-bold text-gray-900">设置</h1>
        </div>
        <p className="text-gray-600">管理应用程序设置和数据</p>
      </div>

      <div className="space-y-8">
        {/* 数据管理 */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-gray-700" />
            <h2 className="text-xl font-semibold text-gray-900">数据管理</h2>
          </div>
          <BackupManager />
        </section>

        {/* 应用信息 */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-gray-700" />
            <h2 className="text-xl font-semibold text-gray-900">应用信息</h2>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">应用名称</span>
                <span className="font-medium text-gray-900">OrangeDue</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">版本</span>
                <span className="font-medium text-gray-900">1.0.0</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">技术栈</span>
                <span className="font-medium text-gray-900">Electron + React + TypeScript</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">开发者</span>
                <span className="font-medium text-gray-900">阿橙</span>
              </div>
            </div>
          </div>
        </section>

        {/* 使用提示 */}
        <section>
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3">使用提示</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p>• 定期导出备份以防止数据丢失</p>
              <p>• 可以通过日历视图快速查看和管理任务</p>
              <p>• 使用提醒功能确保不错过重要任务</p>
              <p>• 通过统计页面了解您的工作效率</p>
              <p>• 支持拖拽操作来快速调整任务时间</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsView;