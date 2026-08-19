import React from 'react';
import { ShieldAlert, Video, Mic, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface PermissionBannerProps {
  cameraDenied?: boolean;
  micDenied?: boolean;
  onRequestPermissions: () => void;
}

export const PermissionBanner: React.FC<PermissionBannerProps> = ({
  cameraDenied,
  micDenied,
  onRequestPermissions,
}) => {
  if (!cameraDenied && !micDenied) return null;

  return (
    <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-200">
      <div className="flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <div className="text-sm font-semibold text-amber-100">
            Hardware Permission Needed
          </div>
          <div className="text-xs text-amber-300/80 mt-0.5 leading-relaxed">
            {cameraDenied && micDenied
              ? 'Camera and microphone permissions are currently blocked by your browser settings.'
              : cameraDenied
              ? 'Camera access is denied or blocked in browser settings.'
              : 'Microphone access is denied or blocked in browser settings.'}
            {' Please allow hardware access in your browser address bar.'}
          </div>
        </div>
      </div>
      <Button
        variant="primary"
        size="sm"
        onClick={onRequestPermissions}
        className="shrink-0"
      >
        Request Access
      </Button>
    </div>
  );
};
