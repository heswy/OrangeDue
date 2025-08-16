import { ipcMain, Notification, dialog, app } from 'electron';
import { getDatabase } from '../db/database';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import type { List, Task, QueryTasks, Stats, Result, ID } from '../../shared/types';

// 存储定时器的 Map
const reminderTimers = new Map<string, NodeJS.Timeout>();

export function setupIpcHandlers(): void {
  // Lists handlers
  ipcMain.handle('lists:getAll', handleGetAllLists);
  ipcMain.handle('lists:create', handleCreateList);
  ipcMain.handle('lists:update', handleUpdateList);
  ipcMain.handle('lists:delete', handleDeleteList);
  
  // Tasks handlers
  ipcMain.handle('tasks:query', handleQueryTasks);
  ipcMain.handle('tasks:getById', handleGetTaskById);
  ipcMain.handle('tasks:create', handleCreateTask);
  ipcMain.handle('tasks:update', handleUpdateTask);
  ipcMain.handle('tasks:toggleComplete', handleToggleComplete);
  ipcMain.handle('tasks:bulkMove', handleBulkMove);
  ipcMain.handle('tasks:delete', handleDeleteTask);
  
  // Stats handlers
  ipcMain.handle('stats:range', handleStatsRange);
  
  // Backup handlers
  ipcMain.handle('backup:export', handleExportBackup);
  ipcMain.handle('backup:import', handleImportBackup);
  
  // Reminder handlers
  ipcMain.handle('reminder:schedule', handleScheduleReminder);
  ipcMain.handle('reminder:cancel', handleCancelReminder);
  ipcMain.handle('reminder:showNotification', handleShowNotification);
}

// Helper functions
function success<T>(data: T): Result<T> {
  return { ok: true, data };
}

function error(code: string, message: string): Result<never> {
  return { ok: false, error: { code, message } };
}

// Lists handlers
async function handleGetAllLists(): Promise<Result<List[]>> {
  try {
    const db = getDatabase();
    const lists = [...db.lists].sort((a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at));
    return success(lists);
  } catch (err) {
    return error('DB_ERROR', `Failed to get lists: ${err}`);
  }
}

async function handleCreateList(event: any, payload: { name: string; color?: string }): Promise<Result<List>> {
  try {
    const db = getDatabase();
    const now = new Date().toISOString();
    const maxOrder = Math.max(...db.lists.map(l => l.sort_order), 0);
    const sortOrder = maxOrder + 1;
    
    const list: List = {
      id: db.nextListId++,
      name: payload.name,
      color: payload.color || null,
      sort_order: sortOrder,
      created_at: now,
      updated_at: now,
    };
    
    db.lists.push(list);
    return success(list);
  } catch (err) {
    return error('DB_ERROR', `Failed to create list: ${err}`);
  }
}

async function handleUpdateList(event: any, { id, patch }: { id: ID; patch: Partial<Omit<List, 'id' | 'created_at' | 'updated_at'>> }): Promise<Result<List>> {
  try {
    const db = getDatabase();
    const now = new Date().toISOString();
    
    const listIndex = db.lists.findIndex(l => l.id === id);
    if (listIndex === -1) {
      return error('NOT_FOUND', 'List not found');
    }
    
    const updatedList = {
      ...db.lists[listIndex],
      ...patch,
      updated_at: now,
    };
    
    db.lists[listIndex] = updatedList;
    return success(updatedList);
  } catch (err) {
    return error('DB_ERROR', `Failed to update list: ${err}`);
  }
}

async function handleDeleteList(event: any, id: ID): Promise<Result<{ removed: boolean }>> {
  try {
    const db = getDatabase();
    
    // 将该清单下的任务的 list_id 设为 null
    db.tasks.forEach(task => {
      if (task.list_id === id) {
        task.list_id = null;
      }
    });
    
    // 删除清单
    const initialLength = db.lists.length;
    db.lists = db.lists.filter(l => l.id !== id);
    
    return success({ removed: db.lists.length < initialLength });
  } catch (err) {
    return error('DB_ERROR', `Failed to delete list: ${err}`);
  }
}

