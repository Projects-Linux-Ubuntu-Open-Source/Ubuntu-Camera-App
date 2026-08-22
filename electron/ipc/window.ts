import { ipcMain, BrowserWindow, app } from 'electron';
import { logger } from '../utils/logger';

export function registerWindowIpc(): void {
  ipcMain.handle('window:minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      win.minimize();
      logger.debug('Window', 'Window minimized');
    }
  });

  ipcMain.handle('window:maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize();
        logger.debug('Window', 'Window restored from maximized');
      } else {
        win.maximize();
        logger.debug('Window', 'Window maximized');
      }
    }
  });

  ipcMain.handle('window:close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      logger.info('Window', 'Window close requested via UI. Closing window and quitting.');
      win.close();
    } else {
      app.quit();
    }
  });

  ipcMain.handle('window:quit', () => {
    logger.info('Window', 'Application quit requested via IPC. Exiting process.');
    app.quit();
    process.exit(0);
  });

  logger.info('IPC', 'Registered window control IPC handlers');
}
