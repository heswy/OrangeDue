export type ID = number;

export type Priority = 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'completed';

export interface Task {
  id: ID;
  title: string;
  date: string; // YYYY-MM-DD
  start_time?: string; // ISO datetime
  end_time?: string; // ISO datetime
  priority: Priority;
  list_id?: ID | null;
  status: TaskStatus;
  notes?: string | null;
  remind_at?: string | null; // ISO datetime
  created_at: string; // ISO
  updated_at: string; // ISO
}

export interface List {
  id: ID;
  name: string;
  color?: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface QueryTasks {
  list_id?: ID | null;
  status?: TaskStatus;
  date_from?: string; // YYYY-MM-DD
  date_to?: string; // YYYY-MM-DD
}

export interface Stats {
  completed: number;
  pending: number;
  completionRate: number; // 0..1
  heatmap: Array<{
    date: string;
    count: number;
    completed: number;
    pending: number;
  }>;
}

export interface Result<T> {
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// Electron API 类型定义
export interface ElectronAPI {
  lists: {
    getAll(): Promise<Result<List[]>>;
    create(payload: { name: string; color?: string }): Promise<Result<List>>;
    update(id: ID, patch: Partial<Omit<List, 'id' | 'created_at' | 'updated_at'>>): Promise<Result<List>>;
    delete(id: ID): Promise<Result<{ removed: boolean }>>;
  };
  tasks: {
    query(q: QueryTasks): Promise<Result<Task[]>>;
    getById(id: ID): Promise<Result<Task>>;
    create(payload: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'status'> & { status?: TaskStatus }): Promise<Result<Task>>;
    update(id: ID, patch: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>): Promise<Result<Task>>;
    toggleComplete(id: ID, completed?: boolean): Promise<Result<Task>>;
    bulkMove(payload: { ids: ID[]; date?: string; start_time?: string; end_time?: string }): Promise<Result<{ updated: number }>>;
    delete(id: ID): Promise<Result<{ removed: boolean }>>;
  };
  stats: {
    range(payload: { from: string; to: string }): Promise<Result<Stats>>;
  };
  backup: {
    export(): Promise<Result<{ filePath: string }>>;
    import(filePath: string): Promise<Result<{ imported: number }>>;
  };
  reminder: {
    schedule(payload: { id: ID; when: string; title: string; body?: string }): Promise<Result<{ scheduled: boolean }>>;
    cancel(payload: { id: ID; when: string }): Promise<Result<{ cancelled: boolean }>>;
    showNotification(payload: { title: string; body?: string; icon?: string }): Promise<Result<{ shown: boolean }>>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}