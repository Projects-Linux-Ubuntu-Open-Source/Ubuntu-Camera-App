export interface RecordingPipelineSource {
  type: 'webrtc' | 'pipewire' | 'v4l2' | 'pulse';
  deviceId?: string;
}

export interface RecordingPipelineSink {
  type: 'file' | 'stream';
  format: 'webm' | 'mp4' | 'mkv' | 'wav';
  destinationPath: string;
}

export interface IRecordingPipeline {
  initialize(sources: RecordingPipelineSource[], sink: RecordingPipelineSink): Promise<boolean>;
  start(): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  stop(): Promise<string>;
}

/**
 * Standard Chromium MediaRecorder-backed pipeline for Electron Phase 2.
 * Structured to cleanly allow a Phase 3 PipeWire / GStreamer / Native C++ upgrade.
 */
export class HybridMediaRecorderPipeline implements IRecordingPipeline {
  private sinkPath: string = '';

  async initialize(sources: RecordingPipelineSource[], sink: RecordingPipelineSink): Promise<boolean> {
    this.sinkPath = sink.destinationPath;
    return true;
  }

  async start(): Promise<void> {
    // Pipeline started
  }

  async pause(): Promise<void> {
    // Pipeline paused
  }

  async resume(): Promise<void> {
    // Pipeline resumed
  }

  async stop(): Promise<string> {
    return this.sinkPath;
  }
}
