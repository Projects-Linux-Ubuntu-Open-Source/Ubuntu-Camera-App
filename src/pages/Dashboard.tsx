import React, { useEffect, useRef } from 'react';
import {
  Camera,
  Mic,
  Video,
  Film,
  Play,
  ArrowRight,
  ShieldCheck,
  HardDrive,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { useCameraStore } from '../stores/cameraStore';
import { useRecorderStore } from '../stores/recorderStore';
import { useMediaDevices } from '../hooks/useMediaDevices';
import { useCamera } from '../hooks/useCamera';
import { useAudio } from '../hooks/useAudio';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatResolution, formatFileSize, formatDuration, formatDate } from '../utils/formatters';
import { PermissionBanner } from '../components/devices/PermissionBanner';

export const Dashboard: React.FC = () => {
  const { setActivePage } = useAppStore();
  const { videoInputs, audioInputs, hasPermission, requestInitialPermissions, refreshDevices } = useMediaDevices();
  const { videoRef, status: cameraStatus, startCamera, stopCamera, actualResolution, actualFps } = useCamera();
  const { isMonitoring, audioLevel, startMonitoring, stopMonitoring } = useAudio();
  const { recordings, loadRecordings, storageUsage } = useRecorderStore();

  useEffect(() => {
    loadRecordings();
  }, [loadRecordings]);

  const activeCameraLabel =
    videoInputs.find((v) => !v.label.startsWith('Camera '))?.label ||
    videoInputs[0]?.label ||
    'Integrated Webcam';

  const activeMicLabel =
    audioInputs.find((a) => !a.label.startsWith('Microphone '))?.label ||
    audioInputs[0]?.label ||
    'Built-in Microphone';

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e252e] pb-5">
        <div>
          <h2 className="text-xl font-bold text-neutral-100 tracking-tight">Studio Dashboard</h2>
          <p className="text-xs text-neutral-400 mt-1">
            System overview, hardware devices, and quick recording actions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="neutral" size="md">
            Ubuntu Desktop Shell
          </Badge>
          <Badge variant="success" size="md" dot>
            System Online
          </Badge>
        </div>
      </div>

      {/* Permission banner if blocked */}
      <PermissionBanner
        cameraDenied={hasPermission.camera === false}
        micDenied={hasPermission.microphone === false}
        onRequestPermissions={requestInitialPermissions}
      />

      {/* Main 2-Column Hardware Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Camera Preview Card */}
        <Card
          title="Camera"
          subtitle="Real-time optical feed"
          action={
            <Button
              variant={cameraStatus === 'running' ? 'secondary' : 'primary'}
              size="sm"
              onClick={() => {
                if (cameraStatus === 'running') stopCamera();
                else startCamera();
              }}
              leftIcon={<Camera className="w-3.5 h-3.5" />}
            >
              {cameraStatus === 'running' ? 'Deactivate' : 'Activate Live'}
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="relative aspect-video bg-[#07090c] rounded-lg overflow-hidden border border-[#1e252e] flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-contain ${
                  cameraStatus === 'running' ? 'opacity-100' : 'opacity-0'
                }`}
              />

              {cameraStatus !== 'running' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-[#090c10]">
                  <Camera className="w-8 h-8 text-neutral-600 mb-2" />
                  <span className="text-xs font-medium text-neutral-400">
                    Live camera preview is offline
                  </span>
                  <span className="text-[11px] text-neutral-600 mt-0.5">
                    Click Activate to verify lens and resolution
                  </span>
                </div>
              )}

              {cameraStatus === 'running' && (
                <div className="absolute top-2 left-2">
                  <Badge variant="success" size="sm" dot>
                    STREAM ACTIVE
                  </Badge>
                </div>
              )}
            </div>

            {/* Camera Metadata Details */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[#0e1217] p-3 rounded-lg border border-[#1c222b]">
              <div>
                <span className="text-neutral-500 block text-[10px] uppercase">Camera</span>
                <span className="text-neutral-200 truncate block mt-0.5" title={activeCameraLabel}>
                  {activeCameraLabel}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px] uppercase">Resolution</span>
                <span className="text-neutral-200 block mt-0.5">
                  {actualResolution
                    ? formatResolution(actualResolution.width, actualResolution.height)
                    : '1920 × 1080 (Target)'}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px] uppercase">Frame Rate</span>
                <span className="text-neutral-200 block mt-0.5">
                  {actualFps ? `${actualFps} FPS` : '30 FPS (Target)'}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px] uppercase">Status</span>
                <span
                  className={`block mt-0.5 font-sans font-medium ${
                    cameraStatus === 'running' ? 'text-emerald-400' : 'text-neutral-400'
                  }`}
                >
                  {cameraStatus === 'running' ? 'Ready & Active' : 'Standby'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Microphone Audio Card */}
        <Card
          title="Microphone"
          subtitle="Signal amplitude & dynamic VU levels"
          action={
            <Button
              variant={isMonitoring ? 'secondary' : 'primary'}
              size="sm"
              onClick={() => {
                if (isMonitoring) stopMonitoring();
                else startMonitoring();
              }}
              leftIcon={<Mic className="w-3.5 h-3.5" />}
            >
              {isMonitoring ? 'Mute Monitor' : 'Listen Signal'}
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="p-4 bg-[#090c10] rounded-lg border border-[#1e252e] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-neutral-200 truncate max-w-xs">
                    {activeMicLabel}
                  </span>
                </div>
                <span className="text-xs font-mono text-neutral-400">
                  {isMonitoring ? `${audioLevel.rmsDecibels} dB` : '-∞ dB'}
                </span>
              </div>

              {/* Progress Level Bar */}
              <div>
                <div className="flex justify-between text-[10px] text-neutral-500 font-mono mb-1">
                  <span>Input level</span>
                  {audioLevel.isClipping && <span className="text-red-400 font-bold">PEAK</span>}
                </div>
                <div className="h-3 w-full bg-[#161c24] rounded-full overflow-hidden p-0.5 border border-[#232b36]">
                  <div
                    className={`h-full rounded-full transition-all duration-75 ${
                      audioLevel.isClipping
                        ? 'bg-red-500'
                        : audioLevel.instantLevel > 70
                        ? 'bg-amber-400'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${isMonitoring ? Math.max(3, audioLevel.instantLevel) : 0}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
                <span>Echo Cancellation: Active</span>
                <span>Noise Suppression: Active</span>
              </div>
            </div>

            {/* Audio Metadata Details */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[#0e1217] p-3 rounded-lg border border-[#1c222b]">
              <div>
                <span className="text-neutral-500 block text-[10px] uppercase">Device</span>
                <span className="text-neutral-200 truncate block mt-0.5" title={activeMicLabel}>
                  {activeMicLabel}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px] uppercase">Input Stream</span>
                <span className="text-neutral-200 block mt-0.5">48 kHz Stereo</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px] uppercase">Monitoring</span>
                <span
                  className={`block mt-0.5 font-sans font-medium ${
                    isMonitoring ? 'text-emerald-400' : 'text-neutral-400'
                  }`}
                >
                  {isMonitoring ? 'Monitoring Active' : 'Idle'}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px] uppercase">Status</span>
                <span className="text-emerald-400 block mt-0.5 font-sans font-medium">Ready</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions Panel */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-200 mb-3 tracking-wide">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <button
            onClick={() => setActivePage('camera')}
            className="flex items-center justify-between p-4 rounded-xl bg-[#11151a] hover:bg-[#161c24] border border-[#1e252e] hover:border-[#2f3b4a] transition-all group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-700/50 flex items-center justify-center text-emerald-400">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-neutral-100 group-hover:text-white">
                  Take Photo
                </div>
                <div className="text-[11px] text-neutral-400">Still image capture</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-neutral-200 group-hover:translate-x-0.5 transition-all" />
          </button>

          <button
            onClick={() => setActivePage('recorder')}
            className="flex items-center justify-between p-4 rounded-xl bg-[#11151a] hover:bg-[#161c24] border border-[#1e252e] hover:border-[#2f3b4a] transition-all group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-950/60 border border-red-700/50 flex items-center justify-center text-red-400">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-neutral-100 group-hover:text-white">
                  Start Recording
                </div>
                <div className="text-[11px] text-neutral-400">Video + Audio combined</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-neutral-200 group-hover:translate-x-0.5 transition-all" />
          </button>

          <button
            onClick={() => setActivePage('audio')}
            className="flex items-center justify-between p-4 rounded-xl bg-[#11151a] hover:bg-[#161c24] border border-[#1e252e] hover:border-[#2f3b4a] transition-all group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-950/60 border border-amber-700/50 flex items-center justify-center text-amber-400">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-neutral-100 group-hover:text-white">
                  Audio Recording
                </div>
                <div className="text-[11px] text-neutral-400">High fidelity voice tracks</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-neutral-200 group-hover:translate-x-0.5 transition-all" />
          </button>

          <button
            onClick={() => setActivePage('recordings')}
            className="flex items-center justify-between p-4 rounded-xl bg-[#11151a] hover:bg-[#161c24] border border-[#1e252e] hover:border-[#2f3b4a] transition-all group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-950/60 border border-purple-700/50 flex items-center justify-center text-purple-400">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-neutral-100 group-hover:text-white">
                  Open Recordings
                </div>
                <div className="text-[11px] text-neutral-400">
                  {recordings.length} files saved ({formatFileSize(storageUsage.usedBytes)})
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-neutral-200 group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>
      </div>

      {/* Recent Recordings Mini Strip */}
      {recordings.length > 0 && (
        <Card
          title="Recent Media Captures"
          subtitle="Quick access to latest recorded media"
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActivePage('recordings')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              View All ({recordings.length})
            </Button>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recordings.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => setActivePage('recordings')}
                className="p-3 bg-[#0d1015] hover:bg-[#151a22] rounded-lg border border-[#1e252e] flex items-center gap-3 cursor-pointer transition-colors"
              >
                <div className="w-10 h-10 rounded-md bg-[#181f2a] flex items-center justify-center shrink-0">
                  {item.type === 'video' ? (
                    <Video className="w-4 h-4 text-blue-400" />
                  ) : item.type === 'audio' ? (
                    <Mic className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Camera className="w-4 h-4 text-amber-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-neutral-200 truncate">{item.name}</div>
                  <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                    {formatDate(item.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
