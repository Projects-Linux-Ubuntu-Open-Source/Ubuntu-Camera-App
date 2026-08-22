import { app, BrowserWindow, Menu, MenuItemConstructorOptions, shell, dialog, nativeImage } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { logger } from './utils/logger';
import { PathManager } from './utils/paths';
import { registerFilesystemIpc } from './ipc/filesystem';
import { registerRecordingIpc } from './ipc/recording';
import { registerSystemIpc } from './ipc/system';
import { registerDevicesIpc } from './ipc/devices';
import { filesystemService } from './services/filesystemService';

const isDev = process.env.NODE_ENV !== 'production' || !app.isPackaged;
let mainWindow: BrowserWindow | null = null;

// Determine directory paths safely for both ESM and CJS
const getDirname = () => {
  try {
    return path.dirname(fileURLToPath(import.meta.url));
  } catch {
    return __dirname;
  }
};

const currentDir = getDirname();

function createApplicationMenu(): void {
  const isMac = process.platform === 'darwin';

  const template: MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Recording',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow?.webContents.send('menu:action', 'navigate:recorder');
          },
        },
        {
          label: 'Open Recordings Folder',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const storagePath = PathManager.getStoragePath();
            await shell.openPath(storagePath);
          },
        },
        {
          label: 'Change Storage Directory...',
          click: async () => {
            await filesystemService.chooseDirectory(mainWindow);
            mainWindow?.webContents.send('menu:action', 'refresh:storage');
          },
        },
        { type: 'separator' },
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow?.webContents.send('menu:action', 'navigate:settings');
          },
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Dashboard',
          click: () => mainWindow?.webContents.send('menu:action', 'navigate:dashboard'),
        },
        {
          label: 'Camera Studio',
          click: () => mainWindow?.webContents.send('menu:action', 'navigate:camera'),
        },
        {
          label: 'Audio Studio',
          click: () => mainWindow?.webContents.send('menu:action', 'navigate:audio'),
        },
        {
          label: 'Recorder Studio',
          click: () => mainWindow?.webContents.send('menu:action', 'navigate:recorder'),
        },
        {
          label: 'Recordings Library',
          click: () => mainWindow?.webContents.send('menu:action', 'navigate:recordings'),
        },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Camera Recorder',
          click: () => {
            dialog.showMessageBox(mainWindow!, {
              type: 'info',
              title: 'About Camera Recorder',
              message: 'Ubuntu Camera & Audio Recorder',
              detail: `Version: ${app.getVersion() || '1.0.0'}\nTarget: Ubuntu Linux / Desktop\nArchitecture: ${process.arch}\nElectron & React Desktop Application`,
              buttons: ['OK'],
            });
          },
        },
        {
          label: 'Ubuntu Documentation & Help',
          click: async () => {
            await shell.openExternal('https://ubuntu.com');
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

async function createWindow(): Promise<BrowserWindow> {
  logger.info('Electron', 'Creating BrowserWindow');

  // Preload path resolution
  const preloadPath = isDev
    ? path.join(currentDir, 'preload.js')
    : path.join(currentDir, 'preload.js');

  // Resolve application icon from assets
  const appRoot = isDev ? process.cwd() : path.join(currentDir, '..');
  const iconCandidates = [
    path.join(appRoot, 'assets', 'Icon.png'),
    path.join(appRoot, 'assets', 'icon.png'),
    path.join(process.cwd(), 'assets', 'Icon.png'),
    path.join(process.cwd(), 'public', 'icon.png'),
  ];
  const resolvedIconPath = iconCandidates.find((p) => fs.existsSync(p));
  const appIcon = resolvedIconPath ? nativeImage.createFromPath(resolvedIconPath) : undefined;

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1100,
    minHeight: 700,
    backgroundColor: '#0c0f14',
    title: 'Ubuntu Camera & Audio Recorder',
    icon: appIcon,
    show: false, // Show once ready-to-show to prevent white flash
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  win.once('ready-to-show', () => {
    win.show();
    logger.info('Electron', 'Main window created and displayed');
  });

  // Handle renderer crash
  win.webContents.on('render-process-gone', (_event, details) => {
    logger.error('Electron', `Renderer process crashed: ${details.reason} (exitCode: ${details.exitCode})`);
  });

  // Load URL or build output
  if (isDev) {
    const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
    logger.info('Electron', `Loading Vite development server: ${devUrl}`);

    const loadDevServer = async (retries = 15) => {
      try {
        await win.loadURL(devUrl);
        logger.info('Electron', 'Vite dev server loaded successfully');
      } catch (err) {
        if (retries > 0) {
          logger.info('Electron', `Vite server not ready, retrying in 1s... (${retries} attempts left)`);
          setTimeout(() => loadDevServer(retries - 1), 1000);
        } else {
          logger.error('Electron', `Failed to load Vite dev server at ${devUrl}: ${err}`);
        }
      }
    };

    loadDevServer();
  } else {
    const indexPath = path.join(currentDir, '../dist/index.html');
    logger.info('Electron', `Loading production build: ${indexPath}`);
    win.loadFile(indexPath).catch((err) => {
      logger.error('Electron', `Failed to load production index.html: ${err}`);
    });
  }

  return win;
}

// Ensure single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  logger.warn('Electron', 'Another instance is already running. Quitting.');
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    logger.info('Electron', `Application starting on ${process.platform} (${process.arch})`);

    // Register all IPC handlers
    registerFilesystemIpc();
    registerRecordingIpc();
    registerSystemIpc();
    registerDevicesIpc();

    // Create window & menu
    createApplicationMenu();
    mainWindow = await createWindow();

    app.on('activate', async () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        mainWindow = await createWindow();
      }
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      logger.info('Electron', 'All windows closed. Exiting application.');
      app.quit();
    }
  });
}

// Global process error safety
process.on('uncaughtException', (error) => {
  logger.error('Electron', `Uncaught Exception in Main: ${error.stack || error}`);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Electron', `Unhandled Rejection in Main: ${reason}`);
});
