import { create } from 'zustand';
import { CameraResolution, COMMON_RESOLUTIONS, FPSOption } from '../types/camera';
import { AudioQuality, VideoQuality } from '../types/recording';

export type AppPage = 'dashboard' | 'camera' | 'audio' | 'recorder' | 'recordings' | 'settings';

export interface AppToast {
  id: string;
  title: string;
  message?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

export interface AppSettings {
  // Camera defaults
  defaultCameraId: string | null;
  defaultResolution: CameraResolution;
  defaultFps: FPSOption;
  mirrorCamera: boolean;
  showGrid: boolean;

  // Audio defaults
  defaultMicrophoneId: string | null;
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;

  // Recording defaults
  videoQuality: VideoQuality;
  audioQuality: AudioQuality;
  defaultVideoMimeType: string;
  defaultAudioMimeType: string;
  saveLocationNotice: string;
}

interface AppState {
  activePage: AppPage;
  systemStatus: 'ready' | 'busy' | 'recording' | 'error';
  toasts: AppToast[];
  settings: AppSettings;
  
  // Actions
  setActivePage: (page: AppPage) => void;
  setSystemStatus: (status: 'ready' | 'busy' | 'recording' | 'error') => void;
  addToast: (toast: Omit<AppToast, 'id'>) => void;
  removeToast: (id: string) => void;
  updateSettings: (partial: Partial<AppSettings>) => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  defaultCameraId: null,
  defaultResolution: COMMON_RESOLUTIONS[1], // 1080p Full HD
  defaultFps: 30,
  mirrorCamera: false,
  showGrid: false,

  defaultMicrophoneId: null,
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,

  videoQuality: 'high',
  audioQuality: 'high',
  defaultVideoMimeType: 'video/webm',
  defaultAudioMimeType: 'audio/webm',
  saveLocationNotice: 'Browser IndexedDB Storage (Electron native filesystem integration planned for Phase 2)',
};

export const useAppStore = create<AppState>((set) => ({
  activePage: 'dashboard',
  systemStatus: 'ready',
  toasts: [],
  settings: DEFAULT_SETTINGS,

  setActivePage: (page) => set({ activePage: page }),
  setSystemStatus: (status) => set({ systemStatus: status }),
  addToast: (toast) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
  updateSettings: (partial) => {
    set((state) => ({
      settings: { ...state.settings, ...partial },
    }));
  },
}));
