import React from 'react';
import {
  Settings as SettingsIcon,
  Camera,
  Mic,
  Video,
  HardDrive,
  Cpu,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { useMediaDevices } from '../hooks/useMediaDevices';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { COMMON_RESOLUTIONS, FPS_OPTIONS, FPSOption } from '../types/camera';
import { getSupportedVideoMimeTypes, getSupportedAudioMimeTypes } from '../utils/mediaUtils';

export const Settings: React.FC = () => {
  const { settings, updateSettings, addToast } = useAppStore();
  const { videoInputs, audioInputs, refreshDevices } = useMediaDevices();

  const supportedVideoMimes = getSupportedVideoMimeTypes();
  const supportedAudioMimes = getSupportedAudioMimeTypes();

  const cameraOptions = videoInputs.map((c) => ({
    value: c.deviceId,
    label: c.label || 'Default Camera',
  }));

  const micOptions = audioInputs.map((m) => ({
    value: m.deviceId,
    label: m.label || 'Default Microphone',
  }));

  const resolutionOptions = COMMON_RESOLUTIONS.map((r) => ({
    value: `${r.width}x${r.height}`,
    label: r.label,
  }));

  const currentResValue = `${settings.defaultResolution.width}x${settings.defaultResolution.height}`;

  const handleSaveNotification = () => {
    addToast({
      title: 'Preferences Updated',
      message: 'Your settings have been saved.',
      type: 'success',
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-5xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e252e] pb-5">
        <div>
          <h2 className="text-xl font-bold text-neutral-100 tracking-tight flex items-center gap-2.5">
            <SettingsIcon className="w-5 h-5 text-neutral-400" />
            <span>Application Settings</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Configure hardware defaults, recording codecs, audio DSP filters, and storage targets.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={handleSaveNotification}>
          Save Changes
        </Button>
      </div>

      {/* Camera Settings */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#e95420]" />
            <span>Camera Configuration</span>
          </div>
        }
        subtitle="Default optical parameters and framing"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Select
            label="Default Camera Device"
            value={settings.defaultCameraId || (cameraOptions[0]?.value ?? '')}
            options={
              cameraOptions.length > 0
                ? cameraOptions
                : [{ value: '', label: 'System Default Camera' }]
            }
            onChange={(val) => updateSettings({ defaultCameraId: val })}
          />

          <Select
            label="Target Capture Resolution"
            value={currentResValue}
            options={resolutionOptions}
            onChange={(val) => {
              const res = COMMON_RESOLUTIONS.find((r) => `${r.width}x${r.height}` === val);
              if (res) updateSettings({ defaultResolution: res });
            }}
          />

          <Select
            label="Target Frame Rate (FPS)"
            value={settings.defaultFps.toString()}
            options={FPS_OPTIONS.map((f) => ({ value: f.toString(), label: `${f} FPS` }))}
            onChange={(val) => updateSettings({ defaultFps: parseInt(val, 10) as FPSOption })}
          />

          <div className="flex flex-col justify-end space-y-2">
            <label className="text-xs font-medium text-neutral-300">Viewfinder Options</label>
            <div className="flex items-center gap-6 pt-1">
              <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.mirrorCamera}
                  onChange={(e) => updateSettings({ mirrorCamera: e.target.checked })}
                  className="rounded border-[#232b36] bg-[#161c24] text-orange-500 focus:ring-orange-500"
                />
                <span>Mirror Horizontal Preview</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showGrid}
                  onChange={(e) => updateSettings({ showGrid: e.target.checked })}
                  className="rounded border-[#232b36] bg-[#161c24] text-orange-500 focus:ring-orange-500"
                />
                <span>Rule of Thirds Grid</span>
              </label>
            </div>
          </div>
        </div>
      </Card>

      {/* Audio Settings */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-emerald-400" />
            <span>Audio & Microphone Processing</span>
          </div>
        }
        subtitle="Signal routing and browser DSP acoustic enhancement filters"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Select
            label="Default Microphone Input"
            value={settings.defaultMicrophoneId || (micOptions[0]?.value ?? '')}
            options={
              micOptions.length > 0
                ? micOptions
                : [{ value: '', label: 'System Default Microphone' }]
            }
            onChange={(val) => updateSettings({ defaultMicrophoneId: val })}
          />

          <div className="flex flex-col justify-end space-y-2.5">
            <label className="text-xs font-medium text-neutral-300">Hardware Filters</label>
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.echoCancellation}
                  onChange={(e) => updateSettings({ echoCancellation: e.target.checked })}
                  className="rounded border-[#232b36] bg-[#161c24] text-emerald-500 focus:ring-emerald-500"
                />
                <span>Echo Cancellation</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.noiseSuppression}
                  onChange={(e) => updateSettings({ noiseSuppression: e.target.checked })}
                  className="rounded border-[#232b36] bg-[#161c24] text-emerald-500 focus:ring-emerald-500"
                />
                <span>Noise Suppression</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoGainControl}
                  onChange={(e) => updateSettings({ autoGainControl: e.target.checked })}
                  className="rounded border-[#232b36] bg-[#161c24] text-emerald-500 focus:ring-emerald-500"
                />
                <span>Auto Gain</span>
              </label>
            </div>
          </div>
        </div>
      </Card>

      {/* Recording Codecs & Formats */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-blue-400" />
            <span>Recording Format & Codecs</span>
          </div>
        }
        subtitle="Container formats and encoder configurations"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Select
            label="Video Container & Codec"
            value={settings.defaultVideoMimeType}
            options={
              supportedVideoMimes.length > 0
                ? supportedVideoMimes.map((m) => ({ value: m, label: m }))
                : [{ value: 'video/webm', label: 'video/webm (Default)' }]
            }
            onChange={(val) => updateSettings({ defaultVideoMimeType: val })}
          />

          <Select
            label="Audio Container & Codec"
            value={settings.defaultAudioMimeType}
            options={
              supportedAudioMimes.length > 0
                ? supportedAudioMimes.map((m) => ({ value: m, label: m }))
                : [{ value: 'audio/webm', label: 'audio/webm (Default)' }]
            }
            onChange={(val) => updateSettings({ defaultAudioMimeType: val })}
          />

          <Select
            label="Video Quality Preset"
            value={settings.videoQuality}
            options={[
              { value: 'ultra', label: 'Ultra Quality (8.0 Mbps)' },
              { value: 'high', label: 'High Quality (5.0 Mbps)' },
              { value: 'medium', label: 'Medium Quality (2.5 Mbps)' },
              { value: 'low', label: 'Compact / Low Bandwidth (1.0 Mbps)' },
            ]}
            onChange={(val) => updateSettings({ videoQuality: val as any })}
          />

          <Select
            label="Audio Quality Preset"
            value={settings.audioQuality}
            options={[
              { value: 'high', label: 'High Fidelity (192 kbps)' },
              { value: 'medium', label: 'Standard (128 kbps)' },
              { value: 'voice', label: 'Voice Optimized (64 kbps)' },
            ]}
            onChange={(val) => updateSettings({ audioQuality: val as any })}
          />
        </div>
      </Card>

      {/* Storage & Architecture Roadmap (Phase 1 vs Phase 2) */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-purple-400" />
            <span>Storage & Desktop Runtime</span>
          </div>
        }
        subtitle="Storage layer abstraction and native filesystem architecture"
      >
        <div className="p-4 rounded-xl bg-[#090c10] border border-[#1e252e] space-y-3 text-xs">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-neutral-200">Browser mode</div>
              <p className="text-neutral-400 mt-0.5 leading-relaxed">
                Electron desktop storage will be available in a future version. Currently, all
                captured photos, audio recordings, and videos are safely stored in browser
                IndexedDB storage and can be exported at any time with one click.
              </p>
            </div>
          </div>

          <div className="border-t border-[#1a202a] pt-3 text-neutral-400 flex items-center justify-between">
            <span className="font-mono">Storage Abstraction Engine: Active (RecordingStorage)</span>
            <span className="text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Phase 1 Ready
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
