import { AudioConfig, AudioLevelData } from '../../types/audio';
import { MediaDeviceInfoItem } from '../../types/device';

export interface AudioVisualizerHandle {
  analyser: AnalyserNode;
  audioContext: AudioContext;
  dataArray: Uint8Array;
  cleanup: () => void;
}

export interface AudioService {
  getDevices(): Promise<MediaDeviceInfoItem[]>;
  start(deviceId?: string | null, config?: Partial<AudioConfig>): Promise<MediaStream>;
  stop(): void;
  createVisualizer(stream: MediaStream): AudioVisualizerHandle;
  calculateAudioLevel(analyser: AnalyserNode, dataArray: Uint8Array): AudioLevelData;
  getCurrentStream(): MediaStream | null;
}

export class BrowserAudioService implements AudioService {
  private activeStream: MediaStream | null = null;
  private currentContext: AudioContext | null = null;

  async getDevices(): Promise<MediaDeviceInfoItem[]> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      throw new Error('MediaDevices API not supported');
    }
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices
      .filter((d) => d.kind === 'audioinput')
      .map((d, index) => ({
        deviceId: d.deviceId,
        label: d.label || `Microphone ${index + 1}`,
        kind: 'audioinput' as const,
        groupId: d.groupId,
      }));
  }

  async start(deviceId?: string | null, config?: Partial<AudioConfig>): Promise<MediaStream> {
    this.stop();

    const constraints: MediaStreamConstraints = {
      audio: {
        ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
        echoCancellation: config?.echoCancellation ?? true,
        noiseSuppression: config?.noiseSuppression ?? true,
        autoGainControl: config?.autoGainControl ?? true,
      },
      video: false,
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.activeStream = stream;
      return stream;
    } catch (err: unknown) {
      const error = err as Error & { name?: string };
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        throw new Error('Microphone permission was denied. Please allow microphone access in browser settings.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        throw new Error('No microphone hardware detected.');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        throw new Error('Microphone is currently in use by another application.');
      }
      throw error;
    }
  }

  stop(): void {
    if (this.activeStream) {
      this.activeStream.getTracks().forEach((track) => track.stop());
      this.activeStream = null;
    }
    if (this.currentContext && this.currentContext.state !== 'closed') {
      try {
        this.currentContext.close();
      } catch {
        // ignore
      }
      this.currentContext = null;
    }
  }

  getCurrentStream(): MediaStream | null {
    return this.activeStream;
  }

  createVisualizer(stream: MediaStream): AudioVisualizerHandle {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioContext = new AudioContextClass();
    this.currentContext = audioContext;

    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;

    source.connect(analyser);
    // Note: Do NOT connect analyser to destination to prevent feedback loop / howling

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const cleanup = () => {
      try {
        source.disconnect();
        analyser.disconnect();
        if (audioContext.state !== 'closed') {
          audioContext.close();
        }
      } catch {
        // ignore
      }
    };

    return {
      analyser,
      audioContext,
      dataArray,
      cleanup,
    };
  }

  calculateAudioLevel(analyser: AnalyserNode, dataArray: Uint8Array): AudioLevelData {
    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    let max = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const val = dataArray[i];
      sum += val * val;
      if (val > max) max = val;
    }

    const rms = Math.sqrt(sum / dataArray.length);
    // Scale 0-255 to 0-100
    const instantLevel = Math.min(100, Math.round((rms / 128) * 100));
    const peakLevel = Math.min(100, Math.round((max / 255) * 100));

    // Calculate approximate decibels
    // RMS normalized to 0.0 - 1.0
    const normalizedRms = rms / 255;
    const db = normalizedRms > 0.0001 ? 20 * Math.log10(normalizedRms) : -80;

    return {
      instantLevel,
      peakLevel,
      rmsDecibels: Math.round(Math.max(-80, Math.min(0, db))),
      isClipping: peakLevel > 95,
    };
  }
}

export const audioService: AudioService = new BrowserAudioService();