// Tasks handlers
async function handleQueryTasks(event: any, query: QueryTasks): Promise<Result<Task[]>> {
  try {
    const db = getDatabase();
    
    let tasks = [...db.tasks];
    
    if (query.list_id !== undefined) {
      if (query.list_id === null) {
        tasks = tasks.filter(t => t.list_id === null);
      } else {
        tasks = tasks.filter(t => t.list_id === query.list_id);
      }
    }
    
    if (query.status) {
      tasks = tasks.filter(t => t.status === query.status);
    }
    
    if (query.date_from) {
      tasks = tasks.filter(t => t.date >= query.date_from!);
    }
    
    if (query.date_to) {
      tasks = tasks.filter(t => t.date <= query.date_to!);
    }
    
    tasks.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      
      const timeA = a.start_time || '';
      const timeB = b.start_time || '';
      const timeCompare = timeA.localeCompare(timeB);
      if (timeCompare !== 0) return timeCompare;
      
      return a.created_at.localeCompare(b.created_at);
    });
    
    return success(tasks);
  } catch (err) {
    return error('DB_ERROR', `Failed to query tasks: ${err}`);
  }
}

async function handleGetTaskById(event: any, id: ID): Promise<Result<Task>> {
  try {
    const db = getDatabase();
    const task = db.tasks.find(t => t.id === id);
    
    if (!task) {
      return error('NOT_FOUND', 'Task not found');
    }
    
    return success(task);
  } catch (err) {
    return error('DB_ERROR', `Failed to get task: ${err}`);
  }
}

async function handleCreateTask(event: any, payload: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'status'> & { status?: 'pending' | 'completed' }): Promise<Result<Task>> {
  try {
    const db = getDatabase();
    const now = new Date().toISOString();
    
    const task: Task = {
      id: db.nextTaskId++,
      title: payload.title,
      date: payload.date,
      start_time: payload.start_time || undefined,
      end_time: payload.end_time || undefined,
      priority: payload.priority,
      list_id: payload.list_id || null,
      status: payload.status || 'pending',
      notes: payload.notes || undefined,
      remind_at: payload.remind_at || undefined,
      created_at: now,
      updated_at: now,
    };
    
    db.tasks.push(task);
    return success(task);
  } catch (err) {
    return error('DB_ERROR', `Failed to create task: ${err}`);
  }
}

async function handleUpdateTask(event: any, { id, patch }: { id: ID; patch: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>> }): Promise<Result<Task>> {
  try {
    const db = getDatabase();
    const now = new Date().toISOString();
    
    const taskIndex = db.tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) {
      return error('NOT_FOUND', 'Task not found');
    }
    
    const updatedTask = {
      ...db.tasks[taskIndex],
      ...patch,
      updated_at: now,
    };
    
    db.tasks[taskIndex] = updatedTask;
    return success(updatedTask);
  } catch (err) {
    return error('DB_ERROR', `Failed to update task: ${err}`);
  }
}

async function handleToggleComplete(event: any, { id, completed }: { id: ID; completed?: boolean }): Promise<Result<Task>> {
  try {
    const db = getDatabase();
    const now = new Date().toISOString();
    
    const taskIndex = db.tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) {
      return error('NOT_FOUND', 'Task not found');
    }
    
    // 如果没有指定 completed，则切换状态
    if (completed === undefined) {
      completed = db.tasks[taskIndex].status === 'pending';
    }
    
    const status = completed ? 'completed' : 'pending';
    db.tasks[taskIndex] = {
      ...db.tasks[taskIndex],
      status,
      updated_at: now,
    };
    
    return success(db.tasks[taskIndex]);
  } catch (err) {
    return error('DB_ERROR', `Failed to toggle task completion: ${err}`);
  }
}

