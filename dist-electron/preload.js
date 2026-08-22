// electron/preload.ts
var import_electron = require("electron");
var electronAPI = {
  platform: process.platform,
  isElectron: true,
  recording: {
    start: (options) => import_electron.ipcRenderer.invoke("recording:start", options),
    stop: () => import_electron.ipcRenderer.invoke("recording:stop"),
    pause: () => import_electron.ipcRenderer.invoke("recording:pause"),
    resume: () => import_electron.ipcRenderer.invoke("recording:resume"),
    getStatus: () => import_electron.ipcRenderer.invoke("recording:get-status")
  },
  filesystem: {
    saveFile: (data, filename, mimeType) => import_electron.ipcRenderer.invoke("filesystem:save", { data, filename, mimeType }),
    chooseDirectory: () => import_electron.ipcRenderer.invoke("filesystem:choose-directory"),
    getRecordings: () => import_electron.ipcRenderer.invoke("filesystem:get-recordings"),
    openFile: (filePath) => import_electron.ipcRenderer.invoke("filesystem:open", filePath),
    showInFolder: (filePath) => import_electron.ipcRenderer.invoke("filesystem:show-in-folder", filePath),
    deleteFile: (filePath) => import_electron.ipcRenderer.invoke("filesystem:delete", filePath),
    deleteMultiple: (filePaths) => import_electron.ipcRenderer.invoke("filesystem:delete-multiple", filePaths),
    getStoragePath: () => import_electron.ipcRenderer.invoke("filesystem:get-storage-path"),
    setStoragePath: (newPath) => import_electron.ipcRenderer.invoke("filesystem:set-storage-path", newPath)
  },
  system: {
    showNotification: (title, body) => import_electron.ipcRenderer.invoke("system:notification", { title, body }),
    getSystemInfo: () => import_electron.ipcRenderer.invoke("system:info"),
    openExternal: (url) => import_electron.ipcRenderer.invoke("system:open-external", url)
  },
  devices: {
    getDevices: () => import_electron.ipcRenderer.invoke("devices:get")
  },
  window: {
    minimize: () => import_electron.ipcRenderer.invoke("window:minimize"),
    maximize: () => import_electron.ipcRenderer.invoke("window:maximize"),
    close: () => import_electron.ipcRenderer.invoke("window:close"),
    quit: () => import_electron.ipcRenderer.invoke("window:quit")
  },
  onMenuAction: (callback) => {
    const subscription = (_event, action) => callback(action);
    import_electron.ipcRenderer.on("menu:action", subscription);
    return () => {
      import_electron.ipcRenderer.removeListener("menu:action", subscription);
    };
  }
};
import_electron.contextBridge.exposeInMainWorld("electronAPI", electronAPI);
