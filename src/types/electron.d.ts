import { RecordingItem } from './recording';

export interface NativeRecordingResult {
  filePath: string;
  filename: string;
  size: number;
  duration?: number;
  timestamp: number;
}

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

export interface ElectronAPI {
  platform: string;
  isElectron: boolean;

  recording: {
    start(options?: { type?: 'video' | 'audio'; name?: string }): Promise<{ success: boolean; id: string }>;
    stop(): Promise<NativeRecordingResult | null>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    getStatus(): Promise<{ isRecording: boolean; isPaused: boolean; duration: number }>;
  };

  filesystem: {
    saveFile(data: ArrayBuffer, filename: string, mimeType?: string): Promise<{ success: boolean; filePath: string; size: number }>;
    chooseDirectory(): Promise<string | null>;
    getRecordings(): Promise<RecordingItem[]>;
    openFile(filePath: string): Promise<boolean>;
    showInFolder(filePath: string): Promise<boolean>;
    deleteFile(filePath: string): Promise<boolean>;
    deleteMultiple(filePaths: string[]): Promise<boolean>;
    getStoragePath(): Promise<string>;
    setStoragePath(newPath: string): Promise<boolean>;
  };

  system: {
    showNotification(title: string, body?: string): Promise<boolean>;
    getSystemInfo(): Promise<SystemInfo>;
    openExternal(url: string): Promise<void>;
  };

  devices: {
    getDevices(): Promise<{ cameras: MediaDeviceInfo[]; microphones: MediaDeviceInfo[] }>;
  };

  window?: {
    minimize(): Promise<void>;
    maximize(): Promise<void>;
    close(): Promise<void>;
    quit(): Promise<void>;
  };

  onMenuAction(callback: (action: string) => void): () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
