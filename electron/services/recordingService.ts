import { logger } from '../utils/logger';
import { systemService } from './systemService';

export interface NativeRecordingSession {
  id: string;
  type: 'video' | 'audio';
  name: string;
  startTime: number;
  isPaused: boolean;
  pausedDuration: number;
  pauseTimestamp: number | null;
}

export class RecordingService {
  private currentSession: NativeRecordingSession | null = null;

  startRecording(type: 'video' | 'audio' = 'video', name?: string): { success: boolean; id: string } {
    const id = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.currentSession = {
      id,
      type,
      name: name || `${type === 'video' ? 'video' : 'audio'}_recording_${Date.now()}`,
      startTime: Date.now(),
      isPaused: false,
      pausedDuration: 0,
      pauseTimestamp: null,
    };

    logger.info('Recording', `Started recording session: ${id} (${type})`);
    systemService.showNotification('Recording Started', `Live ${type} recording is now active.`);

    return { success: true, id };
  }

  pauseRecording(): void {
    if (this.currentSession && !this.currentSession.isPaused) {
      this.currentSession.isPaused = true;
      this.currentSession.pauseTimestamp = Date.now();
      logger.info('Recording', `Paused session: ${this.currentSession.id}`);
    }
  }

  resumeRecording(): void {
    if (this.currentSession && this.currentSession.isPaused && this.currentSession.pauseTimestamp) {
      this.currentSession.pausedDuration += Date.now() - this.currentSession.pauseTimestamp;
      this.currentSession.isPaused = false;
      this.currentSession.pauseTimestamp = null;
      logger.info('Recording', `Resumed session: ${this.currentSession.id}`);
    }
  }

  stopRecording(): { id: string; duration: number } | null {
    if (!this.currentSession) return null;

    let duration = Date.now() - this.currentSession.startTime - this.currentSession.pausedDuration;
    if (this.currentSession.isPaused && this.currentSession.pauseTimestamp) {
      duration -= Date.now() - this.currentSession.pauseTimestamp;
    }

    const completed = {
      id: this.currentSession.id,
      duration: Math.max(0, Math.floor(duration / 1000)),
    };

    logger.info('Recording', `Stopped recording session: ${completed.id} (duration: ${completed.duration}s)`);
    systemService.showNotification('Recording Stopped', `Recording completed (${completed.duration}s).`);

    this.currentSession = null;
    return completed;
  }

  getStatus(): { isRecording: boolean; isPaused: boolean; duration: number } {
    if (!this.currentSession) {
      return { isRecording: false, isPaused: false, duration: 0 };
    }

    let elapsed = Date.now() - this.currentSession.startTime - this.currentSession.pausedDuration;
    if (this.currentSession.isPaused && this.currentSession.pauseTimestamp) {
      elapsed -= Date.now() - this.currentSession.pauseTimestamp;
    }

    return {
      isRecording: true,
      isPaused: this.currentSession.isPaused,
      duration: Math.max(0, Math.floor(elapsed / 1000)),
    };
  }
}

export const recordingService = new RecordingService();
