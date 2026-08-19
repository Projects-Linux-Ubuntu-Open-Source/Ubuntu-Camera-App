import React, { useRef, useEffect } from 'react';
import { AudioLevelData } from '../../types/audio';
import { Volume2, VolumeX, Mic } from 'lucide-react';

interface AudioVisualizerProps {
  audioLevel: AudioLevelData;
  frequencyData: Uint8Array;
  isMonitoring: boolean;
  deviceName?: string;
  className?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  audioLevel,
  frequencyData,
  isMonitoring,
  deviceName,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Dynamic smooth drawing of frequency spectrum
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    if (!isMonitoring) {
      // Draw flat line
      ctx.fillStyle = '#1e2530';
      ctx.fillRect(0, height / 2 - 1, width, 2);
      return;
    }

    const barCount = frequencyData.length;
    const barWidth = (width / barCount) * 0.75;
    const gap = (width / barCount) * 0.25;

    for (let i = 0; i < barCount; i++) {
      const val = frequencyData[i] / 255;
      const barHeight = Math.max(4, val * height * 0.9);
      const x = i * (barWidth + gap) + gap / 2;
      const y = height - barHeight;

      // Color gradient based on frequency index / amplitude
      if (val > 0.8) {
        ctx.fillStyle = '#ef4444'; // Red
      } else if (val > 0.5) {
        ctx.fillStyle = '#f59e0b'; // Yellow
      } else {
        ctx.fillStyle = '#10b981'; // Green
      }

      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
      ctx.fill();
    }
  }, [frequencyData, isMonitoring]);

  // Determine LED segmented VU meter blocks (total 20 segments)
  const totalSegments = 24;
  const activeSegments = Math.round((audioLevel.instantLevel / 100) * totalSegments);
  const peakSegment = Math.round((audioLevel.peakLevel / 100) * totalSegments);

  return (
    <div className={`bg-[#11151a] border border-[#1e252e] rounded-xl p-5 flex flex-col gap-4 ${className}`}>
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isMonitoring ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-700/50' : 'bg-[#181f28] text-neutral-400'
            }`}
          >
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-neutral-100">
              {deviceName || 'Microphone Input'}
            </div>
            <div className="text-xs text-neutral-400">
              {isMonitoring ? 'Active Signal Monitoring' : 'Microphone Inactive'}
            </div>
          </div>
        </div>

        {/* Live Decibel Readout */}
        <div className="flex items-center gap-3">
          {audioLevel.isClipping && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-800 animate-pulse">
              CLIP
            </span>
          )}
          <div className="text-right font-mono">
            <div className="text-xs text-neutral-400">RMS Level</div>
            <div className={`text-sm font-bold ${isMonitoring ? 'text-emerald-400' : 'text-neutral-500'}`}>
              {isMonitoring ? `${audioLevel.rmsDecibels} dB` : '-∞ dB'}
            </div>
          </div>
        </div>
      </div>

      {/* Frequency Spectrum Canvas */}
      <div className="w-full h-24 bg-[#090c0f] rounded-lg border border-[#1a202a] p-2 flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          width={400}
          height={80}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Segmented VU Level Meter */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] text-neutral-500 font-mono px-0.5">
          <span>-60 dB</span>
          <span>-30 dB</span>
          <span>-12 dB</span>
          <span>-6 dB</span>
          <span className="text-red-400">0 dB</span>
        </div>

        <div className="grid grid-cols-24 gap-1 h-4 bg-[#090c0f] p-1 rounded-md border border-[#1a202a]">
          {Array.from({ length: totalSegments }).map((_, idx) => {
            const isFilled = idx < activeSegments;
            const isPeak = idx === peakSegment && isMonitoring;
            const isWarningZone = idx >= totalSegments * 0.7 && idx < totalSegments * 0.9;
            const isDangerZone = idx >= totalSegments * 0.9;

            let bgColor = 'bg-[#18202b]';
            if (isFilled || isPeak) {
              if (isDangerZone) bgColor = 'bg-red-500 shadow-sm shadow-red-500/50';
              else if (isWarningZone) bgColor = 'bg-amber-400 shadow-sm shadow-amber-400/50';
              else bgColor = 'bg-emerald-500 shadow-sm shadow-emerald-500/50';
            }

            return (
              <div
                key={idx}
                className={`h-full rounded-xs transition-colors duration-75 ${bgColor}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
