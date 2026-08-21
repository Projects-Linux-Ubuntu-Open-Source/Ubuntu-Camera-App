import { ipcMain } from 'electron';
import { systemService } from '../services/systemService';
import { logger } from '../utils/logger';

export function registerSystemIpc(): void {
  ipcMain.handle('system:notification', async (_event, { title, body }) => {
    logger.debug('IPC', `Handling system:notification: "${title}"`);
    return systemService.showNotification(title, body);
  });

  ipcMain.handle('system:info', async () => {
    return systemService.getSystemInfo();
  });

  ipcMain.handle('system:open-external', async (_event, url: string) => {
    logger.debug('IPC', `Handling system:open-external: ${url}`);
    await systemService.openExternal(url);
    return { success: true };
  });

  logger.info('IPC', 'Registered system IPC handlers');
}
