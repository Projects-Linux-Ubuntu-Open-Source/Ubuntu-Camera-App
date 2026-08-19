import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  Play,
  Pause,
  Square,
  Camera as CameraIcon,
  Mic,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useCamera } from '../hooks/useCamera';
import { useAudio } from '../hooks/useAudio';
import { useMediaDevices } from '../hooks/useMediaDevices';
import { useMediaRecorder } from '../hooks/useMediaRecorder';
import { useRecorderStore } from '../stores/recorderStore';
import { useAppStore } from '../stores/appStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { DeviceSelector } from '../components/devices/DeviceSelector';
import { PermissionBanner } from '../components/devices/PermissionBanner';
import { MediaViewerModal } from '../components/recordings/MediaViewerModal';
import { formatDuration, formatResolution } from '../utils/formatters';
import { RecordingItem } from '../types/recording';

export const Recorder: React.FC = () => {
  const {
    videoRef,
    status: cameraStatus,
    startCamera,
    stopCamera,
    selectedCameraId,
    setSelectedCameraId,
    resolution,
    fps,
    mirror,
    actualResolution,
  } = useCamera();

  const {
    status: audioStatus,
    selectedMicrophoneId,
    setSelectedMicrophoneId,
    audioLevel,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
  } = useAudio();

  const { videoInputs, audioInputs, hasPermission, requestInitialPermissions, refreshDevices } = useMediaDevices();
  const { status: recStatus, duration, startRecording, pauseRecording, resumeRecording, stopRecording } = useMediaRecorder();
  const { loadRecordings, deleteRecording } = useRecorderStore();
  const { settings } = useAppStore();

  const [lastRecordedItem, setLastRecordedItem] = useState<RecordingItem | null>(null);

  // Initialize both streams on mount
  useEffect(() => {
    startCamera(selectedCameraId, resolution, fps);
    startMonitoring(selectedMicrophoneId);
    loadRecordings();
  }, []);

  const isRecording = recStatus === 'recording' || recStatus === 'paused';
  const isCameraReady = cameraStatus === 'running';
  const isAudioReady = isMonitoring || audioStatus === 'monitoring';

  const handleStartCombinedRecording = async () => {
    // Acquire combined stream
    try {
      const combinedStream = await navigator.mediaDevices.getUserMedia({
        video: {
          ...(selectedCameraId ? { deviceId: { exact: selectedCameraId } } : {}),
          width: { ideal: resolution.width },
          height: { ideal: resolution.height },
          frameRate: { ideal: fps },
        },
        audio: {
          ...(selectedMicrophoneId ? { deviceId: { exact: selectedMicrophoneId } } : {}),
          echoCancellation: settings.echoCancellation,
          noiseSuppression: settings.noiseSuppression,
          autoGainControl: settings.autoGainControl,
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = combinedStream;
      }

      await startRecording(combinedStream, 'video', {
        mimeType: settings.defaultVideoMimeType,
      });
    } catch (err: unknown) {
      console.error('Failed to get combined stream:', err);
    }
  };

  const handleStopRecording = async () => {
    const activeCameraName = videoInputs.find((c) => c.deviceId === selectedCameraId)?.label;
    const activeMicName = audioInputs.find((m) => m.deviceId === selectedMicrophoneId)?.label;

    const saved = await stopRecording(undefined, {
      resolution: actualResolution || { width: resolution.width, height: resolution.height },
      fps,
      cameraName: activeCameraName,
      microphoneName: activeMicName,
      mimeType: settings.defaultVideoMimeType,
    });

    if (saved) {
      setLastRecordedItem(saved);
    }

    // Restore standard video feed after recording stops
    startCamera(selectedCameraId, resolution, fps);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-5xl mx-auto w-full flex flex-col items-center">
      {/* Top Header */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e252e] pb-5">
        <div>
          <h2 className="text-xl font-bold text-neutral-100 tracking-tight flex items-center gap-2.5">
            <Video className="w-5 h-5 text-[#e95420]" />
            <span>Studio Recorder</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Simultaneous optical video & stereo audio capture session.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={isRecording ? 'danger' : 'neutral'} size="md" dot={isRecording}>
            {isRecording ? `REC ${formatDuration(duration)}` : 'Standby'}
          </Badge>
        </div>
      </div>

      {/* Permission banner if blocked */}
      <PermissionBanner
        cameraDenied={hasPermission.camera === false}
        micDenied={hasPermission.microphone === false}
        onRequestPermissions={() => {
          requestInitialPermissions();
          startCamera();
          startMonitoring();
        }}
      />

      {/* Combined Viewfinder Container */}
      <div className="w-full relative aspect-video bg-[#07090c] rounded-2xl overflow-hidden border border-[#1e2530] shadow-2xl flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-contain ${mirror ? 'scale-x-[-1]' : ''} ${
            isCameraReady ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {!isCameraReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#090c10]">
            <CameraIcon className="w-10 h-10 text-neutral-600 mb-3" />
            <span className="text-sm font-semibold text-neutral-300">Viewfinder Offline</span>
            <span className="text-xs text-neutral-500 max-w-xs mt-1 mb-4">
              Connect or activate camera feed to preview before recording
            </span>
            <Button
              variant="primary"
              size="md"
              onClick={() => startCamera(selectedCameraId, resolution, fps)}
              leftIcon={<CameraIcon className="w-4 h-4" />}
            >
              Enable Preview
            </Button>
          </div>
        )}

        {/* Live Audio Level Overlay Bar on Top Right */}
        {isCameraReady && (
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
            <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
              <Mic className="w-3.5 h-3.5 text-emerald-400" />
              <div className="w-24 h-2 bg-[#18202b] rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-75"
                  style={{ width: `${Math.max(2, audioLevel.instantLevel)}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-neutral-300">
                {audioLevel.rmsDecibels} dB
              </span>
            </div>

            {actualResolution && (
              <span className="text-[11px] font-mono text-neutral-300 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                {formatResolution(actualResolution.width, actualResolution.height)} @ {fps}fps
              </span>
            )}
          </div>
        )}
      </div>

      {/* Center Recording Dashboard (Timer + Big Action Button) */}
      <div className="w-full flex flex-col items-center gap-6 py-2">
        {/* Large Timer */}
        <div className="flex items-center gap-3">
          <span
            className={`w-3.5 h-3.5 rounded-full ${
              isRecording ? 'bg-red-500 animate-ping' : 'bg-neutral-600'
            }`}
          />
          <span className="font-mono text-3xl sm:text-4xl font-bold tracking-widest text-neutral-100">
            {formatDuration(duration)}
          </span>
        </div>

        {/* Main Recording Button Controls */}
        <div className="flex items-center gap-4">
          {!isRecording ? (
            <Button
              variant="recording"
              size="lg"
              onClick={handleStartCombinedRecording}
              className="px-8 py-4 text-lg rounded-2xl shadow-xl shadow-red-950/50"
              leftIcon={<span className="w-4 h-4 rounded-full bg-white shadow-inner" />}
            >
              Start Recording
            </Button>
          ) : (
            <>
              {recStatus === 'paused' ? (
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={resumeRecording}
                  leftIcon={<Play className="w-5 h-5 text-emerald-400" />}
                >
                  Resume
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={pauseRecording}
                  leftIcon={<Pause className="w-5 h-5 text-amber-400" />}
                >
                  Pause
                </Button>
              )}

              <Button
                variant="danger"
                size="lg"
                onClick={handleStopRecording}
                leftIcon={<Square className="w-5 h-5" />}
                className="px-6 py-3.5 rounded-xl font-bold"
              >
                Stop & Save Recording
              </Button>
            </>
          )}
        </div>

        {/* Hardware Status Indicators */}
        <div className="flex items-center gap-8 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Camera</span>
            {isCameraReady ? (
              <span className="text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" /> Offline
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Microphone</span>
            {isAudioReady ? (
              <span className="text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" /> Offline
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Device Switcher Card */}
      <div className="w-full bg-[#11151a] border border-[#1e252e] rounded-xl p-4">
        <DeviceSelector
          cameras={videoInputs}
          microphones={audioInputs}
          selectedCameraId={selectedCameraId}
          selectedMicrophoneId={selectedMicrophoneId}
          onCameraChange={(id) => {
            setSelectedCameraId(id);
            startCamera(id, resolution, fps);
          }}
          onMicrophoneChange={(id) => {
            setSelectedMicrophoneId(id);
            startMonitoring(id);
          }}
          onRefresh={refreshDevices}
        />
      </div>

      {/* Playback Modal */}
      <MediaViewerModal
        item={lastRecordedItem}
        isOpen={Boolean(lastRecordedItem)}
        onClose={() => setLastRecordedItem(null)}
        onDelete={(id) => deleteRecording(id)}
      />
    </div>
  );
};
