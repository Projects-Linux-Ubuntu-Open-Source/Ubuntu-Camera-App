import React from 'react';
import {
  Video,
  Mic,
  Image as ImageIcon,
  Play,
  Download,
  Trash2,
  Clock,
  HardDrive,
  Calendar,
} from 'lucide-react';
import { RecordingItem } from '../../types/recording';
import { formatDate, formatDuration, formatFileSize } from '../../utils/formatters';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { downloadBlob } from '../../utils/mediaUtils';

interface RecordingCardProps {
  item: RecordingItem;
  onPlay: (item: RecordingItem) => void;
  onDelete: (id: string) => void;
}

export const RecordingCard: React.FC<RecordingCardProps> = ({ item, onPlay, onDelete }) => {
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.blob) {
      downloadBlob(item.blob, item.name);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete "${item.name}"?`)) {
      onDelete(item.id);
    }
  };

  const typeIcons = {
    video: <Video className="w-4 h-4 text-blue-400" />,
    audio: <Mic className="w-4 h-4 text-emerald-400" />,
    photo: <ImageIcon className="w-4 h-4 text-amber-400" />,
  };

  const typeBadges = {
    video: <Badge variant="default" size="sm">Video</Badge>,
    audio: <Badge variant="success" size="sm">Audio</Badge>,
    photo: <Badge variant="warning" size="sm">Photo</Badge>,
  };

  return (
    <div
      onClick={() => onPlay(item)}
      className="group bg-[#11151a] hover:bg-[#141920] border border-[#1e252e] hover:border-[#2f3b4a] rounded-xl p-3.5 flex flex-col justify-between gap-3.5 transition-all duration-150 cursor-pointer shadow-md hover:shadow-xl"
    >
      {/* Top Media Preview / Icon Block */}
      <div className="relative w-full aspect-video bg-[#090b0e] rounded-lg overflow-hidden border border-[#1a202a] flex items-center justify-center">
        {item.type === 'photo' && item.previewUrl ? (
          <img
            src={item.previewUrl}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : item.type === 'video' && item.previewUrl ? (
          <div className="relative w-full h-full flex items-center justify-center bg-black/40">
            <video
              src={item.previewUrl}
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            />
            <div className="absolute w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white border border-white/20 group-hover:scale-110 group-hover:bg-[#e95420] transition-all">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-neutral-400">
            <div className="w-10 h-10 rounded-full bg-[#181f2a] flex items-center justify-center text-neutral-300">
              {typeIcons[item.type]}
            </div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">
              Audio Recording
            </span>
          </div>
        )}

        {/* Floating Duration pill */}
        {item.type !== 'photo' && item.duration > 0 && (
          <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-neutral-200 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-white/10">
            {formatDuration(item.duration)}
          </div>
        )}

        {/* Floating Type Pill */}
        <div className="absolute top-2 left-2">
          {typeBadges[item.type]}
        </div>
      </div>

      {/* Title & Metadata */}
      <div>
        <h4
          className="text-xs font-semibold text-neutral-200 truncate group-hover:text-white transition-colors"
          title={item.name}
        >
          {item.name}
        </h4>

        <div className="flex items-center gap-3 mt-2 text-[11px] text-neutral-400 font-mono">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-neutral-500" />
            <span>{formatDate(item.timestamp)}</span>
          </div>
          {item.size > 0 && (
            <div className="flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-neutral-500" />
              <span>{formatFileSize(item.size)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-[#1a202a] text-xs">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPlay(item)}
          leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
        >
          Open
        </Button>

        <div className="flex items-center gap-1">
          <button
            onClick={handleDownload}
            title="Download file"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#1f2632] transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            title="Delete recording"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
