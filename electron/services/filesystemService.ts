import fs from 'fs';
import path from 'path';
import { dialog, shell, BrowserWindow } from 'electron';
import { PathManager } from '../utils/paths';
import { logger } from '../utils/logger';

export interface SavedFileInfo {
  success: boolean;
  filePath: string;
  size: number;
}

export interface NativeFileItem {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'photo';
  filePath: string;
  size: number;
  timestamp: number;
  duration: number;
  mimeType: string;
}

export class FilesystemService {
  async chooseDirectory(parentWindow?: BrowserWindow | null): Promise<string | null> {
    try {
      const currentPath = PathManager.getStoragePath();
      const result = await dialog.showOpenDialog(parentWindow || (BrowserWindow.getFocusedWindow() as BrowserWindow), {
        title: 'Select Recording Storage Folder',
        defaultPath: currentPath,
        properties: ['openDirectory', 'createDirectory'],
      });

      if (!result.canceled && result.filePaths.length > 0) {
        const chosen = result.filePaths[0];
        PathManager.setStoragePath(chosen);
        return chosen;
      }
      return null;
    } catch (err) {
      logger.error('Filesystem', `Error choosing directory: ${err}`);
      return null;
    }
  }

  async saveFile(data: ArrayBuffer | Buffer, filename: string, mimeType?: string): Promise<SavedFileInfo> {
    try {
      const storageDir = PathManager.getStoragePath();
      PathManager.ensureDirectory(storageDir);

      // Sanitize filename
      const sanitized = filename.replace(/[/\\?%*:|"<>]/g, '-');
      const targetPath = path.join(storageDir, sanitized);

      const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
      await fs.promises.writeFile(targetPath, buffer);

      logger.info('Filesystem', `Saved recording to: ${targetPath} (${buffer.length} bytes)`);

      return {
        success: true,
        filePath: targetPath,
        size: buffer.length,
      };
    } catch (err) {
      logger.error('Filesystem', `Failed to save file "${filename}": ${err}`);
      throw new Error(`Failed to save file: ${err}`);
    }
  }

  async getRecordings(): Promise<NativeFileItem[]> {
    try {
      const storageDir = PathManager.getStoragePath();
      PathManager.ensureDirectory(storageDir);

      const files = await fs.promises.readdir(storageDir, { withFileTypes: true });
      const items: NativeFileItem[] = [];

      for (const entry of files) {
        if (!entry.isFile()) continue;

        const fullPath = path.join(storageDir, entry.name);
        try {
          const stats = await fs.promises.stat(fullPath);
          const ext = path.extname(entry.name).toLowerCase();

          let type: 'video' | 'audio' | 'photo' = 'video';
          let mimeType = 'video/webm';

          if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
            type = 'photo';
            mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
          } else if (['.weba', '.webm', '.ogg', '.wav', '.mp3', '.m4a', '.flac'].includes(ext) && (entry.name.startsWith('audio_') || ext === '.wav' || ext === '.mp3' || ext === '.weba')) {
            type = 'audio';
            mimeType = 'audio/webm';
          } else if (['.webm', '.mp4', '.mkv', '.mov', '.avi'].includes(ext)) {
            type = 'video';
            mimeType = 'video/webm';
          }

          items.push({
            id: `electron_${Buffer.from(fullPath).toString('base64').substring(0, 16)}`,
            name: entry.name,
            type,
            filePath: fullPath,
            size: stats.size,
            timestamp: stats.mtimeMs,
            duration: 0,
            mimeType,
          });
        } catch (err) {
          logger.warn('Filesystem', `Could not stat file ${fullPath}: ${err}`);
        }
      }

      // Sort newest first
      items.sort((a, b) => b.timestamp - a.timestamp);
      return items;
    } catch (err) {
      logger.error('Filesystem', `Error reading recordings directory: ${err}`);
      return [];
    }
  }

  async openFile(filePath: string): Promise<boolean> {
    try {
      if (!fs.existsSync(filePath)) {
        logger.warn('Filesystem', `File does not exist: ${filePath}`);
        return false;
      }
      const err = await shell.openPath(filePath);
      if (err) {
        logger.error('Filesystem', `Error opening file: ${err}`);
        return false;
      }
      return true;
    } catch (err) {
      logger.error('Filesystem', `Exception opening file ${filePath}: ${err}`);
      return false;
    }
  }

  async showInFolder(filePath: string): Promise<boolean> {
    try {
      if (fs.existsSync(filePath)) {
        shell.showItemInFolder(filePath);
        return true;
      } else {
        const parent = path.dirname(filePath);
        if (fs.existsSync(parent)) {
          shell.openPath(parent);
          return true;
        }
      }
      return false;
    } catch (err) {
      logger.error('Filesystem', `Error showing item in folder: ${err}`);
      return false;
    }
  }

  async deleteFile(filePath: string): Promise<boolean> {
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        logger.info('Filesystem', `Deleted file: ${filePath}`);
        return true;
      }
      return false;
    } catch (err) {
      logger.error('Filesystem', `Error deleting file ${filePath}: ${err}`);
      return false;
    }
  }

  async deleteMultiple(filePaths: string[]): Promise<boolean> {
    let allSuccessful = true;
    for (const p of filePaths) {
      const ok = await this.deleteFile(p);
      if (!ok) allSuccessful = false;
    }
    return allSuccessful;
  }

  getStoragePath(): string {
    return PathManager.getStoragePath();
  }

  setStoragePath(newPath: string): boolean {
    return PathManager.setStoragePath(newPath);
  }
}

export const filesystemService = new FilesystemService();
