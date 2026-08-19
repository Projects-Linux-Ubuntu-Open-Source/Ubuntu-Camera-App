import { RecordingOptions, RecordingStatus } from '../../types/recording';
import { getBestAudioMimeType, getBestVideoMimeType } from '../../utils/mediaUtils';

export interface RecordingResult {
  blob: Blob;
  mimeType: string;
  duration: number;
}

export interface RecordingService {
  start(stream: MediaStream, isAudioOnly?: boolean, options?: RecordingOptions): Promise<void>;
  pause(): void;
  resume(): void;
  stop(): Promise<RecordingResult>;
  getStatus(): RecordingStatus;
  getCurrentDuration(): number;
}

export class BrowserRecordingService implements RecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private status: RecordingStatus = 'idle';
  private startTime: number = 0;
  private pausedTimeTotal: number = 0;
  private lastPauseTime: number = 0;
  private activeMimeType: string = '';

  getStatus(): RecordingStatus {
    return this.status;
  }

  getCurrentDuration(): number {
    if (this.status === 'idle' || this.startTime === 0) return 0;
    if (this.status === 'paused') {
      return (this.lastPauseTime - this.startTime - this.pausedTimeTotal) / 1000;
    }
    return (Date.now() - this.startTime - this.pausedTimeTotal) / 1000;
  }

  async start(stream: MediaStream, isAudioOnly: boolean = false, options?: RecordingOptions): Promise<void> {
    if (this.status === 'recording' || this.status === 'paused') {
      throw new Error('Recording is already in progress');
    }

    this.recordedChunks = [];
    this.status = 'preparing';
    this.startTime = 0;
    this.pausedTimeTotal = 0;

    let mimeType = options?.mimeType;
    if (!mimeType) {
      mimeType = isAudioOnly ? getBestAudioMimeType() : getBestVideoMimeType();
    }

    const recorderOptions: MediaRecorderOptions = {};
    if (mimeType && MediaRecorder.isTypeSupported(mimeType)) {
      recorderOptions.mimeType = mimeType;
      this.activeMimeType = mimeType;
    } else {
      this.activeMimeType = '';
    }

    if (options?.videoBitsPerSecond && !isAudioOnly) {
      recorderOptions.videoBitsPerSecond = options.videoBitsPerSecond;
    }
    if (options?.audioBitsPerSecond) {
      recorderOptions.audioBitsPerSecond = options.audioBitsPerSecond;
    }

    try {
      this.mediaRecorder = new MediaRecorder(stream, recorderOptions);
    } catch {
      // Fallback without mimeType or bitrates if browser throws
      this.mediaRecorder = new MediaRecorder(stream);
      this.activeMimeType = this.mediaRecorder.mimeType || (isAudioOnly ? 'audio/webm' : 'video/webm');
    }

    this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
      if (event.data && event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    // Use a 500ms timeslice to ensure incremental flush
    this.mediaRecorder.start(options?.timeslice || 500);
    this.startTime = Date.now();
    this.status = 'recording';
  }

  pause(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      this.status = 'paused';
      this.lastPauseTime = Date.now();
    }
  }

  resume(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      this.status = 'recording';
      if (this.lastPauseTime > 0) {
        this.pausedTimeTotal += Date.now() - this.lastPauseTime;
        this.lastPauseTime = 0;
      }
    }
  }

  async stop(): Promise<RecordingResult> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        this.status = 'idle';
        return reject(new Error('MediaRecorder instance does not exist'));
      }

      this.status = 'stopping';
      const duration = this.getCurrentDuration();

      this.mediaRecorder.onstop = () => {
        const mimeType = this.activeMimeType || this.mediaRecorder?.mimeType || 'video/webm';
        const finalBlob = new Blob(this.recordedChunks, { type: mimeType });

        this.status = 'idle';
        this.recordedChunks = [];
        this.mediaRecorder = null;
        this.startTime = 0;
        this.pausedTimeTotal = 0;
        this.lastPauseTime = 0;

        resolve({
          blob: finalBlob,
          mimeType,
          duration,
        });
      };

      this.mediaRecorder.onerror = (event: Event) => {
        this.status = 'error';
        reject(new Error(`MediaRecorder error: ${(event as unknown as { error?: Error }).error?.message || 'unknown'}`));
      };

      if (this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      } else {
        const mimeType = this.activeMimeType || 'video/webm';
        const finalBlob = new Blob(this.recordedChunks, { type: mimeType });
        this.status = 'idle';
        resolve({ blob: finalBlob, mimeType, duration });
      }
    });
  }
}

export const recordingService: RecordingService = new BrowserRecordingService();
