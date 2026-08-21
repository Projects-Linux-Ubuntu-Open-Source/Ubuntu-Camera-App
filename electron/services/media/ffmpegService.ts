import { spawn } from 'child_process';
import { logger } from '../../utils/logger';

export interface FFmpegTranscodeOptions {
  inputPath: string;
  outputPath: string;
  videoCodec?: 'h264' | 'vp8' | 'vp9' | 'copy';
  audioCodec?: 'aac' | 'opus' | 'mp3' | 'copy';
  qualityPreset?: 'ultrafast' | 'fast' | 'medium' | 'slow';
}

export class FFmpegService {
  private isAvailable: boolean | null = null;

  async checkAvailability(): Promise<boolean> {
    if (this.isAvailable !== null) return this.isAvailable;

    return new Promise((resolve) => {
      try {
        const proc = spawn('ffmpeg', ['-version']);
        proc.on('error', () => {
          this.isAvailable = false;
          logger.info('FFmpeg', 'Native FFmpeg binary not found on PATH (will use standard Chromium MediaRecorder pipeline).');
          resolve(false);
        });
        proc.on('close', (code) => {
          this.isAvailable = code === 0;
          if (this.isAvailable) {
            logger.info('FFmpeg', 'Native FFmpeg detected and available on Ubuntu system.');
          }
          resolve(this.isAvailable);
        });
      } catch {
        this.isAvailable = false;
        resolve(false);
      }
    });
  }

  async transcode(options: FFmpegTranscodeOptions): Promise<boolean> {
    const hasFFmpeg = await this.checkAvailability();
    if (!hasFFmpeg) {
      logger.warn('FFmpeg', 'Transcoding skipped: FFmpeg is not installed on the system.');
      return false;
    }

    return new Promise((resolve) => {
      const args = [
        '-i', options.inputPath,
        '-c:v', options.videoCodec || 'copy',
        '-c:a', options.audioCodec || 'copy',
        '-y', options.outputPath,
      ];

      logger.info('FFmpeg', `Running command: ffmpeg ${args.join(' ')}`);
      const proc = spawn('ffmpeg', args);

      proc.on('error', (err) => {
        logger.error('FFmpeg', `Transcode process error: ${err}`);
        resolve(false);
      });

      proc.on('close', (code) => {
        const success = code === 0;
        logger.info('FFmpeg', `Transcode finished with exit code ${code}`);
        resolve(success);
      });
    });
  }
}

export const ffmpegService = new FFmpegService();
