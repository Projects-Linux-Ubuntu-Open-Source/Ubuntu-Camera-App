import React, { useState, useEffect } from 'react';
import {
  Film,
  Trash2,
  HardDrive,
  Search,
  CheckSquare,
  Square,
  X,
  Check,
} from 'lucide-react';
import { useRecorderStore } from '../stores/recorderStore';
import { RecordingCard } from '../components/recordings/RecordingCard';
import { MediaViewerModal } from '../components/recordings/MediaViewerModal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Button } from '../components/ui/Button';
import { RecordingItem } from '../types/recording';
import { formatFileSize } from '../utils/formatters';

type FilterType = 'all' | 'video' | 'audio' | 'photo';

export const Recordings: React.FC = () => {
  const {
    recordings,
    loadRecordings,
    deleteRecording,
    deleteMultipleRecordings,
    clearAllRecordings,
    storageUsage,
  } = useRecorderStore();

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<RecordingItem | null>(null);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);

  // Multi-select state
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleteSelectedModalOpen, setIsDeleteSelectedModalOpen] = useState<boolean>(false);

  useEffect(() => {
    loadRecordings();
  }, [loadRecordings]);

  // Clean up selected IDs if recordings change
  useEffect(() => {
    const existingIds = new Set(recordings.map((r) => r.id));
    setSelectedIds((prev) => prev.filter((id) => existingIds.has(id)));
  }, [recordings]);

  const filteredRecordings = recordings.filter((item) => {
    if (activeFilter !== 'all' && item.type !== activeFilter) return false;
    if (searchQuery.trim() !== '') {
      return item.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const allFilteredIds = filteredRecordings.map((r) => r.id);
    setSelectedIds(allFilteredIds);
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  const handleToggleSelectionMode = () => {
    if (isSelectionMode) {
      setIsSelectionMode(false);
      setSelectedIds([]);
    } else {
      setIsSelectionMode(true);
    }
  };

  const handleConfirmDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    await deleteMultipleRecordings(selectedIds);
    setSelectedIds([]);
    setIsDeleteSelectedModalOpen(false);
    if (recordings.length <= selectedIds.length) {
      setIsSelectionMode(false);
    }
  };

  const handleClearAllConfirm = () => {
    clearAllRecordings();
    setSelectedIds([]);
    setIsSelectionMode(false);
    setIsClearAllModalOpen(false);
  };

  const counts = {
    all: recordings.length,
    video: recordings.filter((r) => r.type === 'video').length,
    audio: recordings.filter((r) => r.type === 'audio').length,
    photo: recordings.filter((r) => r.type === 'photo').length,
  };

  const allFilteredSelected =
    filteredRecordings.length > 0 &&
    filteredRecordings.every((r) => selectedIds.includes(r.id));

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e252e] pb-5">
        <div>
          <h2 className="text-xl font-bold text-neutral-100 tracking-tight flex items-center gap-2.5">
            <Film className="w-5 h-5 text-purple-400" />
            <span>Recordings Library</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Browse, preview, export, and manage your captured media files.
          </p>
        </div>

        {recordings.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant={isSelectionMode ? 'primary' : 'secondary'}
              size="sm"
              onClick={handleToggleSelectionMode}
              leftIcon={<CheckSquare className="w-3.5 h-3.5" />}
            >
              {isSelectionMode ? 'Exit Selection' : 'Select Multiple'}
            </Button>

            {!isSelectionMode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsClearAllModalOpen(true)}
                leftIcon={<Trash2 className="w-3.5 h-3.5 text-red-400" />}
                className="text-red-400 hover:text-red-300 hover:bg-red-950/40"
              >
                Clear All
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Multi-Select Action Bar */}
      {isSelectionMode && (
        <div className="bg-[#18202b] border border-[#e95420]/50 rounded-xl p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-lg shadow-[#e95420]/5">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#e95420] animate-pulse" />
              <span>
                {selectedIds.length} of {filteredRecordings.length} selected
              </span>
            </span>

            <div className="h-4 w-px bg-neutral-700 hidden sm:block" />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={allFilteredSelected ? handleDeselectAll : handleSelectAll}
                className="text-xs text-neutral-300 hover:text-white font-medium hover:underline cursor-pointer flex items-center gap-1.5"
              >
                {allFilteredSelected ? (
                  <>
                    <Square className="w-3.5 h-3.5" />
                    <span>Deselect All</span>
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Select All</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <Button
              variant="danger"
              size="sm"
              disabled={selectedIds.length === 0}
              onClick={() => setIsDeleteSelectedModalOpen(true)}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete Selected ({selectedIds.length})
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleSelectionMode}
              leftIcon={<X className="w-3.5 h-3.5" />}
            >
              Done
            </Button>
          </div>
        </div>
      )}

      {/* Storage & Filter Header Bar */}
      <div className="bg-[#11151a] border border-[#1e252e] rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {(
            [
              { id: 'all', label: 'All Items', count: counts.all },
              { id: 'video', label: 'Videos', count: counts.video },
              { id: 'audio', label: 'Audio', count: counts.audio },
              { id: 'photo', label: 'Photos', count: counts.photo },
            ] as const
          ).map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-[#1f2632] text-white border border-[#2f3b4a] shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#161c24]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-[#e95420]/20 text-[#e95420]' : 'bg-[#181f28] text-neutral-500'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Storage Usage Info */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search recordings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#161c24] border border-[#232b36] rounded-lg pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 bg-[#161c24] px-3 py-1.5 rounded-lg border border-[#232b36] shrink-0">
            <HardDrive className="w-3.5 h-3.5 text-neutral-400" />
            <span>{formatFileSize(storageUsage.usedBytes)}</span>
          </div>
        </div>
      </div>

      {/* Grid of Recordings */}
      {filteredRecordings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRecordings.map((item) => (
            <RecordingCard
              key={item.id}
              item={item}
              onPlay={(rec) => setSelectedItem(rec)}
              onDelete={(id) => deleteRecording(id)}
              isSelectionMode={isSelectionMode}
              isSelected={selectedIds.includes(item.id)}
              onToggleSelect={handleToggleSelect}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-[#11151a] border border-[#1e252e] rounded-xl flex flex-col items-center justify-center">
          <Film className="w-12 h-12 text-neutral-600 mb-3" />
          <h4 className="text-sm font-semibold text-neutral-300">No media found</h4>
          <p className="text-xs text-neutral-500 max-w-sm mt-1">
            {recordings.length === 0
              ? 'Capture photos or record video and audio streams to populate your local library.'
              : 'No items match your active search filter.'}
          </p>
        </div>
      )}

      {/* Media Viewer Modal */}
      <MediaViewerModal
        item={selectedItem}
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        onDelete={(id) => deleteRecording(id)}
      />

      {/* Clear All Confirmation Modal */}
      <ConfirmModal
        isOpen={isClearAllModalOpen}
        title="Clear All Recordings"
        message="Are you sure you want to delete all recordings from local storage? This action cannot be reversed."
        confirmLabel="Clear All Permanently"
        variant="danger"
        onConfirm={handleClearAllConfirm}
        onClose={() => setIsClearAllModalOpen(false)}
      />

      {/* Delete Selected Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteSelectedModalOpen}
        title="Delete Selected Recordings"
        message={`Are you sure you want to delete ${selectedIds.length} selected recording${
          selectedIds.length > 1 ? 's' : ''
        }? This will permanently remove these files from local storage.`}
        confirmLabel={`Delete ${selectedIds.length} Item${selectedIds.length > 1 ? 's' : ''}`}
        variant="danger"
        onConfirm={handleConfirmDeleteSelected}
        onClose={() => setIsDeleteSelectedModalOpen(false)}
      />
    </div>
  );
};
