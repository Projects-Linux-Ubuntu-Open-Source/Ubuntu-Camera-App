import React from 'react';
import { formatDuration } from '../../utils/formatters';
import { RecordingStatus } from '../../types/recording';

interface RecordingIndicatorProps {
  status: RecordingStatus;
  duration: number;
  quality?: string;
  fps?: number;
}

export const RecordingIndicator: React.FC<RecordingIndicatorProps> = ({
  status,
  duration,
  quality,
  fps,
}) => {
  const isRecording = status === 'recording' || status === 'paused';

  if (!isRecording) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-black/80 backdrop-blur-md border border-red-500/40 shadow-xl text-white">
      {/* Blinking red dot */}
      <div className="flex items-center gap-2">
        <span
          className={`w-3 h-3 rounded-full bg-red-500 ${
            status === 'recording' ? 'animate-ping' : 'opacity-60'
          }`}
        />
        <span className="text-xs font-bold uppercase tracking-wider text-red-300">
          {status === 'paused' ? 'PAUSED' : 'REC'}
        </span>
      </div>

      {/* Timer */}
      <span className="font-mono text-base font-bold tracking-widest text-neutral-100">
        {formatDuration(duration)}
      </span>

      {/* Metadata tags */}
      {(quality || fps) && (
        <div className="hidden sm:flex items-center gap-1.5 border-l border-white/20 pl-3 text-[11px] font-mono text-neutral-400">
          {quality && <span>{quality}</span>}
          {fps && <span>{fps}fps</span>}
        </div>
      )}
    </div>
  );
};
