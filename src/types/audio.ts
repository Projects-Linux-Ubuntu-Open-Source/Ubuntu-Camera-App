export type AudioStatus = 'idle' | 'monitoring' | 'recording' | 'error' | 'permission_denied';

export interface AudioConfig {
  deviceId: string | null;
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
  sampleRate?: number;
  channelCount?: number;
}

export interface AudioLevelData {
  instantLevel: number; // 0 to 100
  peakLevel: number; // 0 to 100
  rmsDecibels: number; // e.g. -60 to 0 dB
  isClipping: boolean;
}
