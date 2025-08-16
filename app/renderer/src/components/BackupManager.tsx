import React, { useState } from 'react';
import { Download, Upload, AlertCircle, CheckCircle } from 'lucide-react';

interface BackupManagerProps {
  className?: string;
}

interface BackupResult {
  success: boolean;
  message: string;
  filePath?: string;
  imported?: number;
}

export const BackupManager: React.FC<BackupManagerProps> = ({ className = '' }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<BackupResult | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setResult(null);
    
    try {
      if (window.electronAPI && window.electronAPI.backup) {
        const result = await window.electronAPI.backup.export();
        if (result.ok) {
          setResult({
            success: true,
            message: `备份文件已保存到: ${result.data.filePath}`,
            filePath: result.data.filePath
          });
        } else {
          setResult({
            success: false,
            message: result.error || '导出失败'
          });
        }
      } else {
        // 浏览器环境下的模拟导出
        const mockData = {
          lists: [],
          tasks: [],
          exportTime: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(mockData, null, 2)], {
          type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orangedue-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        setResult({
          success: true,
          message: '备份文件已下载到浏览器默认下载目录'
        });
      }
    } catch (error) {
      console.error('Export failed:', error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : '导出过程中发生未知错误'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    setIsImporting(true);
    setResult(null);
    
    try {
      if (window.electronAPI && window.electronAPI.backup) {
        const result = await window.electronAPI.backup.import();
        if (result.ok) {
          setResult({
            success: true,
            message: `成功导入 ${result.data.imported} 条记录`,
            imported: result.data.imported
          });
          
          // 导入成功后刷新页面
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          setResult({
            success: false,
            message: result.error || '导入失败'
          });
        }
      } else {
        // 浏览器环境下的模拟导入
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              try {
                const data = JSON.parse(e.target?.result as string);
                console.log('Imported data:', data);
                setResult({
                  success: true,
                  message: '模拟导入成功（浏览器环境下仅为演示）'
                });
              } catch (error) {
                setResult({
                  success: false,
                  message: '文件格式错误，请选择有效的备份文件'
                });
              }
            };
            reader.readAsText(file);
          }
        };
        input.click();
      }
    } catch (error) {
      console.error('Import failed:', error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : '导入过程中发生未知错误'
      });
    } finally {
      setIsImporting(false);
    }
  };

  const clearResult = () => {
    setResult(null);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">数据备份与恢复</h3>
      
      <div className="space-y-4">
        {/* 导出备份 */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">导出备份</h4>
            <p className="text-sm text-gray-600 mt-1">
              将所有清单和任务数据导出为 JSON 文件
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-4 h-4" />
            {isExporting ? '导出中...' : '导出备份'}
          </button>
        </div>

        {/* 导入备份 */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">导入备份</h4>
            <p className="text-sm text-gray-600 mt-1">
              从 JSON 备份文件恢复清单和任务数据
            </p>
          </div>
          <button
            onClick={handleImport}
            disabled={isImporting}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Upload className="w-4 h-4" />
            {isImporting ? '导入中...' : '导入备份'}
          </button>
        </div>

        {/* 结果显示 */}
        {result && (
          <div className={`p-4 rounded-lg border ${
            result.success 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-start gap-3">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {result.success ? '操作成功' : '操作失败'}
                </p>
                <p className="text-sm mt-1">{result.message}</p>
                {result.success && result.imported !== undefined && (
                  <p className="text-xs mt-2 opacity-75">
                    页面将在 2 秒后自动刷新以显示导入的数据
                  </p>
                )}
              </div>
              <button
                onClick={clearResult}
                className="text-xs opacity-60 hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">使用说明</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 导出备份会将所有清单和任务保存为 JSON 文件</li>
            <li>• 导入备份时会自动跳过重复的数据（相同名称的清单或相同标题和日期的任务）</li>
            <li>• 建议定期导出备份以防数据丢失</li>
            <li>• 导入备份后页面会自动刷新以显示最新数据</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BackupManager;