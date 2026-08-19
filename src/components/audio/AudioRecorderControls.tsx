import React from 'react';
import { Mic, Square, Play, Pause, Download, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';
import { RecordingStatus } from '../../types/recording';
import { formatDuration } from '../../utils/formatters';

interface AudioRecorderControlsProps {
  isMonitoring: boolean;
  onToggleMonitoring: () => void;
  recordingStatus: RecordingStatus;
  recordingDuration: number;
  onStartRecording: () => void;
  onPauseRecording: () => void;
  onResumeRecording: () => void;
  onStopRecording: () => void;
}

export const AudioRecorderControls: React.FC<AudioRecorderControlsProps> = ({
  isMonitoring,
  onToggleMonitoring,
  recordingStatus,
  recordingDuration,
  onStartRecording,
  onPauseRecording,
  onResumeRecording,
  onStopRecording,
}) => {
  const isRecording = recordingStatus === 'recording' || recordingStatus === 'paused';

  return (
    <div className="bg-[#11151a] border border-[#1e252e] rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Monitoring & Signal control */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <Button
          variant={isMonitoring ? 'secondary' : 'primary'}
          size="md"
          onClick={onToggleMonitoring}
          leftIcon={<Mic className="w-4 h-4" />}
          disabled={isRecording}
        >
          {isMonitoring ? 'Stop Monitor' : 'Start Monitor'}
        </Button>
      </div>

      {/* Recording Duration Timer */}
      {isRecording && (
        <div className="flex items-center gap-3 bg-[#0d1015] px-4 py-2 rounded-lg border border-[#232b36]">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          <span className="font-mono text-base font-bold text-white tracking-widest">
            {formatDuration(recordingDuration)}
          </span>
          <span className="text-xs text-neutral-400 uppercase font-medium">
            {recordingStatus}
          </span>
        </div>
      )}

      {/* Record / Pause / Stop Controls */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        {!isRecording ? (
          <Button
            variant="recording"
            size="lg"
            onClick={onStartRecording}
            leftIcon={<span className="w-3 h-3 rounded-full bg-white" />}
          >
            Record Audio
          </Button>
        ) : (
          <>
            {recordingStatus === 'paused' ? (
              <Button
                variant="secondary"
                size="md"
                onClick={onResumeRecording}
                leftIcon={<Play className="w-4 h-4 text-emerald-400" />}
              >
                Resume
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="md"
                onClick={onPauseRecording}
                leftIcon={<Pause className="w-4 h-4 text-amber-400" />}
              >
                Pause
              </Button>
            )}

            <Button
              variant="danger"
              size="md"
              onClick={onStopRecording}
              leftIcon={<Square className="w-4 h-4" />}
            >
              Stop & Save
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
