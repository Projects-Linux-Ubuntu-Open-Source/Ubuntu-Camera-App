import { useState, useEffect, useCallback } from 'react';
import { MediaDeviceInfoItem } from '../types/device';

export function useMediaDevices() {
  const [videoInputs, setVideoInputs] = useState<MediaDeviceInfoItem[]>([]);
  const [audioInputs, setAudioInputs] = useState<MediaDeviceInfoItem[]>([]);
  const [audioOutputs, setAudioOutputs] = useState<MediaDeviceInfoItem[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [selectedMicrophoneId, setSelectedMicrophoneId] = useState<string | null>(null);
  const [selectedAudioOutputId, setSelectedAudioOutputId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasPermission, setHasPermission] = useState<{ camera: boolean | null; microphone: boolean | null }>({
    camera: null,
    microphone: null,
  });
  const [error, setError] = useState<string | null>(null);

  const enumerate = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      setError('MediaDevices API is not supported in this environment');
      setIsLoading(false);
      return;
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();

      const videos: MediaDeviceInfoItem[] = [];
      const audios: MediaDeviceInfoItem[] = [];
      const outputs: MediaDeviceInfoItem[] = [];

      devices.forEach((d, idx) => {
        if (d.kind === 'videoinput') {
          videos.push({
            deviceId: d.deviceId,
            label: d.label || `Camera ${videos.length + 1}`,
            kind: 'videoinput',
            groupId: d.groupId,
          });
        } else if (d.kind === 'audioinput') {
          audios.push({
            deviceId: d.deviceId,
            label: d.label || `Microphone ${audios.length + 1}`,
            kind: 'audioinput',
            groupId: d.groupId,
          });
        } else if (d.kind === 'audiooutput') {
          outputs.push({
            deviceId: d.deviceId,
            label: d.label || `Speaker/Output ${outputs.length + 1}`,
            kind: 'audiooutput',
            groupId: d.groupId,
          });
        }
      });

      setVideoInputs(videos);
      setAudioInputs(audios);
      setAudioOutputs(outputs);

      // Auto-select first if none selected or if previous is no longer in list
      setSelectedCameraId((prev) => {
        if (prev && videos.some((v) => v.deviceId === prev)) return prev;
        return videos[0]?.deviceId || null;
      });

      setSelectedMicrophoneId((prev) => {
        if (prev && audios.some((a) => a.deviceId === prev)) return prev;
        return audios[0]?.deviceId || null;
      });

      setSelectedAudioOutputId((prev) => {
        if (prev && outputs.some((o) => o.deviceId === prev)) return prev;
        return outputs[0]?.deviceId || null;
      });

      // Check if device labels are populated (indicates permission granted)
      const hasCameraLabel = videos.some((v) => v.label && !v.label.startsWith('Camera '));
      const hasAudioLabel = audios.some((a) => a.label && !a.label.startsWith('Microphone '));

      setHasPermission({
        camera: hasCameraLabel ? true : null,
        microphone: hasAudioLabel ? true : null,
      });

      setIsLoading(false);
      setError(null);
    } catch (err) {
      console.error('Failed to enumerate devices:', err);
      setError('Could not access media device list');
      setIsLoading(false);
    }
  }, []);

  const requestInitialPermissions = useCallback(async () => {
    setIsLoading(true);
    try {
      // Prompt camera & mic together to get populated labels
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      // Stop immediately after obtaining permissions
      stream.getTracks().forEach((track) => track.stop());
      setHasPermission({ camera: true, microphone: true });
      await enumerate();
    } catch (err: unknown) {
      console.warn('Initial unified permission request failed, retrying separately:', err);
      // Try camera only
      try {
        const camStream = await navigator.mediaDevices.getUserMedia({ video: true });
        camStream.getTracks().forEach((t) => t.stop());
        setHasPermission((p) => ({ ...p, camera: true }));
      } catch {
        setHasPermission((p) => ({ ...p, camera: false }));
      }
      // Try audio only
      try {
        const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStream.getTracks().forEach((t) => t.stop());
        setHasPermission((p) => ({ ...p, microphone: true }));
      } catch {
        setHasPermission((p) => ({ ...p, microphone: false }));
      }
      await enumerate();
    }
  }, [enumerate]);

  useEffect(() => {
    enumerate();

    const handleDeviceChange = () => {
      enumerate();
    };

    navigator.mediaDevices?.addEventListener('devicechange', handleDeviceChange);
    return () => {
      navigator.mediaDevices?.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [enumerate]);

  return {
    videoInputs,
    audioInputs,
    audioOutputs,
    selectedCameraId,
    selectedMicrophoneId,
    selectedAudioOutputId,
    setSelectedCameraId,
    setSelectedMicrophoneId,
    setSelectedAudioOutputId,
    isLoading,
    hasPermission,
    error,
    refreshDevices: enumerate,
    requestInitialPermissions,
  };
}
