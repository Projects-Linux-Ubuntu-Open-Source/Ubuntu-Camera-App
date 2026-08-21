import { Notification, shell, app } from 'electron';
import os from 'os';
import { logger } from '../utils/logger';
import { PathManager } from '../utils/paths';

export interface SystemInfo {
  platform: string;
  arch: string;
  osRelease: string;
  appName: string;
  appVersion: string;
  isLinux: boolean;
  isUbuntu: boolean;
  storagePath: string;
}

export class SystemService {
  showNotification(title: string, body?: string): boolean {
    try {
      if (Notification.isSupported()) {
        const notification = new Notification({
          title,
          body: body || '',
          urgency: 'normal',
        });
        notification.show();
        logger.info('System', `Triggered notification: "${title}"`);
        return true;
      } else {
        logger.warn('System', 'Notifications are not supported on this platform');
        return false;
      }
    } catch (err) {
      logger.error('System', `Failed to show notification: ${err}`);
      return false;
    }
  }

  getSystemInfo(): SystemInfo {
    const platform = os.platform();
    const isLinux = platform === 'linux';
    let isUbuntu = false;

    if (isLinux) {
      try {
        const release = os.release().toLowerCase();
        isUbuntu = release.includes('ubuntu') || true; // Linux desktop target
      } catch {
        isUbuntu = true;
      }
    }

    return {
      platform,
      arch: os.arch(),
      osRelease: os.release(),
      appName: app?.getName ? app.getName() : 'Camera Recorder',
      appVersion: app?.getVersion ? app.getVersion() : '1.0.0',
      isLinux,
      isUbuntu,
      storagePath: PathManager.getStoragePath(),
    };
  }

  async openExternal(url: string): Promise<void> {
    try {
      // Basic URL safety validation
      if (url.startsWith('http://') || url.startsWith('https://')) {
        await shell.openExternal(url);
      }
    } catch (err) {
      logger.error('System', `Error opening external URL ${url}: ${err}`);
    }
  }
}

export const systemService = new SystemService();
