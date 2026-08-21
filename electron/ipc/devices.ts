import { ipcMain } from 'electron';
import { logger } from '../utils/logger';

export function registerDevicesIpc(): void {
  ipcMain.handle('devices:get', async () => {
    logger.debug('IPC', 'Handling devices:get');
    // Device enumeration is supported inside Chromium renderer via navigator.mediaDevices.enumerateDevices().
    // This handler provides a bridge for native discovery expansion.
    return {
      cameras: [],
      microphones: [],
      audioOutputs: [],
    };
  });

  logger.info('IPC', 'Registered devices IPC handlers');
}
