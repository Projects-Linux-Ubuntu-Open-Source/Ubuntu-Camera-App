import { useState, useRef, useCallback, useEffect } from 'react';
import { recordingService, RecordingResult } from '../services/media/recordingService';
import { PlatformBridge } from '../services/platform/platformBridge';
import { RecordingItem, RecordingOptions, RecordingType } from '../types/recording';
import { generateFilename } from '../utils/mediaUtils';
import { useRecorderStore } from '../stores/recorderStore';
import { useAppStore } from '../stores/appStore';

export function useMediaRecorder() {
  const { status, setStatus, duration, setDuration, loadRecordings } = useRecorderStore();
  const { addToast } = useAppStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const activeTypeRef = useRef<RecordingType>('video');

  const clearTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const startTimer = () => {
    clearTimer();
    timerIntervalRef.current = window.setInterval(() => {
      setDuration(recordingService.getCurrentDuration());
    }, 200);
  };

  const startRecording = useCallback(async (
    stream: MediaStream,
    type: 'video' | 'audio' = 'video',
    options?: RecordingOptions
  ) => {
    setErrorMessage(null);
    activeTypeRef.current = type;
    try {
      await recordingService.start(stream, type === 'audio', options);
      setStatus('recording');
      setDuration(0);
      startTimer();
      addToast({
        title: `${type === 'video' ? 'Video' : 'Audio'} Recording Started`,
        message: 'Capturing live stream...',
        type: 'info',
        duration: 3000,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to start recording';
      setErrorMessage(msg);
      setStatus('error');
      addToast({
        title: 'Recording Error',
        message: msg,
        type: 'error',
      });
    }
  }, [setStatus, setDuration, addToast]);

  const pauseRecording = useCallback(() => {
    try {
      recordingService.pause();
      clearTimer();
      setStatus('paused');
      addToast({
        title: 'Recording Paused',
        type: 'info',
      });
    } catch (err: unknown) {
      console.error('Pause error:', err);
    }
  }, [setStatus, addToast]);

  const resumeRecording = useCallback(() => {
    try {
      recordingService.resume();
      setStatus('recording');
      startTimer();
      addToast({
        title: 'Recording Resumed',
        type: 'info',
      });
    } catch (err: unknown) {
      console.error('Resume error:', err);
    }
  }, [setStatus, addToast]);

  const stopRecording = useCallback(async (
    customName?: string,
    metadata?: RecordingItem['metadata']
  ): Promise<RecordingItem | null> => {
    clearTimer();
    setStatus('stopping');

    try {
      const result: RecordingResult = await recordingService.stop();
      const type = activeTypeRef.current;
      const filename = customName || generateFilename(type, result.mimeType);

      const savedItem = await PlatformBridge.saveRecording({
        name: filename,
        type,
        duration: Math.max(1, Math.round(result.duration)),
        size: result.blob.size,
        mimeType: result.mimeType,
        blob: result.blob,
        metadata: {
          ...metadata,
          mimeType: result.mimeType,
        },
      });

      setStatus('idle');
      setDuration(0);
      await loadRecordings();

      addToast({
        title: 'Recording Saved',
        message: `Saved ${filename} (${(result.blob.size / 1024 / 1024).toFixed(2)} MB)`,
        type: 'success',
      });

      return savedItem;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to stop recording';
      setErrorMessage(msg);
      setStatus('error');
      addToast({
        title: 'Recording Save Failed',
        message: msg,
        type: 'error',
      });
      return null;
    }
  }, [setStatus, setDuration, loadRecordings, addToast]);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, []);

  return {
    status,
    duration,
    errorMessage,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
  };
}
