import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

// Secure Preload API
const electronAPI = {
  platform: process.platform,
  isElectron: true,

  recording: {
    start: (options?: { type?: 'video' | 'audio'; name?: string }) =>
      ipcRenderer.invoke('recording:start', options),
    stop: () => ipcRenderer.invoke('recording:stop'),
    pause: () => ipcRenderer.invoke('recording:pause'),
    resume: () => ipcRenderer.invoke('recording:resume'),
    getStatus: () => ipcRenderer.invoke('recording:get-status'),
  },

  filesystem: {
    saveFile: (data: ArrayBuffer, filename: string, mimeType?: string) =>
      ipcRenderer.invoke('filesystem:save', { data, filename, mimeType }),
    chooseDirectory: () => ipcRenderer.invoke('filesystem:choose-directory'),
    getRecordings: () => ipcRenderer.invoke('filesystem:get-recordings'),
    openFile: (filePath: string) => ipcRenderer.invoke('filesystem:open', filePath),
    showInFolder: (filePath: string) => ipcRenderer.invoke('filesystem:show-in-folder', filePath),
    deleteFile: (filePath: string) => ipcRenderer.invoke('filesystem:delete', filePath),
    deleteMultiple: (filePaths: string[]) => ipcRenderer.invoke('filesystem:delete-multiple', filePaths),
    getStoragePath: () => ipcRenderer.invoke('filesystem:get-storage-path'),
    setStoragePath: (newPath: string) => ipcRenderer.invoke('filesystem:set-storage-path', newPath),
  },

  system: {
    showNotification: (title: string, body?: string) =>
      ipcRenderer.invoke('system:notification', { title, body }),
    getSystemInfo: () => ipcRenderer.invoke('system:info'),
    openExternal: (url: string) => ipcRenderer.invoke('system:open-external', url),
  },

  devices: {
    getDevices: () => ipcRenderer.invoke('devices:get'),
  },

  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    quit: () => ipcRenderer.invoke('window:quit'),
  },

  onMenuAction: (callback: (action: string) => void) => {
    const subscription = (_event: IpcRendererEvent, action: string) => callback(action);
    ipcRenderer.on('menu:action', subscription);
    return () => {
      ipcRenderer.removeListener('menu:action', subscription);
    };
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
