import path from 'path';
import os from 'os';
import fs from 'fs';
import { app } from 'electron';
import { logger } from './logger';

export class PathManager {
  private static userConfigPath: string | null = null;
  private static customStoragePath: string | null = null;

  static getDefaultStoragePath(): string {
    const home = os.homedir();
    // Ubuntu / Linux standard Videos directory or fallback
    const videosPath = path.join(home, 'Videos', 'CameraRecorder');
    return videosPath;
  }

  static getStoragePath(): string {
    if (this.customStoragePath && fs.existsSync(this.customStoragePath)) {
      return this.customStoragePath;
    }

    const saved = this.loadSavedStoragePath();
    if (saved && fs.existsSync(saved)) {
      this.customStoragePath = saved;
      return saved;
    }

    const defaultPath = this.getDefaultStoragePath();
    this.ensureDirectory(defaultPath);
    return defaultPath;
  }

  static setStoragePath(newPath: string): boolean {
    try {
      if (!fs.existsSync(newPath)) {
        fs.mkdirSync(newPath, { recursive: true });
      }
      this.customStoragePath = newPath;
      this.saveStoragePath(newPath);
      logger.info('Filesystem', `Storage directory updated to: ${newPath}`);
      return true;
    } catch (err) {
      logger.error('Filesystem', `Failed to set storage path: ${err}`);
      return false;
    }
  }

  static ensureDirectory(dirPath: string): boolean {
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        logger.info('Filesystem', `Created directory: ${dirPath}`);
      }
      return true;
    } catch (err) {
      logger.error('Filesystem', `Failed to create directory ${dirPath}: ${err}`);
      return false;
    }
  }

  private static getConfigFilePath(): string {
    if (!this.userConfigPath) {
      try {
        const userData = app?.getPath ? app.getPath('userData') : path.join(os.homedir(), '.config', 'camera-recorder');
        this.ensureDirectory(userData);
        this.userConfigPath = path.join(userData, 'preferences.json');
      } catch {
        this.userConfigPath = path.join(os.homedir(), '.config', 'camera-recorder', 'preferences.json');
      }
    }
    return this.userConfigPath;
  }

  private static loadSavedStoragePath(): string | null {
    try {
      const configPath = this.getConfigFilePath();
      if (fs.existsSync(configPath)) {
        const data = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        return data.storagePath || null;
      }
    } catch (err) {
      logger.warn('Filesystem', `Could not read preferences: ${err}`);
    }
    return null;
  }

  private static saveStoragePath(newPath: string): void {
    try {
      const configPath = this.getConfigFilePath();
      const parent = path.dirname(configPath);
      this.ensureDirectory(parent);
      const existing = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf-8')) : {};
      existing.storagePath = newPath;
      fs.writeFileSync(configPath, JSON.stringify(existing, null, 2), 'utf-8');
    } catch (err) {
      logger.warn('Filesystem', `Could not write preferences: ${err}`);
    }
  }
}
