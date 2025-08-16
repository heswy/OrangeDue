import type { List, Task } from '../../shared/types';

// 内存数据库实现（临时方案）
interface MemoryDB {
  lists: List[];
  tasks: Task[];
  nextListId: number;
  nextTaskId: number;
}

let db: MemoryDB;

export function initDatabase(): Promise<void> {
  return new Promise((resolve) => {
    db = {
      lists: [
        {
          id: 1,
          name: '默认清单',
          color: '#3b82f6',
          sort_order: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ],
      tasks: [],
      nextListId: 2,
      nextTaskId: 1,
    };
    
    console.log('Memory database initialized');
    resolve();
  });
}

export function getDatabase(): MemoryDB {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

export function closeDatabase(): void {
  // 内存数据库无需关闭
}