import { create } from 'zustand';
import { RecordingItem, RecordingStatus, RecordingType } from '../types/recording';
import { recordingStorage } from '../services/storage/recordingStorage';
import { useAppStore } from './appStore';

interface RecorderState {
  status: RecordingStatus;
  duration: number; // in seconds
  activeType: RecordingType;
  recordings: RecordingItem[];
  isLoadingRecordings: boolean;
  selectedRecording: RecordingItem | null;
  storageUsage: { usedBytes: number; itemCount: number };

  // Actions
  setStatus: (status: RecordingStatus) => void;
  setDuration: (duration: number) => void;
  setActiveType: (type: RecordingType) => void;
  setSelectedRecording: (item: RecordingItem | null) => void;
  loadRecordings: () => Promise<void>;
  deleteRecording: (id: string) => Promise<void>;
  clearAllRecordings: () => Promise<void>;
}

export const useRecorderStore = create<RecorderState>((set, get) => ({
  status: 'idle',
  duration: 0,
  activeType: 'video',
  recordings: [],
  isLoadingRecordings: false,
  selectedRecording: null,
  storageUsage: { usedBytes: 0, itemCount: 0 },

  setStatus: (status) => set({ status }),
  setDuration: (duration) => set({ duration }),
  setActiveType: (activeType) => set({ activeType }),
  setSelectedRecording: (selectedRecording) => set({ selectedRecording }),

  loadRecordings: async () => {
    set({ isLoadingRecordings: true });
    try {
      const items = await recordingStorage.getAll();
      const usage = await recordingStorage.getStorageUsage();
      set({ recordings: items, storageUsage: usage, isLoadingRecordings: false });
    } catch (err) {
      console.error('Failed to load recordings:', err);
      set({ isLoadingRecordings: false });
    }
  },

  deleteRecording: async (id: string) => {
    try {
      const itemToDelete = get().recordings.find((r) => r.id === id);
      if (itemToDelete?.previewUrl) {
        URL.revokeObjectURL(itemToDelete.previewUrl);
      }
      await recordingStorage.delete(id);
      await get().loadRecordings();
      if (get().selectedRecording?.id === id) {
        set({ selectedRecording: null });
      }
      useAppStore.getState().addToast({
        title: 'Recording Deleted',
        message: itemToDelete?.name ? `"${itemToDelete.name}" was removed.` : 'Item was removed.',
        type: 'info',
      });
    } catch (err) {
      console.error('Failed to delete recording:', err);
      useAppStore.getState().addToast({
        title: 'Delete Failed',
        message: 'Could not delete the recording from storage.',
        type: 'error',
      });
    }
  },

  clearAllRecordings: async () => {
    try {
      get().recordings.forEach((r) => {
        if (r.previewUrl) URL.revokeObjectURL(r.previewUrl);
      });
      await recordingStorage.clearAll();
      await get().loadRecordings();
      set({ selectedRecording: null });
      useAppStore.getState().addToast({
        title: 'Library Cleared',
        message: 'All recordings have been removed from local storage.',
        type: 'info',
      });
    } catch (err) {
      console.error('Failed to clear recordings:', err);
      useAppStore.getState().addToast({
        title: 'Clear Failed',
        message: 'Could not clear recordings from storage.',
        type: 'error',
      });
    }
  },
}));
