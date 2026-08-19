export type RecordingType = 'video' | 'audio' | 'photo';

export type RecordingStatus = 'idle' | 'preparing' | 'recording' | 'paused' | 'stopping' | 'error';

export type VideoQuality = 'ultra' | 'high' | 'medium' | 'low';
export type AudioQuality = 'high' | 'medium' | 'voice';

export interface RecordingMetadata {
  resolution?: { width: number; height: number };
  fps?: number;
  mimeType: string;
  bitrate?: number;
  audioChannels?: number;
  cameraName?: string;
  microphoneName?: string;
}

export interface RecordingItem {
  id: string;
  name: string;
  type: RecordingType;
  timestamp: number; // Unix epoch ms
  duration: number; // in seconds
  size: number; // in bytes
  mimeType: string;
  blob?: Blob;
  previewUrl?: string; // object URL or data URL
  thumbnailUrl?: string;
  metadata?: RecordingMetadata;
}

export interface RecordingOptions {
  mimeType?: string;
  videoBitsPerSecond?: number;
  audioBitsPerSecond?: number;
  timeslice?: number;
}
