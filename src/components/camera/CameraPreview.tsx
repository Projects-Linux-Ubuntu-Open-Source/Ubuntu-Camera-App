import React, { useState } from 'react';
import { Camera, AlertCircle, RefreshCw, Eye, EyeOff, Grid } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatResolution } from '../../utils/formatters';

interface CameraPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  status: 'idle' | 'starting' | 'running' | 'error' | 'permission_denied';
  errorMessage?: string | null;
  mirror?: boolean;
  showGrid?: boolean;
  actualResolution?: { width: number; height: number } | null;
  actualFps?: number | null;
  onStartCamera: () => void;
  onRetry?: () => void;
  cameraName?: string;
  flashTrigger?: number; // timestamp to trigger white flash
}

export const CameraPreview: React.FC<CameraPreviewProps> = ({
  videoRef,
  status,
  errorMessage,
  mirror = false,
  showGrid = false,
  actualResolution,
  actualFps,
  onStartCamera,
  onRetry,
  cameraName,
  flashTrigger,
}) => {
  return (
    <div className="relative w-full aspect-video bg-[#07090c] rounded-xl overflow-hidden border border-[#1e2530] flex items-center justify-center group shadow-2xl">
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-contain transition-transform duration-150 ${
          mirror ? 'scale-x-[-1]' : ''
        } ${status === 'running' ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Grid Overlay (Rule of Thirds) */}
      {showGrid && status === 'running' && (
        <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 z-10 opacity-30">
          <div className="border-r border-b border-white/50" />
          <div className="border-r border-b border-white/50" />
          <div className="border-b border-white/50" />
          <div className="border-r border-b border-white/50" />
          <div className="border-r border-b border-white/50" />
          <div className="border-b border-white/50" />
          <div className="border-r border-white/50" />
          <div className="border-r border-white/50" />
          <div />
        </div>
      )}

      {/* Camera Off / Idle State */}
      {status === 'idle' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#0e1217] to-[#07090c] z-10">
          <div className="w-14 h-14 rounded-2xl bg-[#181f2a] border border-[#263142] flex items-center justify-center text-neutral-400 mb-3.5 shadow-lg">
            <Camera className="w-7 h-7" />
          </div>
          <h4 className="text-base font-semibold text-neutral-200">Camera Standby</h4>
          <p className="text-xs text-neutral-400 max-w-xs mt-1 mb-4 leading-relaxed">
            Live preview is offline. Activate camera to start monitoring and capture media.
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={onStartCamera}
            leftIcon={<Camera className="w-4 h-4" />}
          >
            Start Camera
          </Button>
        </div>
      )}

      {/* Starting / Initializing State */}
      {status === 'starting' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#07090c]/90 z-10">
          <div className="w-10 h-10 border-3 border-[#e95420] border-t-transparent rounded-full animate-spin mb-3" />
          <div className="text-sm font-medium text-neutral-200">Initializing camera feed...</div>
          <div className="text-xs text-neutral-500 mt-1">Connecting to hardware device</div>
        </div>
      )}

      {/* Error or Permission Denied State */}
      {(status === 'error' || status === 'permission_denied') && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#150a0a] border border-red-900/40 z-10">
          <div className="w-12 h-12 rounded-xl bg-red-950/60 border border-red-800/60 flex items-center justify-center text-red-400 mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-red-200">
            {status === 'permission_denied' ? 'Camera Permission Denied' : 'Camera Error'}
          </h4>
          <p className="text-xs text-red-300/80 max-w-sm mt-1.5 mb-4 leading-relaxed">
            {errorMessage ||
              (status === 'permission_denied'
                ? 'Allow camera access in your browser address bar and reload or retry.'
                : 'Could not connect to camera. Check if another program is using it.')}
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={onRetry || onStartCamera}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Retry Connection
          </Button>
        </div>
      )}

      {/* Snapshot Flash Overlay */}
      {flashTrigger && flashTrigger > 0 && (
        <div
          key={flashTrigger}
          className="absolute inset-0 bg-white pointer-events-none z-30 animate-out fade-out duration-300"
        />
      )}

      {/* Telemetry HUD (Live Badges on Top of Video) */}
      {status === 'running' && (
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
          <div className="flex items-center gap-2">
            <Badge variant="success" size="sm" dot>
              LIVE
            </Badge>
            {cameraName && (
              <span className="text-[11px] font-mono text-neutral-300 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-white/10 truncate max-w-[200px]">
                {cameraName}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {actualResolution && (
              <span className="text-[11px] font-mono text-neutral-300 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-white/10">
                {formatResolution(actualResolution.width, actualResolution.height)}
              </span>
            )}
            {actualFps && (
              <span className="text-[11px] font-mono text-neutral-300 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-white/10">
                {actualFps} FPS
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
