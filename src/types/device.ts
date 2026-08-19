export type DeviceKind = 'videoinput' | 'audioinput' | 'audiooutput';

export interface MediaDeviceInfoItem {
  deviceId: string;
  label: string;
  kind: DeviceKind;
  groupId?: string;
}

export interface DeviceListState {
  videoInputs: MediaDeviceInfoItem[];
  audioInputs: MediaDeviceInfoItem[];
  audioOutputs: MediaDeviceInfoItem[];
  selectedCameraId: string | null;
  selectedMicrophoneId: string | null;
  selectedAudioOutputId: string | null;
  isLoading: boolean;
  permissionGranted: {
    camera: boolean | null; // null = prompt/unknown, true = granted, false = denied
    microphone: boolean | null;
  };
  error: string | null;
}
