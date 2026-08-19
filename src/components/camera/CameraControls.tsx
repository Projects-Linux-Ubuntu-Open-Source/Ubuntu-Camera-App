import React from 'react';
import {
  Camera,
  Play,
  Square,
  FlipHorizontal,
  Grid,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { CameraResolution, COMMON_RESOLUTIONS, FPSOption, FPS_OPTIONS } from '../../types/camera';

interface CameraControlsProps {
  isRunning: boolean;
  onToggleStartStop: () => void;
  onTakeSnapshot: () => void;
  resolution: CameraResolution;
  onResolutionChange: (res: CameraResolution) => void;
  fps: FPSOption;
  onFpsChange: (fps: FPSOption) => void;
  mirror: boolean;
  onToggleMirror: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
}

export const CameraControls: React.FC<CameraControlsProps> = ({
  isRunning,
  onToggleStartStop,
  onTakeSnapshot,
  resolution,
  onResolutionChange,
  fps,
  onFpsChange,
  mirror,
  onToggleMirror,
  showGrid,
  onToggleGrid,
}) => {
  const resolutionOptions = COMMON_RESOLUTIONS.map((r) => ({
    value: `${r.width}x${r.height}`,
    label: r.label,
  }));

  const fpsOptions = FPS_OPTIONS.map((f) => ({
    value: f.toString(),
    label: `${f} FPS`,
  }));

  const currentResValue = `${resolution.width}x${resolution.height}`;

  return (
    <div className="bg-[#11151a] border border-[#1e252e] rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      {/* Primary Actions (Snapshot & Start/Stop) */}
      <div className="flex items-center gap-3">
        <Button
          variant={isRunning ? 'secondary' : 'primary'}
          size="lg"
          onClick={onToggleStartStop}
          leftIcon={isRunning ? <Square className="w-4 h-4 text-red-400" /> : <Play className="w-4 h-4" />}
        >
          {isRunning ? 'Stop Camera' : 'Start Camera'}
        </Button>

        <Button
          variant="primary"
          size="lg"
          onClick={onTakeSnapshot}
          disabled={!isRunning}
          leftIcon={<Camera className="w-4 h-4" />}
          className="bg-emerald-600 hover:bg-emerald-500 border-emerald-500/50"
        >
          Take Photo
        </Button>
      </div>

      {/* Camera Tuning Settings */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Resolution selector */}
        <div className="w-44">
          <Select
            value={currentResValue}
            options={resolutionOptions}
            onChange={(val) => {
              const found = COMMON_RESOLUTIONS.find((r) => `${r.width}x${r.height}` === val);
              if (found) onResolutionChange(found);
            }}
          />
        </div>

        {/* FPS selector */}
        <div className="w-28">
          <Select
            value={fps.toString()}
            options={fpsOptions}
            onChange={(val) => {
              const num = parseInt(val, 10) as FPSOption;
              if (num) onFpsChange(num);
            }}
          />
        </div>

        {/* Toggle buttons */}
        <div className="flex items-center gap-1.5 border-l border-[#232b36] pl-3">
          <button
            onClick={onToggleMirror}
            title={mirror ? 'Disable mirror preview' : 'Mirror preview horizontally'}
            className={`p-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              mirror
                ? 'bg-orange-950/50 border-orange-700/60 text-orange-300'
                : 'bg-[#161c24] border-[#232b36] text-neutral-400 hover:text-white'
            }`}
          >
            <FlipHorizontal className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleGrid}
            title={showGrid ? 'Hide grid overlay' : 'Show composition grid'}
            className={`p-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              showGrid
                ? 'bg-orange-950/50 border-orange-700/60 text-orange-300'
                : 'bg-[#161c24] border-[#232b36] text-neutral-400 hover:text-white'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