async function handleBulkMove(event: any, payload: { ids: ID[]; date?: string; start_time?: string; end_time?: string }): Promise<Result<{ updated: number }>> {
  try {
    const db = getDatabase();
    const now = new Date().toISOString();
    
    let updated = 0;
    
    payload.ids.forEach(id => {
      const taskIndex = db.tasks.findIndex(t => t.id === id);
      if (taskIndex !== -1) {
        const updates: Partial<Task> = { updated_at: now };
        
        if (payload.date !== undefined) {
          updates.date = payload.date;
        }
        if (payload.start_time !== undefined) {
          updates.start_time = payload.start_time;
        }
        if (payload.end_time !== undefined) {
          updates.end_time = payload.end_time;
        }
        
        db.tasks[taskIndex] = {
          ...db.tasks[taskIndex],
          ...updates,
        };
        updated++;
      }
    });
    
    return success({ updated });
  } catch (err) {
    return error('DB_ERROR', `Failed to bulk move tasks: ${err}`);
  }
}

async function handleDeleteTask(event: any, id: ID): Promise<Result<{ removed: boolean }>> {
  try {
    const db = getDatabase();
    const initialLength = db.tasks.length;
    db.tasks = db.tasks.filter(t => t.id !== id);
    
    return success({ removed: db.tasks.length < initialLength });
  } catch (err) {
    return error('DB_ERROR', `Failed to delete task: ${err}`);
  }
}

