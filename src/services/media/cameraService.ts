import { CameraResolution, FPSOption, SnapshotData } from '../../types/camera';
import { MediaDeviceInfoItem } from '../../types/device';
import { generateFilename } from '../../utils/mediaUtils';

export interface CameraStartOptions {
  deviceId?: string | null;
  resolution?: CameraResolution;
  fps?: FPSOption;
}

export interface CameraService {
  getDevices(): Promise<MediaDeviceInfoItem[]>;
  start(options?: CameraStartOptions): Promise<MediaStream>;
  stop(): void;
  takeSnapshot(videoElement: HTMLVideoElement, mirror?: boolean): Promise<SnapshotData>;
  getCurrentStream(): MediaStream | null;
  getTrackSettings(): MediaTrackSettings | null;
}

export class BrowserCameraService implements CameraService {
  private activeStream: MediaStream | null = null;

  async getDevices(): Promise<MediaDeviceInfoItem[]> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      throw new Error('MediaDevices API not supported in this browser');
    }
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices
      .filter((d) => d.kind === 'videoinput')
      .map((d, index) => ({
        deviceId: d.deviceId,
        label: d.label || `Camera ${index + 1}`,
        kind: 'videoinput' as const,
        groupId: d.groupId,
      }));
  }

  async start(options?: CameraStartOptions): Promise<MediaStream> {
    this.stop();

    const constraints: MediaStreamConstraints = {
      video: {
        ...(options?.deviceId ? { deviceId: { exact: options.deviceId } } : {}),
        ...(options?.resolution
          ? {
              width: { ideal: options.resolution.width },
              height: { ideal: options.resolution.height },
            }
          : { width: { ideal: 1920 }, height: { ideal: 1080 } }),
        ...(options?.fps ? { frameRate: { ideal: options.fps } } : { frameRate: { ideal: 30 } }),
      },
      audio: false,
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.activeStream = stream;
      return stream;
    } catch (err: unknown) {
      const error = err as Error & { name?: string };
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        throw new Error('Camera permission was denied. Please allow camera access in browser settings.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        throw new Error('No camera hardware found on this system.');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        throw new Error('Camera is currently in use by another application or OS process.');
      } else if (error.name === 'OverconstrainedError') {
        // Fallback with minimal constraints
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        this.activeStream = fallbackStream;
        return fallbackStream;
      }
      throw error;
    }
  }

  stop(): void {
    if (this.activeStream) {
      this.activeStream.getTracks().forEach((track) => track.stop());
      this.activeStream = null;
    }
  }

  getCurrentStream(): MediaStream | null {
    return this.activeStream;
  }

  getTrackSettings(): MediaTrackSettings | null {
    if (!this.activeStream) return null;
    const videoTrack = this.activeStream.getVideoTracks()[0];
    return videoTrack ? videoTrack.getSettings() : null;
  }

  async takeSnapshot(videoElement: HTMLVideoElement, mirror: boolean = false): Promise<SnapshotData> {
    if (!videoElement || videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
      throw new Error('Video feed is not ready for snapshot capture');
    }

    const width = videoElement.videoWidth;
    const height = videoElement.videoHeight;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to create canvas context');
    }

    if (mirror) {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(videoElement, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/png');
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error('Snapshot Blob generation failed'));
      }, 'image/png');
    });

    const filename = generateFilename('photo', 'png');

    return {
      id: `photo_${Date.now()}`,
      blob,
      dataUrl,
      width,
      height,
      timestamp: Date.now(),
      filename,
    };
  }
}

export const cameraService: CameraService = new BrowserCameraService();
