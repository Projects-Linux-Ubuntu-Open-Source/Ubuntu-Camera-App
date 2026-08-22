import React from 'react';
import { Minus, Square, X, Video, Camera, Mic, Volume2 } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useCameraStore } from '../../stores/cameraStore';
import { useRecorderStore } from '../../stores/recorderStore';

interface WindowFrameProps {
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({ children }) => {
  const { activePage } = useAppStore();
  const { status: cameraStatus } = useCameraStore();
  const { status: recordingStatus } = useRecorderStore();

  const isRecording = recordingStatus === 'recording' || recordingStatus === 'paused';

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0b0d10] text-neutral-100 font-sans">
      {/* Ubuntu Style Desktop Titlebar */}
      <header className="h-9 bg-[#161a20] border-b border-[#222832] flex items-center justify-between px-3 select-none shrink-0 z-30">
        {/* Left: Window title & Activity indicator */}
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 rounded-sm overflow-hidden bg-[#e95420] flex items-center justify-center text-white shrink-0">
            <img
              src="/icon.png"
              alt="Icon"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <span className="text-xs font-semibold text-neutral-300 tracking-wide">
            Ubuntu Camera & Audio Recorder
          </span>
          <span className="text-[10px] text-neutral-500 font-mono hidden sm:inline">
            — {activePage.charAt(0).toUpperCase() + activePage.slice(1)}
          </span>
        </div>

        {/* Center: Live indicator badges */}
        <div className="flex items-center gap-2">
          {cameraStatus === 'running' && (
            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
              <Camera className="w-3 h-3" />
              <span>Camera Active</span>
            </div>
          )}

          {isRecording && (
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-800/50 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span>REC</span>
            </div>
          )}
        </div>

        {/* Right: Ubuntu Style Window Control Buttons */}
        <div className="flex items-center gap-2">
          <button
            title="Minimize"
            onClick={() => window.electronAPI?.window?.minimize()}
            className="w-5 h-5 rounded-full bg-[#2a303c] hover:bg-[#384152] flex items-center justify-center text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
          >
            <Minus className="w-2.5 h-2.5" />
          </button>
          <button
            title="Maximize"
            onClick={() => window.electronAPI?.window?.maximize()}
            className="w-5 h-5 rounded-full bg-[#2a303c] hover:bg-[#384152] flex items-center justify-center text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
          >
            <Square className="w-2 h-2" />
          </button>
          <button
            title="Close Application"
            onClick={() => {
              if (window.electronAPI?.window?.close) {
                window.electronAPI.window.close();
              }
            }}
            className="w-5 h-5 rounded-full bg-[#e95420]/80 hover:bg-[#e95420] flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </div>
      </header>

      {/* Main App Workspace */}
      <div className="flex flex-1 overflow-hidden">{children}</div>
    </div>
  );
};
