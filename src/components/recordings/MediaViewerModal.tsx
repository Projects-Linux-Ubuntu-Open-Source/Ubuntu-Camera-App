import React, { useState } from 'react';
import { Download, Trash2, Video, Mic, Image as ImageIcon, Info, FolderOpen } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ConfirmModal } from '../ui/ConfirmModal';
import { RecordingItem } from '../../types/recording';
import { formatDate, formatDuration, formatFileSize } from '../../utils/formatters';
import { downloadBlob } from '../../utils/mediaUtils';
import { PlatformBridge } from '../../services/platform/platformBridge';
import { isElectron } from '../../utils/environment';

interface MediaViewerModalProps {
  item: RecordingItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({
  item,
  isOpen,
  onClose,
  onDelete,
}) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  if (!item) return null;

  const handleDownload = () => {
    if (item.blob) {
      downloadBlob(item.blob, item.name);
    }
  };

  const handleShowInFolder = () => {
    if (item.filePath) {
      PlatformBridge.showInFolder(item.filePath);
    }
  };

  const handleConfirmDelete = () => {
    onDelete(item.id);
    setIsConfirmOpen(false);
    onClose();
  };

  const titleIcons = {
    video: <Video className="w-4 h-4 text-blue-400" />,
    audio: <Mic className="w-4 h-4 text-emerald-400" />,
    photo: <ImageIcon className="w-4 h-4 text-amber-400" />,
  };

  const isDesktop = isElectron();

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        maxWidth="4xl"
        title={
          <div className="flex items-center gap-2">
            {titleIcons[item.type]}
            <span className="truncate max-w-md">{item.name}</span>
          </div>
        }
        actions={
          <>
            <Button
              variant="danger"
              size="md"
              onClick={() => setIsConfirmOpen(true)}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Delete
            </Button>
            {isDesktop && item.filePath && (
              <Button
                variant="secondary"
                size="md"
                onClick={handleShowInFolder}
                leftIcon={<FolderOpen className="w-4 h-4" />}
              >
                Show in Folder
              </Button>
            )}
            <Button
              variant="primary"
              size="md"
              onClick={handleDownload}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Download
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {/* Media Player Area */}
          <div className="w-full min-h-[300px] max-h-[65vh] bg-black rounded-xl overflow-hidden border border-[#232b36] flex items-center justify-center">
            {item.type === 'video' && item.previewUrl ? (
              <video
                src={item.previewUrl}
                controls
                autoPlay
                className="w-full max-h-[60vh] object-contain"
              />
            ) : item.type === 'audio' && item.previewUrl ? (
              <div className="w-full p-8 flex flex-col items-center justify-center gap-6 bg-gradient-to-b from-[#11161f] to-[#0a0d12]">
                <div className="w-20 h-20 rounded-full bg-emerald-950/60 border border-emerald-700/50 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-950/40">
                  <Mic className="w-10 h-10" />
                </div>
                <audio src={item.previewUrl} controls className="w-full max-w-md" />
              </div>
            ) : item.type === 'photo' && item.previewUrl ? (
              <img
                src={item.previewUrl}
                alt={item.name}
                className="w-full max-h-[60vh] object-contain"
              />
            ) : (
              <div className="p-8 text-neutral-400">Media source unavailable</div>
            )}
          </div>

          {/* Technical Metadata Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#161c24] p-3.5 rounded-xl border border-[#232b36]">
            <div>
              <span className="text-neutral-400 block text-[10px] uppercase font-bold tracking-wider">
                Recorded On
              </span>
              <span className="text-neutral-200 font-mono mt-0.5 block">{formatDate(item.timestamp)}</span>
            </div>

            <div>
              <span className="text-neutral-400 block text-[10px] uppercase font-bold tracking-wider">
                Duration
              </span>
              <span className="text-neutral-200 font-mono mt-0.5 block">
                {item.type === 'photo' ? 'N/A' : formatDuration(item.duration)}
              </span>
            </div>

            <div>
              <span className="text-neutral-400 block text-[10px] uppercase font-bold tracking-wider">
                File Size
              </span>
              <span className="text-neutral-200 font-mono mt-0.5 block">{formatFileSize(item.size)}</span>
            </div>

            <div>
              <span className="text-neutral-400 block text-[10px] uppercase font-bold tracking-wider">
                Format / MIME
              </span>
              <span className="text-neutral-200 font-mono mt-0.5 block truncate" title={item.mimeType}>
                {item.mimeType}
              </span>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Delete Recording"
        message={`Are you sure you want to delete "${item.name}"? This file will be permanently removed.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onClose={() => setIsConfirmOpen(false)}
      />
    </>
  );
};
