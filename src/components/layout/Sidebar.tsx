import React from 'react';
import {
  LayoutDashboard,
  Camera,
  Mic,
  Video,
  Film,
  Settings,
  Circle,
  HardDrive,
} from 'lucide-react';
import { useAppStore, AppPage } from '../../stores/appStore';
import { useRecorderStore } from '../../stores/recorderStore';
import { formatDuration } from '../../utils/formatters';

interface NavItem {
  id: AppPage;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
}

export const Sidebar: React.FC = () => {
  const { activePage, setActivePage } = useAppStore();
  const { status: recordingStatus, duration, recordings } = useRecorderStore();

  const isRecording = recordingStatus === 'recording' || recordingStatus === 'paused';

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'camera', label: 'Camera', icon: <Camera className="w-4 h-4" /> },
    { id: 'audio', label: 'Audio', icon: <Mic className="w-4 h-4" /> },
    { id: 'recorder', label: 'Recorder', icon: <Video className="w-4 h-4" /> },
    {
      id: 'recordings',
      label: 'Recordings',
      icon: <Film className="w-4 h-4" />,
      badge: recordings.length > 0 ? recordings.length : undefined,
    },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-60 bg-[#0d1015] border-r border-[#1a2029] flex flex-col justify-between select-none shrink-0 h-full">
      {/* Top Section: App Branding */}
      <div>
        <div className="p-4 border-b border-[#1a2029] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br from-[#e95420] to-[#c73e10] flex items-center justify-center shadow-md shadow-orange-950/40 text-white shrink-0">
            <img
              src="/icon.png"
              alt="Camera Recorder Icon"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
              Camera Recorder
            </h1>
            <span className="text-[11px] text-neutral-400 font-mono">Ubuntu Desktop</span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#1e2530] text-white font-semibold border-l-2 border-[#e95420] shadow-inner'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#141921]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-[#e95420]' : 'text-neutral-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-medium ${
                      isActive ? 'bg-[#e95420]/20 text-[#e95420]' : 'bg-[#1c222c] text-neutral-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Recording Indicator & System Status */}
      <div className="p-3 border-t border-[#1a2029] bg-[#090b0e] space-y-2">
        {isRecording && (
          <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs font-medium text-red-300">
                {recordingStatus === 'paused' ? 'Paused' : 'Recording'}
              </span>
            </div>
            <span className="font-mono text-xs text-red-200 font-bold tracking-wider">
              {formatDuration(duration)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs px-2 py-1 text-neutral-400">
          <div className="flex items-center gap-2">
            <Circle
              className={`w-2 h-2 fill-current ${
                isRecording
                  ? 'text-red-500 animate-pulse'
                  : 'text-emerald-500 fill-emerald-500'
              }`}
            />
            <span className="text-[11px] font-medium text-neutral-300">
              {isRecording ? 'Capturing Session' : 'System Ready'}
            </span>
          </div>
          <span className="text-[10px] text-neutral-500 font-mono">v1.0-web</span>
        </div>
      </div>
    </aside>
  );
};
