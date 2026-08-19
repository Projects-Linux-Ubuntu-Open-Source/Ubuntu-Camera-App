import React from 'react';
import { Download, Trash2, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { SnapshotData } from '../../types/camera';
import { downloadBlob } from '../../utils/mediaUtils';
import { formatFileSize, formatResolution } from '../../utils/formatters';

interface SnapshotModalProps {
  snapshot: SnapshotData | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveToLibrary?: (snapshot: SnapshotData) => void;
}

export const SnapshotModal: React.FC<SnapshotModalProps> = ({
  snapshot,
  isOpen,
  onClose,
  onSaveToLibrary,
}) => {
  if (!snapshot) return null;

  const handleDownload = () => {
    downloadBlob(snapshot.blob, snapshot.filename);
  };

  const handleSaveAndClose = () => {
    if (onSaveToLibrary) {
      onSaveToLibrary(snapshot);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-emerald-400" />
          <span>Captured Photo Preview</span>
        </div>
      }
      maxWidth="2xl"
      actions={
        <>
          <Button variant="ghost" size="md" onClick={onClose}>
            Discard
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={handleDownload}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Download PNG
          </Button>
          {onSaveToLibrary && (
            <Button
              variant="primary"
              size="md"
              onClick={handleSaveAndClose}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Save to Recordings
            </Button>
          )}
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Photo Container */}
        <div className="w-full max-h-[60vh] bg-black rounded-lg overflow-hidden border border-[#232b36] flex items-center justify-center">
          <img
            src={snapshot.dataUrl}
            alt="Captured snapshot"
            className="max-w-full max-h-[55vh] object-contain"
          />
        </div>

        {/* Metadata Details */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-[#161c24] p-3 rounded-lg border border-[#232b36]">
          <div>
            <span className="text-neutral-400">Filename: </span>
            <span className="text-neutral-200 font-mono">{snapshot.filename}</span>
          </div>
          <div>
            <span className="text-neutral-400">Dimensions: </span>
            <span className="text-neutral-200 font-mono">
              {formatResolution(snapshot.width, snapshot.height)}
            </span>
          </div>
          <div>
            <span className="text-neutral-400">Size: </span>
            <span className="text-neutral-200 font-mono">
              {formatFileSize(snapshot.blob.size)}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
