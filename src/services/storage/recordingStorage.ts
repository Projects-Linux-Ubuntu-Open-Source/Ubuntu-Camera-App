import { RecordingItem } from '../../types/recording';

export interface StorageStats {
  usedBytes: number;
  itemCount: number;
}

export interface RecordingStorage {
  getAll(): Promise<RecordingItem[]>;
  getById(id: string): Promise<RecordingItem | null>;
  save(item: Omit<RecordingItem, 'id' | 'timestamp'> & { blob: Blob }): Promise<RecordingItem>;
  delete(id: string): Promise<void>;
  clearAll(): Promise<void>;
  getStorageUsage(): Promise<StorageStats>;
}

const DB_NAME = 'UbuntuRecorderDB';
const DB_VERSION = 1;
const STORE_NAME = 'recordings';

class IndexedDBRecordingStorage implements RecordingStorage {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private async getDB(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            store.createIndex('timestamp', 'timestamp', { unique: false });
            store.createIndex('type', 'type', { unique: false });
          }
        };

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    }
    return this.dbPromise;
  }

  async getAll(): Promise<RecordingItem[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('timestamp');
        const request = index.openCursor(null, 'prev'); // Most recent first
        const results: RecordingItem[] = [];

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor) {
            const item = cursor.value;
            // Create object URL for preview if blob exists
            if (item.blob instanceof Blob) {
              item.previewUrl = URL.createObjectURL(item.blob);
            }
            results.push(item);
            cursor.continue();
          } else {
            resolve(results);
          }
        };

        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.warn('Failed to load recordings from IndexedDB:', err);
      return [];
    }
  }

  async getById(id: string): Promise<RecordingItem | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);

        request.onsuccess = () => {
          const item = request.result as RecordingItem | undefined;
          if (item && item.blob instanceof Blob) {
            item.previewUrl = URL.createObjectURL(item.blob);
            resolve(item);
          } else {
            resolve(item || null);
          }
        };

        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error('Failed to get recording by id:', err);
      return null;
    }
  }

  async save(itemData: Omit<RecordingItem, 'id' | 'timestamp'> & { blob: Blob }): Promise<RecordingItem> {
    const db = await this.getDB();
    const id = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const timestamp = Date.now();

    const newItem: RecordingItem = {
      ...itemData,
      id,
      timestamp,
      size: itemData.blob.size,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(newItem);

      request.onsuccess = () => {
        if (newItem.blob) {
          newItem.previewUrl = URL.createObjectURL(newItem.blob);
        }
        resolve(newItem);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async delete(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearAll(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getStorageUsage(): Promise<StorageStats> {
    const items = await this.getAll();
    const usedBytes = items.reduce((acc, curr) => acc + (curr.size || 0), 0);
    return {
      usedBytes,
      itemCount: items.length,
    };
  }
}

export const recordingStorage: RecordingStorage = new IndexedDBRecordingStorage();
