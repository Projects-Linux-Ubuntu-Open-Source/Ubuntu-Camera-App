import { create } from 'zustand';
import { CameraResolution, COMMON_RESOLUTIONS, FPSOption, SnapshotData } from '../types/camera';

interface CameraState {
  selectedCameraId: string | null;
  resolution: CameraResolution;
  fps: FPSOption;
  mirror: boolean;
  showGrid: boolean;
  status: 'idle' | 'starting' | 'running' | 'error' | 'permission_denied';
  errorMessage: string | null;
  lastSnapshot: SnapshotData | null;
  activeStream: MediaStream | null;

  // Actions
  setSelectedCameraId: (id: string | null) => void;
  setResolution: (res: CameraResolution) => void;
  setFps: (fps: FPSOption) => void;
  setMirror: (mirror: boolean) => void;
  setShowGrid: (grid: boolean) => void;
  setStatus: (status: CameraState['status']) => void;
  setErrorMessage: (msg: string | null) => void;
  setLastSnapshot: (snapshot: SnapshotData | null) => void;
  setActiveStream: (stream: MediaStream | null) => void;
}

export const useCameraStore = create<CameraState>((set) => ({
  selectedCameraId: null,
  resolution: COMMON_RESOLUTIONS[1], // 1080p
  fps: 30,
  mirror: false,
  showGrid: false,
  status: 'idle',
  errorMessage: null,
  lastSnapshot: null,
  activeStream: null,

  setSelectedCameraId: (id) => set({ selectedCameraId: id }),
  setResolution: (resolution) => set({ resolution }),
  setFps: (fps) => set({ fps }),
  setMirror: (mirror) => set({ mirror }),
  setShowGrid: (showGrid) => set({ showGrid }),
  setStatus: (status) => set({ status }),
  setErrorMessage: (errorMessage) => set({ errorMessage }),
  setLastSnapshot: (lastSnapshot) => set({ lastSnapshot }),
  setActiveStream: (activeStream) => set({ activeStream }),
}));