// Stats handlers
async function handleStatsRange(event: any, payload: { from: string; to: string }): Promise<Result<Stats>> {
  try {
    const db = getDatabase();
    
    // 筛选日期范围内的任务
    const tasksInRange = db.tasks.filter(t => t.date >= payload.from && t.date <= payload.to);
    
    // 计算总体统计
    const completed = tasksInRange.filter(t => t.status === 'completed').length;
    const pending = tasksInRange.filter(t => t.status === 'pending').length;
    const total = completed + pending;
    const completionRate = total > 0 ? completed / total : 0;
    
    // 生成热力图数据
    const heatmapMap = new Map<string, { count: number; completed: number; pending: number }>();
    
    tasksInRange.forEach(task => {
      const date = task.date;
      if (!heatmapMap.has(date)) {
        heatmapMap.set(date, { count: 0, completed: 0, pending: 0 });
      }
      
      const data = heatmapMap.get(date)!;
      data.count++;
      if (task.status === 'completed') {
        data.completed++;
      } else {
        data.pending++;
      }
    });
    
    const heatmap = Array.from(heatmapMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    const stats: Stats = {
      completed,
      pending,
      completionRate,
      heatmap,
    };
    
    return success(stats);
  } catch (err) {
    return error('DB_ERROR', `Failed to get stats: ${err}`);
  }
}

// Backup handlers
async function handleExportBackup(): Promise<Result<{ filePath: string }>> {
  try {
    const db = getDatabase();
    
    // 获取所有数据
    const lists = [...db.lists];
    const tasks = [...db.tasks];
    
    // 创建备份数据
    const backupData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: {
        lists,
        tasks
      }
    };
    
    // 选择保存位置
    const result = await dialog.showSaveDialog({
      title: '导出备份文件',
      defaultPath: `orangedue-backup-${new Date().toISOString().split('T')[0]}.json`,
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    
    if (result.canceled || !result.filePath) {
      return error('CANCELLED', 'Export cancelled by user');
    }
    
    // 写入文件
    writeFileSync(result.filePath, JSON.stringify(backupData, null, 2), 'utf8');
    
    return success({ filePath: result.filePath });
  } catch (err) {
    return error('EXPORT_ERROR', `Failed to export backup: ${err}`);
  }
}

async function handleImportBackup(event: any, filePath?: string): Promise<Result<{ imported: number }>> {
  try {
    let targetFilePath = filePath;
    
    // 如果没有提供文件路径，显示文件选择对话框
    if (!targetFilePath) {
      const result = await dialog.showOpenDialog({
        title: '选择备份文件',
        filters: [
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile']
      });
      
      if (result.canceled || result.filePaths.length === 0) {
        return error('CANCELLED', 'Import cancelled by user');
      }
      
      targetFilePath = result.filePaths[0];
    }
    
    // 读取备份文件
    const backupContent = readFileSync(targetFilePath, 'utf8');
    const backupData = JSON.parse(backupContent);
    
    // 验证备份数据格式
    if (!backupData.data || !backupData.data.lists || !backupData.data.tasks) {
      return error('INVALID_FORMAT', 'Invalid backup file format');
    }
    
    const db = getDatabase();
    let importedCount = 0;
    
    // 导入清单
    for (const list of backupData.data.lists) {
      // 检查是否已存在相同名称的清单
      const existing = db.lists.find(l => l.name === list.name);
      if (!existing) {
        const newList: List = {
          ...list,
          id: db.nextListId++,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        db.lists.push(newList);
        importedCount++;
      }
    }
    
    // 导入任务
    for (const task of backupData.data.tasks) {
      // 检查是否已存在相同标题和日期的任务
      const existing = db.tasks.find(t => t.title === task.title && t.date === task.date);
      if (!existing) {
        const newTask: Task = {
          ...task,
          id: db.nextTaskId++,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        db.tasks.push(newTask);
        importedCount++;
      }
    }
    
    return success({ imported: importedCount });
  } catch (err) {
    return error('IMPORT_ERROR', `Failed to import backup: ${err}`);
  }
}

// Reminder handlers
async function handleScheduleReminder(event: any, { id, when, title, body }: { id: ID; when: string; title: string; body?: string }): Promise<Result<{ scheduled: boolean }>> {
  try {
    const reminderTime = new Date(when).getTime();
    const now = Date.now();
    
    if (reminderTime <= now) {
      return error('INVALID_TIME', 'Reminder time must be in the future');
    }
    
    const delay = reminderTime - now;
    const timerId = `${id}-${reminderTime}`;
    
    // 取消之前的提醒（如果存在）
    if (reminderTimers.has(timerId)) {
      clearTimeout(reminderTimers.get(timerId)!);
    }
    
    // 设置新的提醒
    const timer = setTimeout(() => {
      showNotification(title, body || '任务提醒');
      reminderTimers.delete(timerId);
    }, delay);
    
    reminderTimers.set(timerId, timer);
    
    return success({ scheduled: true });
  } catch (err) {
    return error('REMINDER_ERROR', `Failed to schedule reminder: ${err}`);
  }
}

async function handleCancelReminder(event: any, { id, when }: { id: ID; when: string }): Promise<Result<{ cancelled: boolean }>> {
  try {
    const reminderTime = new Date(when).getTime();
    const timerId = `${id}-${reminderTime}`;
    
    if (reminderTimers.has(timerId)) {
      clearTimeout(reminderTimers.get(timerId)!);
      reminderTimers.delete(timerId);
      return success({ cancelled: true });
    }
    
    return success({ cancelled: false });
  } catch (err) {
    return error('REMINDER_ERROR', `Failed to cancel reminder: ${err}`);
  }
}

async function handleShowNotification(event: any, { title, body, icon }: { title: string; body?: string; icon?: string }): Promise<Result<{ shown: boolean }>> {
  try {
    showNotification(title, body, icon);
    return success({ shown: true });
  } catch (err) {
    return error('NOTIFICATION_ERROR', `Failed to show notification: ${err}`);
  }
}

// 显示系统通知
function showNotification(title: string, body?: string, icon?: string) {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title,
      body: body || '',
      icon: icon || undefined,
      silent: false
    });
    
    notification.show();
  }
}