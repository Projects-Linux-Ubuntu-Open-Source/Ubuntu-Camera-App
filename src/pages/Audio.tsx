import React, { useState, useEffect } from 'react';
import { Mic, RefreshCw, Volume2, HardDrive } from 'lucide-react';
import { useAudio } from '../hooks/useAudio';
import { useMediaDevices } from '../hooks/useMediaDevices';
import { useMediaRecorder } from '../hooks/useMediaRecorder';
import { useRecorderStore } from '../stores/recorderStore';
import { useAppStore } from '../stores/appStore';
import { AudioVisualizer } from '../components/audio/AudioVisualizer';
import { AudioRecorderControls } from '../components/audio/AudioRecorderControls';
import { DeviceSelector } from '../components/devices/DeviceSelector';
import { PermissionBanner } from '../components/devices/PermissionBanner';
import { RecordingCard } from '../components/recordings/RecordingCard';
import { MediaViewerModal } from '../components/recordings/MediaViewerModal';
import { RecordingItem } from '../types/recording';

export const Audio: React.FC = () => {
  const {
    status: audioStatus,
    errorMessage,
    selectedMicrophoneId,
    activeStream,
    audioLevel,
    frequencyData,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    setSelectedMicrophoneId,
  } = useAudio();

  const { audioInputs, hasPermission, requestInitialPermissions, refreshDevices } = useMediaDevices();
  const { status: recStatus, duration, startRecording, pauseRecording, resumeRecording, stopRecording } = useMediaRecorder();
  const { recordings, loadRecordings, deleteRecording } = useRecorderStore();
  const { addToast } = useAppStore();

  const [activePlaybackItem, setActivePlaybackItem] = useState<RecordingItem | null>(null);

  // Auto-start monitoring if idle on mount
  useEffect(() => {
    startMonitoring(selectedMicrophoneId);
    loadRecordings();
  }, []);

  const handleMicDeviceChange = (deviceId: string) => {
    setSelectedMicrophoneId(deviceId);
    if (isMonitoring) {
      startMonitoring(deviceId);
    }
  };

  const handleStartAudioRecording = async () => {
    if (!activeStream) {
      await startMonitoring(selectedMicrophoneId);
    }
    const currentStream = activeStream || (await navigator.mediaDevices.getUserMedia({ audio: true }));
    startRecording(currentStream, 'audio');
  };

  const handleStopAudioRecording = async () => {
    const saved = await stopRecording();
    if (saved) {
      setActivePlaybackItem(saved);
    }
  };

  const activeMicObj = audioInputs.find((a) => a.deviceId === selectedMicrophoneId) || audioInputs[0];
  const audioOnlyRecordings = recordings.filter((r) => r.type === 'audio');

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e252e] pb-5">
        <div>
          <h2 className="text-xl font-bold text-neutral-100 tracking-tight flex items-center gap-2.5">
            <Mic className="w-5 h-5 text-emerald-400" />
            <span>Audio Studio</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time acoustic analysis, frequency spectrum metering, and voice track recording.
          </p>
        </div>
      </div>

      {/* Permission banner if blocked */}
      <PermissionBanner
        micDenied={hasPermission.microphone === false || audioStatus === 'permission_denied'}
        onRequestPermissions={() => {
          requestInitialPermissions();
          startMonitoring();
        }}
      />

      {/* Device Selector */}
      <div className="bg-[#11151a] border border-[#1e252e] rounded-xl p-4">
        <DeviceSelector
          cameras={[]}
          microphones={audioInputs}
          selectedCameraId={null}
          selectedMicrophoneId={selectedMicrophoneId}
          onCameraChange={() => {}}
          onMicrophoneChange={handleMicDeviceChange}
          onRefresh={refreshDevices}
          showCamera={false}
        />
      </div>

      {/* Main Real-time Audio Visualizer & Decibel Meter */}
      <AudioVisualizer
        audioLevel={audioLevel}
        frequencyData={frequencyData}
        isMonitoring={isMonitoring}
        deviceName={activeMicObj?.label || 'Default Microphone'}
      />

      {/* Audio Recorder Controls */}
      <AudioRecorderControls
        isMonitoring={isMonitoring}
        onToggleMonitoring={() => {
          if (isMonitoring) stopMonitoring();
          else startMonitoring(selectedMicrophoneId);
        }}
        recordingStatus={recStatus}
        recordingDuration={duration}
        onStartRecording={handleStartAudioRecording}
        onPauseRecording={pauseRecording}
        onResumeRecording={resumeRecording}
        onStopRecording={handleStopAudioRecording}
      />

      {/* Audio Recordings Library Section */}
      {audioOnlyRecordings.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-[#1e252e]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-200">
              Recorded Audio Tracks ({audioOnlyRecordings.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {audioOnlyRecordings.map((item) => (
              <RecordingCard
                key={item.id}
                item={item}
                onPlay={(selected) => setActivePlaybackItem(selected)}
                onDelete={(id) => deleteRecording(id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Media Viewer Modal */}
      <MediaViewerModal
        item={activePlaybackItem}
        isOpen={Boolean(activePlaybackItem)}
        onClose={() => setActivePlaybackItem(null)}
        onDelete={(id) => deleteRecording(id)}
      />
    </div>
  );
};
