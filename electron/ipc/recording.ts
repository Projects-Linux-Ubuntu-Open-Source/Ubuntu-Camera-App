import { ipcMain } from 'electron';
import { recordingService } from '../services/recordingService';
import { logger } from '../utils/logger';

export function registerRecordingIpc(): void {
  ipcMain.handle('recording:start', async (_event, options?: { type?: 'video' | 'audio'; name?: string }) => {
    logger.debug('IPC', `Handling recording:start (${options?.type || 'video'})`);
    return recordingService.startRecording(options?.type, options?.name);
  });

  ipcMain.handle('recording:pause', async () => {
    logger.debug('IPC', 'Handling recording:pause');
    recordingService.pauseRecording();
    return { success: true };
  });

  ipcMain.handle('recording:resume', async () => {
    logger.debug('IPC', 'Handling recording:resume');
    recordingService.resumeRecording();
    return { success: true };
  });

  ipcMain.handle('recording:stop', async () => {
    logger.debug('IPC', 'Handling recording:stop');
    return recordingService.stopRecording();
  });

  ipcMain.handle('recording:get-status', async () => {
    return recordingService.getStatus();
  });

  logger.info('IPC', 'Registered recording IPC handlers');
}
