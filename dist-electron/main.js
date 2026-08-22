var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// electron/main.ts
var import_electron8 = require("electron");
var import_path3 = __toESM(require("path"), 1);
var import_fs3 = __toESM(require("fs"), 1);
var import_url = require("url");

// electron/utils/logger.ts
var Logger = class {
  constructor() {
    this.isDev = process.env.NODE_ENV !== "production";
  }
  format(tag, message) {
    const timestamp = (/* @__PURE__ */ new Date()).toISOString().substring(11, 19);
    return `[${timestamp}] [${tag}] ${message}`;
  }
  info(tag, message, ...args) {
    console.log(this.format(tag, message), ...args);
  }
  warn(tag, message, ...args) {
    console.warn(this.format(tag, message), ...args);
  }
  error(tag, message, ...args) {
    console.error(this.format(tag, message), ...args);
  }
  debug(tag, message, ...args) {
    if (this.isDev) {
      console.debug(this.format(tag, message), ...args);
    }
  }
};
var logger = new Logger();

// electron/utils/paths.ts
var import_path = __toESM(require("path"), 1);
var import_os = __toESM(require("os"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_electron = require("electron");
var PathManager = class {
  static {
    this.userConfigPath = null;
  }
  static {
    this.customStoragePath = null;
  }
  static getDefaultStoragePath() {
    const home = import_os.default.homedir();
    const videosPath = import_path.default.join(home, "Videos", "CameraRecorder");
    return videosPath;
  }
  static getStoragePath() {
    if (this.customStoragePath && import_fs.default.existsSync(this.customStoragePath)) {
      return this.customStoragePath;
    }
    const saved = this.loadSavedStoragePath();
    if (saved && import_fs.default.existsSync(saved)) {
      this.customStoragePath = saved;
      return saved;
    }
    const defaultPath = this.getDefaultStoragePath();
    this.ensureDirectory(defaultPath);
    return defaultPath;
  }
  static setStoragePath(newPath) {
    try {
      if (!import_fs.default.existsSync(newPath)) {
        import_fs.default.mkdirSync(newPath, { recursive: true });
      }
      this.customStoragePath = newPath;
      this.saveStoragePath(newPath);
      logger.info("Filesystem", `Storage directory updated to: ${newPath}`);
      return true;
    } catch (err) {
      logger.error("Filesystem", `Failed to set storage path: ${err}`);
      return false;
    }
  }
  static ensureDirectory(dirPath) {
    try {
      if (!import_fs.default.existsSync(dirPath)) {
        import_fs.default.mkdirSync(dirPath, { recursive: true });
        logger.info("Filesystem", `Created directory: ${dirPath}`);
      }
      return true;
    } catch (err) {
      logger.error("Filesystem", `Failed to create directory ${dirPath}: ${err}`);
      return false;
    }
  }
  static getConfigFilePath() {
    if (!this.userConfigPath) {
      try {
        const userData = import_electron.app?.getPath ? import_electron.app.getPath("userData") : import_path.default.join(import_os.default.homedir(), ".config", "camera-recorder");
        this.ensureDirectory(userData);
        this.userConfigPath = import_path.default.join(userData, "preferences.json");
      } catch {
        this.userConfigPath = import_path.default.join(import_os.default.homedir(), ".config", "camera-recorder", "preferences.json");
      }
    }
    return this.userConfigPath;
  }
  static loadSavedStoragePath() {
    try {
      const configPath = this.getConfigFilePath();
      if (import_fs.default.existsSync(configPath)) {
        const data = JSON.parse(import_fs.default.readFileSync(configPath, "utf-8"));
        return data.storagePath || null;
      }
    } catch (err) {
      logger.warn("Filesystem", `Could not read preferences: ${err}`);
    }
    return null;
  }
  static saveStoragePath(newPath) {
    try {
      const configPath = this.getConfigFilePath();
      const parent = import_path.default.dirname(configPath);
      this.ensureDirectory(parent);
      const existing = import_fs.default.existsSync(configPath) ? JSON.parse(import_fs.default.readFileSync(configPath, "utf-8")) : {};
      existing.storagePath = newPath;
      import_fs.default.writeFileSync(configPath, JSON.stringify(existing, null, 2), "utf-8");
    } catch (err) {
      logger.warn("Filesystem", `Could not write preferences: ${err}`);
    }
  }
};

// electron/ipc/filesystem.ts
var import_electron3 = require("electron");

// electron/services/filesystemService.ts
var import_fs2 = __toESM(require("fs"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_electron2 = require("electron");
var FilesystemService = class {
  async chooseDirectory(parentWindow) {
    try {
      const currentPath = PathManager.getStoragePath();
      const result = await import_electron2.dialog.showOpenDialog(parentWindow || import_electron2.BrowserWindow.getFocusedWindow(), {
        title: "Select Recording Storage Folder",
        defaultPath: currentPath,
        properties: ["openDirectory", "createDirectory"]
      });
      if (!result.canceled && result.filePaths.length > 0) {
        const chosen = result.filePaths[0];
        PathManager.setStoragePath(chosen);
        return chosen;
      }
      return null;
    } catch (err) {
      logger.error("Filesystem", `Error choosing directory: ${err}`);
      return null;
    }
  }
  async saveFile(data, filename, mimeType) {
    try {
      const storageDir = PathManager.getStoragePath();
      PathManager.ensureDirectory(storageDir);
      const sanitized = filename.replace(/[/\\?%*:|"<>]/g, "-");
      const targetPath = import_path2.default.join(storageDir, sanitized);
      const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
      await import_fs2.default.promises.writeFile(targetPath, buffer);
      logger.info("Filesystem", `Saved recording to: ${targetPath} (${buffer.length} bytes)`);
      return {
        success: true,
        filePath: targetPath,
        size: buffer.length
      };
    } catch (err) {
      logger.error("Filesystem", `Failed to save file "${filename}": ${err}`);
      throw new Error(`Failed to save file: ${err}`);
    }
  }
  async getRecordings() {
    try {
      const storageDir = PathManager.getStoragePath();
      PathManager.ensureDirectory(storageDir);
      const files = await import_fs2.default.promises.readdir(storageDir, { withFileTypes: true });
      const items = [];
      for (const entry of files) {
        if (!entry.isFile()) continue;
        const fullPath = import_path2.default.join(storageDir, entry.name);
        try {
          const stats = await import_fs2.default.promises.stat(fullPath);
          const ext = import_path2.default.extname(entry.name).toLowerCase();
          let type = "video";
          let mimeType = "video/webm";
          if ([".png", ".jpg", ".jpeg", ".webp"].includes(ext)) {
            type = "photo";
            mimeType = ext === ".png" ? "image/png" : "image/jpeg";
          } else if ([".weba", ".webm", ".ogg", ".wav", ".mp3", ".m4a", ".flac"].includes(ext) && (entry.name.startsWith("audio_") || ext === ".wav" || ext === ".mp3" || ext === ".weba")) {
            type = "audio";
            mimeType = "audio/webm";
          } else if ([".webm", ".mp4", ".mkv", ".mov", ".avi"].includes(ext)) {
            type = "video";
            mimeType = "video/webm";
          }
          items.push({
            id: `electron_${Buffer.from(fullPath).toString("base64").substring(0, 16)}`,
            name: entry.name,
            type,
            filePath: fullPath,
            size: stats.size,
            timestamp: stats.mtimeMs,
            duration: 0,
            mimeType
          });
        } catch (err) {
          logger.warn("Filesystem", `Could not stat file ${fullPath}: ${err}`);
        }
      }
      items.sort((a, b) => b.timestamp - a.timestamp);
      return items;
    } catch (err) {
      logger.error("Filesystem", `Error reading recordings directory: ${err}`);
      return [];
    }
  }
  async openFile(filePath) {
    try {
      if (!import_fs2.default.existsSync(filePath)) {
        logger.warn("Filesystem", `File does not exist: ${filePath}`);
        return false;
      }
      const err = await import_electron2.shell.openPath(filePath);
      if (err) {
        logger.error("Filesystem", `Error opening file: ${err}`);
        return false;
      }
      return true;
    } catch (err) {
      logger.error("Filesystem", `Exception opening file ${filePath}: ${err}`);
      return false;
    }
  }
  async showInFolder(filePath) {
    try {
      if (import_fs2.default.existsSync(filePath)) {
        import_electron2.shell.showItemInFolder(filePath);
        return true;
      } else {
        const parent = import_path2.default.dirname(filePath);
        if (import_fs2.default.existsSync(parent)) {
          import_electron2.shell.openPath(parent);
          return true;
        }
      }
      return false;
    } catch (err) {
      logger.error("Filesystem", `Error showing item in folder: ${err}`);
      return false;
    }
  }
  async deleteFile(filePath) {
    try {
      if (import_fs2.default.existsSync(filePath)) {
        await import_fs2.default.promises.unlink(filePath);
        logger.info("Filesystem", `Deleted file: ${filePath}`);
        return true;
      }
      return false;
    } catch (err) {
      logger.error("Filesystem", `Error deleting file ${filePath}: ${err}`);
      return false;
    }
  }
  async deleteMultiple(filePaths) {
    let allSuccessful = true;
    for (const p of filePaths) {
      const ok = await this.deleteFile(p);
      if (!ok) allSuccessful = false;
    }
    return allSuccessful;
  }
  getStoragePath() {
    return PathManager.getStoragePath();
  }
  setStoragePath(newPath) {
    return PathManager.setStoragePath(newPath);
  }
};
var filesystemService = new FilesystemService();

// electron/ipc/filesystem.ts
function registerFilesystemIpc() {
  import_electron3.ipcMain.handle("filesystem:choose-directory", async () => {
    logger.debug("IPC", "Handling filesystem:choose-directory");
    return await filesystemService.chooseDirectory();
  });
  import_electron3.ipcMain.handle("filesystem:save", async (_event, { data, filename, mimeType }) => {
    logger.debug("IPC", `Handling filesystem:save for ${filename}`);
    if (!data || !filename) {
      throw new Error("Invalid arguments: data and filename are required");
    }
    return await filesystemService.saveFile(data, filename, mimeType);
  });
  import_electron3.ipcMain.handle("filesystem:get-recordings", async () => {
    logger.debug("IPC", "Handling filesystem:get-recordings");
    return await filesystemService.getRecordings();
  });
  import_electron3.ipcMain.handle("filesystem:open", async (_event, filePath) => {
    logger.debug("IPC", `Handling filesystem:open for ${filePath}`);
    if (!filePath || typeof filePath !== "string") {
      throw new Error("Invalid filePath parameter");
    }
    return await filesystemService.openFile(filePath);
  });
  import_electron3.ipcMain.handle("filesystem:show-in-folder", async (_event, filePath) => {
    logger.debug("IPC", `Handling filesystem:show-in-folder for ${filePath}`);
    if (!filePath || typeof filePath !== "string") {
      throw new Error("Invalid filePath parameter");
    }
    return await filesystemService.showInFolder(filePath);
  });
  import_electron3.ipcMain.handle("filesystem:delete", async (_event, filePath) => {
    logger.debug("IPC", `Handling filesystem:delete for ${filePath}`);
    if (!filePath || typeof filePath !== "string") {
      throw new Error("Invalid filePath parameter");
    }
    return await filesystemService.deleteFile(filePath);
  });
  import_electron3.ipcMain.handle("filesystem:delete-multiple", async (_event, filePaths) => {
    logger.debug("IPC", `Handling filesystem:delete-multiple for ${filePaths?.length} files`);
    if (!Array.isArray(filePaths)) {
      throw new Error("Invalid filePaths parameter: array expected");
    }
    return await filesystemService.deleteMultiple(filePaths);
  });
  import_electron3.ipcMain.handle("filesystem:get-storage-path", async () => {
    return filesystemService.getStoragePath();
  });
  import_electron3.ipcMain.handle("filesystem:set-storage-path", async (_event, newPath) => {
    if (!newPath || typeof newPath !== "string") {
      throw new Error("Invalid newPath parameter");
    }
    return filesystemService.setStoragePath(newPath);
  });
  logger.info("IPC", "Registered filesystem IPC handlers");
}

// electron/ipc/recording.ts
var import_electron5 = require("electron");

// electron/services/systemService.ts
var import_electron4 = require("electron");
var import_os2 = __toESM(require("os"), 1);
var SystemService = class {
  showNotification(title, body) {
    try {
      if (import_electron4.Notification.isSupported()) {
        const notification = new import_electron4.Notification({
          title,
          body: body || "",
          urgency: "normal"
        });
        notification.show();
        logger.info("System", `Triggered notification: "${title}"`);
        return true;
      } else {
        logger.warn("System", "Notifications are not supported on this platform");
        return false;
      }
    } catch (err) {
      logger.error("System", `Failed to show notification: ${err}`);
      return false;
    }
  }
  getSystemInfo() {
    const platform = import_os2.default.platform();
    const isLinux = platform === "linux";
    let isUbuntu = false;
    if (isLinux) {
      try {
        const release = import_os2.default.release().toLowerCase();
        isUbuntu = release.includes("ubuntu") || true;
      } catch {
        isUbuntu = true;
      }
    }
    return {
      platform,
      arch: import_os2.default.arch(),
      osRelease: import_os2.default.release(),
      appName: import_electron4.app?.getName ? import_electron4.app.getName() : "Camera Recorder",
      appVersion: import_electron4.app?.getVersion ? import_electron4.app.getVersion() : "1.0.0",
      isLinux,
      isUbuntu,
      storagePath: PathManager.getStoragePath()
    };
  }
  async openExternal(url) {
    try {
      if (url.startsWith("http://") || url.startsWith("https://")) {
        await import_electron4.shell.openExternal(url);
      }
    } catch (err) {
      logger.error("System", `Error opening external URL ${url}: ${err}`);
    }
  }
};
var systemService = new SystemService();

// electron/services/recordingService.ts
var RecordingService = class {
  constructor() {
    this.currentSession = null;
  }
  startRecording(type = "video", name) {
    const id = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.currentSession = {
      id,
      type,
      name: name || `${type === "video" ? "video" : "audio"}_recording_${Date.now()}`,
      startTime: Date.now(),
      isPaused: false,
      pausedDuration: 0,
      pauseTimestamp: null
    };
    logger.info("Recording", `Started recording session: ${id} (${type})`);
    systemService.showNotification("Recording Started", `Live ${type} recording is now active.`);
    return { success: true, id };
  }
  pauseRecording() {
    if (this.currentSession && !this.currentSession.isPaused) {
      this.currentSession.isPaused = true;
      this.currentSession.pauseTimestamp = Date.now();
      logger.info("Recording", `Paused session: ${this.currentSession.id}`);
    }
  }
  resumeRecording() {
    if (this.currentSession && this.currentSession.isPaused && this.currentSession.pauseTimestamp) {
      this.currentSession.pausedDuration += Date.now() - this.currentSession.pauseTimestamp;
      this.currentSession.isPaused = false;
      this.currentSession.pauseTimestamp = null;
      logger.info("Recording", `Resumed session: ${this.currentSession.id}`);
    }
  }
  stopRecording() {
    if (!this.currentSession) return null;
    let duration = Date.now() - this.currentSession.startTime - this.currentSession.pausedDuration;
    if (this.currentSession.isPaused && this.currentSession.pauseTimestamp) {
      duration -= Date.now() - this.currentSession.pauseTimestamp;
    }
    const completed = {
      id: this.currentSession.id,
      duration: Math.max(0, Math.floor(duration / 1e3))
    };
    logger.info("Recording", `Stopped recording session: ${completed.id} (duration: ${completed.duration}s)`);
    systemService.showNotification("Recording Stopped", `Recording completed (${completed.duration}s).`);
    this.currentSession = null;
    return completed;
  }
  getStatus() {
    if (!this.currentSession) {
      return { isRecording: false, isPaused: false, duration: 0 };
    }
    let elapsed = Date.now() - this.currentSession.startTime - this.currentSession.pausedDuration;
    if (this.currentSession.isPaused && this.currentSession.pauseTimestamp) {
      elapsed -= Date.now() - this.currentSession.pauseTimestamp;
    }
    return {
      isRecording: true,
      isPaused: this.currentSession.isPaused,
      duration: Math.max(0, Math.floor(elapsed / 1e3))
    };
  }
};
var recordingService = new RecordingService();

// electron/ipc/recording.ts
function registerRecordingIpc() {
  import_electron5.ipcMain.handle("recording:start", async (_event, options) => {
    logger.debug("IPC", `Handling recording:start (${options?.type || "video"})`);
    return recordingService.startRecording(options?.type, options?.name);
  });
  import_electron5.ipcMain.handle("recording:pause", async () => {
    logger.debug("IPC", "Handling recording:pause");
    recordingService.pauseRecording();
    return { success: true };
  });
  import_electron5.ipcMain.handle("recording:resume", async () => {
    logger.debug("IPC", "Handling recording:resume");
    recordingService.resumeRecording();
    return { success: true };
  });
  import_electron5.ipcMain.handle("recording:stop", async () => {
    logger.debug("IPC", "Handling recording:stop");
    return recordingService.stopRecording();
  });
  import_electron5.ipcMain.handle("recording:get-status", async () => {
    return recordingService.getStatus();
  });
  logger.info("IPC", "Registered recording IPC handlers");
}

// electron/ipc/system.ts
var import_electron6 = require("electron");
function registerSystemIpc() {
  import_electron6.ipcMain.handle("system:notification", async (_event, { title, body }) => {
    logger.debug("IPC", `Handling system:notification: "${title}"`);
    return systemService.showNotification(title, body);
  });
  import_electron6.ipcMain.handle("system:info", async () => {
    return systemService.getSystemInfo();
  });
  import_electron6.ipcMain.handle("system:open-external", async (_event, url) => {
    logger.debug("IPC", `Handling system:open-external: ${url}`);
    await systemService.openExternal(url);
    return { success: true };
  });
  logger.info("IPC", "Registered system IPC handlers");
}

// electron/ipc/devices.ts
var import_electron7 = require("electron");
function registerDevicesIpc() {
  import_electron7.ipcMain.handle("devices:get", async () => {
    logger.debug("IPC", "Handling devices:get");
    return {
      cameras: [],
      microphones: [],
      audioOutputs: []
    };
  });
  logger.info("IPC", "Registered devices IPC handlers");
}

// electron/main.ts
var import_meta = {};
var isDev = process.env.NODE_ENV !== "production" || !import_electron8.app.isPackaged;
var mainWindow = null;
var getDirname = () => {
  try {
    return import_path3.default.dirname((0, import_url.fileURLToPath)(import_meta.url));
  } catch {
    return __dirname;
  }
};
var currentDir = getDirname();
function createApplicationMenu() {
  const isMac = process.platform === "darwin";
  const template = [
    {
      label: "File",
      submenu: [
        {
          label: "New Recording",
          accelerator: "CmdOrCtrl+N",
          click: () => {
            mainWindow?.webContents.send("menu:action", "navigate:recorder");
          }
        },
        {
          label: "Open Recordings Folder",
          accelerator: "CmdOrCtrl+O",
          click: async () => {
            const storagePath = PathManager.getStoragePath();
            await import_electron8.shell.openPath(storagePath);
          }
        },
        {
          label: "Change Storage Directory...",
          click: async () => {
            await filesystemService.chooseDirectory(mainWindow);
            mainWindow?.webContents.send("menu:action", "refresh:storage");
          }
        },
        { type: "separator" },
        {
          label: "Settings",
          accelerator: "CmdOrCtrl+,",
          click: () => {
            mainWindow?.webContents.send("menu:action", "navigate:settings");
          }
        },
        { type: "separator" },
        isMac ? { role: "close" } : { role: "quit" }
      ]
    },
    {
      label: "View",
      submenu: [
        {
          label: "Dashboard",
          click: () => mainWindow?.webContents.send("menu:action", "navigate:dashboard")
        },
        {
          label: "Camera Studio",
          click: () => mainWindow?.webContents.send("menu:action", "navigate:camera")
        },
        {
          label: "Audio Studio",
          click: () => mainWindow?.webContents.send("menu:action", "navigate:audio")
        },
        {
          label: "Recorder Studio",
          click: () => mainWindow?.webContents.send("menu:action", "navigate:recorder")
        },
        {
          label: "Recordings Library",
          click: () => mainWindow?.webContents.send("menu:action", "navigate:recordings")
        },
        { type: "separator" },
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" }
      ]
    },
    {
      label: "Help",
      submenu: [
        {
          label: "About Camera Recorder",
          click: () => {
            import_electron8.dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "About Camera Recorder",
              message: "Ubuntu Camera & Audio Recorder",
              detail: `Version: ${import_electron8.app.getVersion() || "1.0.0"}
Target: Ubuntu Linux / Desktop
Architecture: ${process.arch}
Electron & React Desktop Application`,
              buttons: ["OK"]
            });
          }
        },
        {
          label: "Ubuntu Documentation & Help",
          click: async () => {
            await import_electron8.shell.openExternal("https://ubuntu.com");
          }
        }
      ]
    }
  ];
  const menu = import_electron8.Menu.buildFromTemplate(template);
  import_electron8.Menu.setApplicationMenu(menu);
}
async function createWindow() {
  logger.info("Electron", "Creating BrowserWindow");
  const preloadPath = isDev ? import_path3.default.join(currentDir, "preload.js") : import_path3.default.join(currentDir, "preload.js");
  const appRoot = isDev ? process.cwd() : import_path3.default.join(currentDir, "..");
  const iconCandidates = [
    import_path3.default.join(appRoot, "assets", "Icon.png"),
    import_path3.default.join(appRoot, "assets", "icon.png"),
    import_path3.default.join(process.cwd(), "assets", "Icon.png"),
    import_path3.default.join(process.cwd(), "public", "icon.png")
  ];
  const resolvedIconPath = iconCandidates.find((p) => import_fs3.default.existsSync(p));
  const appIcon = resolvedIconPath ? import_electron8.nativeImage.createFromPath(resolvedIconPath) : void 0;
  const win = new import_electron8.BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1100,
    minHeight: 700,
    backgroundColor: "#0c0f14",
    title: "Ubuntu Camera & Audio Recorder",
    icon: appIcon,
    show: false,
    // Show once ready-to-show to prevent white flash
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true
    }
  });
  win.once("ready-to-show", () => {
    win.show();
    logger.info("Electron", "Main window created and displayed");
  });
  win.webContents.on("render-process-gone", (_event, details) => {
    logger.error("Electron", `Renderer process crashed: ${details.reason} (exitCode: ${details.exitCode})`);
  });
  if (isDev) {
    const devUrl = process.env.VITE_DEV_SERVER_URL || "http://localhost:5173";
    logger.info("Electron", `Loading Vite development server: ${devUrl}`);
    const loadDevServer = async (retries = 15) => {
      try {
        await win.loadURL(devUrl);
        logger.info("Electron", "Vite dev server loaded successfully");
      } catch (err) {
        if (retries > 0) {
          logger.info("Electron", `Vite server not ready, retrying in 1s... (${retries} attempts left)`);
          setTimeout(() => loadDevServer(retries - 1), 1e3);
        } else {
          logger.error("Electron", `Failed to load Vite dev server at ${devUrl}: ${err}`);
        }
      }
    };
    loadDevServer();
  } else {
    const indexPath = import_path3.default.join(currentDir, "../dist/index.html");
    logger.info("Electron", `Loading production build: ${indexPath}`);
    win.loadFile(indexPath).catch((err) => {
      logger.error("Electron", `Failed to load production index.html: ${err}`);
    });
  }
  return win;
}
var gotTheLock = import_electron8.app.requestSingleInstanceLock();
if (!gotTheLock) {
  logger.warn("Electron", "Another instance is already running. Quitting.");
  import_electron8.app.quit();
} else {
  import_electron8.app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
  import_electron8.app.whenReady().then(async () => {
    logger.info("Electron", `Application starting on ${process.platform} (${process.arch})`);
    registerFilesystemIpc();
    registerRecordingIpc();
    registerSystemIpc();
    registerDevicesIpc();
    createApplicationMenu();
    mainWindow = await createWindow();
    import_electron8.app.on("activate", async () => {
      if (import_electron8.BrowserWindow.getAllWindows().length === 0) {
        mainWindow = await createWindow();
      }
    });
  });
  import_electron8.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      logger.info("Electron", "All windows closed. Exiting application.");
      import_electron8.app.quit();
    }
  });
}
process.on("uncaughtException", (error) => {
  logger.error("Electron", `Uncaught Exception in Main: ${error.stack || error}`);
});
process.on("unhandledRejection", (reason) => {
  logger.error("Electron", `Unhandled Rejection in Main: ${reason}`);
});
