import { contextBridge, ipcRenderer } from 'electron';
import type { ElectronAPI } from '../shared/types';

const api: ElectronAPI = {
  lists: {
    getAll: () => ipcRenderer.invoke('lists:getAll'),
    create: (payload) => ipcRenderer.invoke('lists:create', payload),
    update: (id, patch) => ipcRenderer.invoke('lists:update', { id, patch }),
    delete: (id) => ipcRenderer.invoke('lists:delete', id),
  },
  tasks: {
    query: (q) => ipcRenderer.invoke('tasks:query', q),
    getById: (id) => ipcRenderer.invoke('tasks:getById', id),
    create: (payload) => ipcRenderer.invoke('tasks:create', payload),
    update: (id, patch) => ipcRenderer.invoke('tasks:update', { id, patch }),
    toggleComplete: (id, completed) => ipcRenderer.invoke('tasks:toggleComplete', { id, completed }),
    bulkMove: (payload) => ipcRenderer.invoke('tasks:bulkMove', payload),
    delete: (id) => ipcRenderer.invoke('tasks:delete', id),
  },
  stats: {
    range: (payload) => ipcRenderer.invoke('stats:range', payload),
  },
  backup: {
    export: () => ipcRenderer.invoke('backup:export'),
    import: (filePath) => ipcRenderer.invoke('backup:import', filePath),
  },
  reminder: {
    schedule: (payload) => ipcRenderer.invoke('reminder:schedule', payload),
    cancel: (payload) => ipcRenderer.invoke('reminder:cancel', payload),
    showNotification: (payload) => ipcRenderer.invoke('reminder:showNotification', payload),
  },
};

contextBridge.exposeInMainWorld('electronAPI', api);