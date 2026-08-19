import React from 'react';
import { Camera, Mic, RefreshCw, AlertCircle } from 'lucide-react';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { MediaDeviceInfoItem } from '../../types/device';

interface DeviceSelectorProps {
  cameras: MediaDeviceInfoItem[];
  microphones: MediaDeviceInfoItem[];
  selectedCameraId: string | null;
  selectedMicrophoneId: string | null;
  onCameraChange: (deviceId: string) => void;
  onMicrophoneChange: (deviceId: string) => void;
  onRefresh: () => void;
  showMicrophone?: boolean;
  showCamera?: boolean;
}

export const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  cameras,
  microphones,
  selectedCameraId,
  selectedMicrophoneId,
  onCameraChange,
  onMicrophoneChange,
  onRefresh,
  showMicrophone = true,
  showCamera = true,
}) => {
  const cameraOptions = cameras.map((c) => ({
    value: c.deviceId,
    label: c.label || 'Default Camera',
  }));

  const micOptions = microphones.map((m) => ({
    value: m.deviceId,
    label: m.label || 'Default Microphone',
  }));

  return (
    <div className="flex flex-wrap items-center gap-3 w-full">
      {showCamera && (
        <div className="flex-1 min-w-[200px]">
          <Select
            label="Video Input"
            icon={<Camera className="w-4 h-4" />}
            value={selectedCameraId || (cameraOptions[0]?.value ?? '')}
            options={
              cameraOptions.length > 0
                ? cameraOptions
                : [{ value: '', label: 'No Camera Detected', disabled: true }]
            }
            onChange={onCameraChange}
            disabled={cameraOptions.length === 0}
          />
        </div>
      )}

      {showMicrophone && (
        <div className="flex-1 min-w-[200px]">
          <Select
            label="Audio Input"
            icon={<Mic className="w-4 h-4" />}
            value={selectedMicrophoneId || (micOptions[0]?.value ?? '')}
            options={
              micOptions.length > 0
                ? micOptions
                : [{ value: '', label: 'No Microphone Detected', disabled: true }]
            }
            onChange={onMicrophoneChange}
            disabled={micOptions.length === 0}
          />
        </div>
      )}

      <div className="flex items-end pb-0.5">
        <Button
          variant="secondary"
          size="md"
          onClick={onRefresh}
          title="Refresh hardware devices"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Rescan
        </Button>
      </div>
    </div>
  );
};
