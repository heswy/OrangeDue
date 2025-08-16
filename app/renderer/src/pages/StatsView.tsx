import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { Stats } from '../../../shared/types';

interface StatsViewProps {
  className?: string;
}

export const StatsView: React.FC<StatsViewProps> = ({ className = '' }) => {
  const { setLoading, loading } = useAppStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadStats();
  }, [dateRange]);

  const loadStats = async () => {
    setLoading(true);
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.stats.range(dateRange);
        if (result.ok && result.data) {
          setStats(result.data);
        }
      } else {
        // 浏览器环境下的模拟数据
        const mockStats: Stats = {
          completed: 15,
          pending: 8,
          overdue: 2,
          completionRate: 0.75,
          heatmap: []
        };
        setStats(mockStats);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getHeatmapColor = (count: number, maxCount: number) => {
    if (count === 0) return 'bg-gray-100';
    const intensity = count / maxCount;
    if (intensity <= 0.25) return 'bg-green-200';
    if (intensity <= 0.5) return 'bg-green-300';
    if (intensity <= 0.75) return 'bg-green-400';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col bg-gray-50 ${className}`}>
      {/* 头部控制栏 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">统计总结</h1>
            <p className="text-sm text-gray-500 mt-1">查看您的任务完成情况和工作效率</p>
          </div>
          
          {/* 时间范围选择 */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setDateRange('week')}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                dateRange === 'week'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              本周
            </button>
            <button
              onClick={() => setDateRange('month')}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                dateRange === 'month'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              本月
            </button>
            <button
              onClick={() => setDateRange('year')}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                dateRange === 'year'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              本年
            </button>
          </div>
        </div>
      </div>

      {/* 统计内容 */}
      <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
        {!stats ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">📊</div>
            <p className="text-gray-500">暂无统计数据</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 总体统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">总任务数</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.completed + stats.pending}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">已完成</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">待办中</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 完成率 */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">完成率</h3>
              <div className="flex items-center">
                <div className="flex-1">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>完成进度</span>
                    <span>{Math.round(stats.completionRate * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${stats.completionRate * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="ml-6 text-right">
                  <p className="text-2xl font-bold text-green-600">{Math.round(stats.completionRate * 100)}%</p>
                  <p className="text-sm text-gray-500">完成率</p>
                </div>
              </div>
            </div>

            {/* 活动热力图 */}
            {stats.heatmap && stats.heatmap.length > 0 && (
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">活动热力图</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-7 gap-1">
                    {stats.heatmap.map((day, index) => (
                      <div
                        key={index}
                        className={`w-3 h-3 rounded-sm ${getHeatmapColor(day.count, day.maxCount)} hover:ring-2 hover:ring-gray-300 cursor-pointer`}
                        title={`${day.date}: ${day.count} 个任务 (${day.completed} 完成, ${day.pending} 待办)`}
                      />
                    ))}
                  </div>
                  
                  {/* 图例 */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>较少</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-gray-100 rounded-sm" />
                      <div className="w-3 h-3 bg-green-200 rounded-sm" />
                      <div className="w-3 h-3 bg-green-300 rounded-sm" />
                      <div className="w-3 h-3 bg-green-400 rounded-sm" />
                      <div className="w-3 h-3 bg-green-500 rounded-sm" />
                    </div>
                    <span>较多</span>
                  </div>
                </div>
              </div>
            )}

            {/* 最近活动 */}
            {stats.heatmap.length > 0 && (
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">最近活动</h3>
                <div className="space-y-3">
                  {stats.heatmap
                    .filter(day => day.count > 0)
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .slice(0, 7)
                    .map(day => (
                      <div key={day.date} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{formatDate(day.date)}</p>
                          <p className="text-xs text-gray-500">
                            {day.count} 个任务
                          </p>
                        </div>
                        <div className="flex items-center space-x-4 text-xs">
                          <span className="text-green-600">✓ {day.completed}</span>
                          <span className="text-yellow-600">⏳ {day.pending}</span>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};