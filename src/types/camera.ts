export type CameraStatus = 'idle' | 'starting' | 'running' | 'error' | 'permission_denied';

export interface CameraResolution {
  label: string;
  width: number;
  height: number;
  aspectRatio: string;
}

export type FPSOption = 15 | 24 | 30 | 60;

export interface CameraConfig {
  deviceId: string | null;
  resolution: CameraResolution;
  fps: FPSOption;
  mirror: boolean;
  torch?: boolean;
}

export interface SnapshotData {
  id: string;
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  timestamp: number;
  filename: string;
}

export const COMMON_RESOLUTIONS: CameraResolution[] = [
  { label: '4K UHD (3840×2160)', width: 3840, height: 2160, aspectRatio: '16:9' },
  { label: '1080p Full HD (1920×1080)', width: 1920, height: 1080, aspectRatio: '16:9' },
  { label: '720p HD (1280×720)', width: 1280, height: 720, aspectRatio: '16:9' },
  { label: '480p SD (854×480)', width: 854, height: 480, aspectRatio: '16:9' },
  { label: 'VGA (640×480)', width: 640, height: 480, aspectRatio: '4:3' },
];

export const FPS_OPTIONS: FPSOption[] = [15, 24, 30, 60];
