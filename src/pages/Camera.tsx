import React, { useState, useEffect } from 'react';
import { Camera as CameraIcon, RefreshCw, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useCamera } from '../hooks/useCamera';
import { useMediaDevices } from '../hooks/useMediaDevices';
import { useRecorderStore } from '../stores/recorderStore';
import { useAppStore } from '../stores/appStore';
import { CameraPreview } from '../components/camera/CameraPreview';
import { CameraControls } from '../components/camera/CameraControls';
import { SnapshotModal } from '../components/camera/SnapshotModal';
import { DeviceSelector } from '../components/devices/DeviceSelector';
import { PermissionBanner } from '../components/devices/PermissionBanner';
import { SnapshotData } from '../types/camera';
import { PlatformBridge } from '../services/platform/platformBridge';

export const Camera: React.FC = () => {
  const {
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
    startCamera,
    stopCamera,
    takeSnapshot,
    setSelectedCameraId,
    setResolution,
    setFps,
    setMirror,
    setShowGrid,
    setLastSnapshot,
  } = useCamera();

  const { videoInputs, hasPermission, requestInitialPermissions, refreshDevices } = useMediaDevices();
  const { loadRecordings } = useRecorderStore();
  const { addToast } = useAppStore();

  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);
  const [flashKey, setFlashKey] = useState<number>(0);

  // Auto-start camera if idle on mount
  useEffect(() => {
    if (status === 'idle') {
      startCamera(selectedCameraId, resolution, fps);
    }
  }, []);

  const handleCameraDeviceChange = (deviceId: string) => {
    setSelectedCameraId(deviceId);
    startCamera(deviceId, resolution, fps);
  };

  const handleSnapshot = async () => {
    setFlashKey(Date.now());
    const snapshot = await takeSnapshot();
    if (snapshot) {
      setIsSnapshotModalOpen(true);
      addToast({
        title: 'Snapshot Captured',
        message: `${snapshot.width}×${snapshot.height} image ready`,
        type: 'success',
      });
    }
  };

  const handleSaveToLibrary = async (snapshot: SnapshotData) => {
    try {
      await PlatformBridge.saveRecording({
        name: snapshot.filename,
        type: 'photo',
        duration: 0,
        size: snapshot.blob.size,
        mimeType: 'image/png',
        blob: snapshot.blob,
        metadata: {
          resolution: { width: snapshot.width, height: snapshot.height },
          mimeType: 'image/png',
        },
      });
      await loadRecordings();
      addToast({
        title: 'Saved to Library',
        message: `${snapshot.filename} added to Recordings`,
        type: 'success',
      });
    } catch (err) {
      console.error('Failed to save snapshot to library:', err);
    }
  };

  const activeCameraObj = videoInputs.find((v) => v.deviceId === selectedCameraId) || videoInputs[0];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e252e] pb-5">
        <div>
          <h2 className="text-xl font-bold text-neutral-100 tracking-tight flex items-center gap-2.5">
            <CameraIcon className="w-5 h-5 text-[#e95420]" />
            <span>Camera Studio</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time optical viewfinder, still photo capture, and stream tuning.
          </p>
        </div>
      </div>

      {/* Permission banner if blocked */}
      <PermissionBanner
        cameraDenied={hasPermission.camera === false || status === 'permission_denied'}
        onRequestPermissions={() => {
          requestInitialPermissions();
          startCamera();
        }}
      />

      {/* Camera Selection Device Bar */}
      <div className="bg-[#11151a] border border-[#1e252e] rounded-xl p-4">
        <DeviceSelector
          cameras={videoInputs}
          microphones={[]}
          selectedCameraId={selectedCameraId}
          selectedMicrophoneId={null}
          onCameraChange={handleCameraDeviceChange}
          onMicrophoneChange={() => {}}
          onRefresh={refreshDevices}
          showMicrophone={false}
        />
      </div>

      {/* Main Viewfinder Area */}
      <div className="w-full">
        <CameraPreview
          videoRef={videoRef}
          status={status}
          errorMessage={errorMessage}
          mirror={mirror}
          showGrid={showGrid}
          actualResolution={actualResolution}
          actualFps={actualFps}
          onStartCamera={() => startCamera(selectedCameraId, resolution, fps)}
          onRetry={() => startCamera(selectedCameraId, resolution, fps)}
          cameraName={activeCameraObj?.label}
          flashTrigger={flashKey}
        />
      </div>

      {/* Camera Control Bar */}
      <CameraControls
        isRunning={status === 'running'}
        onToggleStartStop={() => {
          if (status === 'running') stopCamera();
          else startCamera(selectedCameraId, resolution, fps);
        }}
        onTakeSnapshot={handleSnapshot}
        resolution={resolution}
        onResolutionChange={(newRes) => {
          setResolution(newRes);
          if (status === 'running') startCamera(selectedCameraId, newRes, fps);
        }}
        fps={fps}
        onFpsChange={(newFps) => {
          setFps(newFps);
          if (status === 'running') startCamera(selectedCameraId, resolution, newFps);
        }}
        mirror={mirror}
        onToggleMirror={() => setMirror(!mirror)}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
      />

      {/* Snapshot Preview & Save Modal */}
      <SnapshotModal
        snapshot={lastSnapshot}
        isOpen={isSnapshotModalOpen}
        onClose={() => setIsSnapshotModalOpen(false)}
        onSaveToLibrary={handleSaveToLibrary}
      />
    </div>
  );
};
