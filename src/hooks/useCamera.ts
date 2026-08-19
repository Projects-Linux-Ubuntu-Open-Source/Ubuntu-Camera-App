import { useState, useEffect, useRef, useCallback } from 'react';
import { cameraService } from '../services/media/cameraService';
import { CameraResolution, FPSOption, SnapshotData } from '../types/camera';
import { useCameraStore } from '../stores/cameraStore';

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const {
    selectedCameraId,
    resolution,
    fps,
    mirror,
    showGrid,
    status,
    errorMessage,
    lastSnapshot,
    activeStream,
    setSelectedCameraId,
    setResolution,
    setFps,
    setMirror,
    setShowGrid,
    setStatus,
    setErrorMessage,
    setLastSnapshot,
    setActiveStream,
  } = useCameraStore();

  const [actualResolution, setActualResolution] = useState<{ width: number; height: number } | null>(null);
  const [actualFps, setActualFps] = useState<number | null>(null);

  const startCamera = useCallback(async (
    targetCameraId: string | null = selectedCameraId,
    targetRes: CameraResolution = resolution,
    targetFps: FPSOption = fps
  ) => {
    setStatus('starting');
    setErrorMessage(null);

    try {
      const stream = await cameraService.start({
        deviceId: targetCameraId,
        resolution: targetRes,
        fps: targetFps,
      });

      setActiveStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((e) => console.warn('Video play prevented:', e));
      }

      // Track settings for actual resolution/fps feedback
      const settings = cameraService.getTrackSettings();
      if (settings) {
        if (settings.width && settings.height) {
          setActualResolution({ width: settings.width, height: settings.height });
        }
        if (settings.frameRate) {
          setActualFps(Math.round(settings.frameRate));
        }
      }

      setStatus('running');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to start camera';
      setErrorMessage(msg);
      setStatus(msg.includes('permission') ? 'permission_denied' : 'error');
    }
  }, [selectedCameraId, resolution, fps, setActiveStream, setErrorMessage, setStatus]);

  const stopCamera = useCallback(() => {
    cameraService.stop();
    setActiveStream(null);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStatus('idle');
    setActualResolution(null);
    setActualFps(null);
  }, [setActiveStream, setStatus]);

  const takeSnapshot = useCallback(async (): Promise<SnapshotData | null> => {
    if (!videoRef.current || status !== 'running') {
      return null;
    }
    try {
      const snapshot = await cameraService.takeSnapshot(videoRef.current, mirror);
      setLastSnapshot(snapshot);
      return snapshot;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Snapshot capture failed';
      setErrorMessage(msg);
      return null;
    }
  }, [status, mirror, setLastSnapshot, setErrorMessage]);

  // Connect videoRef when stream changes
  useEffect(() => {
    if (videoRef.current && activeStream) {
      if (videoRef.current.srcObject !== activeStream) {
        videoRef.current.srcObject = activeStream;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [activeStream]);

  // Clean up when unmounting if requested
  useEffect(() => {
    return () => {
      // Keep stream alive in store unless explicit stop is called, or component decides
    };
  }, []);

  return {
    videoRef,
    status,
    errorMessage,
    selectedCameraId,
    resolution,
    fps,
    mirror,
    showGrid,
    actualResolution,
    actualFps,
    lastSnapshot,
    activeStream,
    startCamera,
    stopCamera,
    takeSnapshot,
    setSelectedCameraId,
    setResolution,
    setFps,
    setMirror,
    setShowGrid,
    setLastSnapshot,
  };
}
