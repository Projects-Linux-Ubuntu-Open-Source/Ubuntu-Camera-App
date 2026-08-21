import { ipcMain } from 'electron';
import { filesystemService } from '../services/filesystemService';
import { logger } from '../utils/logger';

export function registerFilesystemIpc(): void {
  ipcMain.handle('filesystem:choose-directory', async () => {
    logger.debug('IPC', 'Handling filesystem:choose-directory');
    return await filesystemService.chooseDirectory();
  });

  ipcMain.handle('filesystem:save', async (_event, { data, filename, mimeType }) => {
    logger.debug('IPC', `Handling filesystem:save for ${filename}`);
    if (!data || !filename) {
      throw new Error('Invalid arguments: data and filename are required');
    }
    return await filesystemService.saveFile(data, filename, mimeType);
  });

  ipcMain.handle('filesystem:get-recordings', async () => {
    logger.debug('IPC', 'Handling filesystem:get-recordings');
    return await filesystemService.getRecordings();
  });

  ipcMain.handle('filesystem:open', async (_event, filePath: string) => {
    logger.debug('IPC', `Handling filesystem:open for ${filePath}`);
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('Invalid filePath parameter');
    }
    return await filesystemService.openFile(filePath);
  });

  ipcMain.handle('filesystem:show-in-folder', async (_event, filePath: string) => {
    logger.debug('IPC', `Handling filesystem:show-in-folder for ${filePath}`);
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('Invalid filePath parameter');
    }
    return await filesystemService.showInFolder(filePath);
  });

  ipcMain.handle('filesystem:delete', async (_event, filePath: string) => {
    logger.debug('IPC', `Handling filesystem:delete for ${filePath}`);
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('Invalid filePath parameter');
    }
    return await filesystemService.deleteFile(filePath);
  });

  ipcMain.handle('filesystem:delete-multiple', async (_event, filePaths: string[]) => {
    logger.debug('IPC', `Handling filesystem:delete-multiple for ${filePaths?.length} files`);
    if (!Array.isArray(filePaths)) {
      throw new Error('Invalid filePaths parameter: array expected');
    }
    return await filesystemService.deleteMultiple(filePaths);
  });

  ipcMain.handle('filesystem:get-storage-path', async () => {
    return filesystemService.getStoragePath();
  });

  ipcMain.handle('filesystem:set-storage-path', async (_event, newPath: string) => {
    if (!newPath || typeof newPath !== 'string') {
      throw new Error('Invalid newPath parameter');
    }
    return filesystemService.setStoragePath(newPath);
  });

  logger.info('IPC', 'Registered filesystem IPC handlers');
}
