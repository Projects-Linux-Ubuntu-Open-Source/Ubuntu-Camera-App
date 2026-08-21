import { isElectron } from '../../utils/environment';
import { RecordingItem } from '../../types/recording';
import { recordingStorage } from '../storage/recordingStorage';
import { blobToArrayBuffer } from '../../utils/mediaUtils';

export interface StorageInfo {
  isNative: boolean;
  path: string;
}

export class PlatformBridge {
  static isDesktop(): boolean {
    return isElectron();
  }

  static async saveRecording(
    itemData: Omit<RecordingItem, 'id' | 'timestamp'> & { blob: Blob; filePath?: string }
  ): Promise<RecordingItem> {
    let nativeFilePath: string | undefined = undefined;

    // 1. If in Electron, save directly to desktop filesystem
    if (this.isDesktop() && window.electronAPI?.filesystem) {
      try {
        const buffer = await blobToArrayBuffer(itemData.blob);
        const result = await window.electronAPI.filesystem.saveFile(
          buffer,
          itemData.name,
          itemData.mimeType
        );
        if (result && result.filePath) {
          nativeFilePath = result.filePath;
        }
      } catch (err) {
        console.warn('[PlatformBridge] Electron filesystem save failed, using fallback:', err);
      }
    }

    // 2. Persist in IndexedDB (stores Blob + optional native filePath)
    const saved = await recordingStorage.save({
      ...itemData,
      ...(nativeFilePath ? { filePath: nativeFilePath } : {}),
    });

    // 3. Show native desktop notification if in Electron
    if (this.isDesktop() && window.electronAPI?.system) {
      window.electronAPI.system.showNotification(
        'Recording Saved',
        `"${itemData.name}" was saved successfully.`
      );
    }

    return saved;
  }

  static async getAllRecordings(): Promise<RecordingItem[]> {
    return await recordingStorage.getAll();
  }

  static async deleteRecording(id: string, filePath?: string): Promise<void> {
    if (this.isDesktop() && filePath && window.electronAPI?.filesystem) {
      try {
        await window.electronAPI.filesystem.deleteFile(filePath);
      } catch (err) {
        console.warn('[PlatformBridge] Native file deletion error:', err);
      }
    }
    await recordingStorage.delete(id);
  }

  static async deleteMultiple(items: RecordingItem[]): Promise<void> {
    if (this.isDesktop() && window.electronAPI?.filesystem) {
      const filePaths = items
        .map((i) => i.filePath)
        .filter((p): p is string => Boolean(p));

      if (filePaths.length > 0) {
        try {
          await window.electronAPI.filesystem.deleteMultiple(filePaths);
        } catch (err) {
          console.warn('[PlatformBridge] Native batch file deletion error:', err);
        }
      }
    }

    const ids = items.map((i) => i.id);
    await recordingStorage.deleteMultiple(ids);
  }

  static async showInFolder(filePath: string): Promise<boolean> {
    if (this.isDesktop() && window.electronAPI?.filesystem) {
      return await window.electronAPI.filesystem.showInFolder(filePath);
    }
    return false;
  }

  static async openFile(filePath: string): Promise<boolean> {
    if (this.isDesktop() && window.electronAPI?.filesystem) {
      return await window.electronAPI.filesystem.openFile(filePath);
    }
    return false;
  }

  static async chooseStorageDirectory(): Promise<string | null> {
    if (this.isDesktop() && window.electronAPI?.filesystem) {
      return await window.electronAPI.filesystem.chooseDirectory();
    }
    return null;
  }

  static async getStorageLocation(): Promise<string> {
    if (this.isDesktop() && window.electronAPI?.filesystem) {
      try {
        return await window.electronAPI.filesystem.getStoragePath();
      } catch {
        return '~/Videos/CameraRecorder';
      }
    }
    return 'Browser Local Storage (IndexedDB)';
  }

  static showNotification(title: string, body?: string): void {
    if (this.isDesktop() && window.electronAPI?.system) {
      window.electronAPI.system.showNotification(title, body);
    } else if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  }
}
