import { ReelItem } from '../components/ReelsTab.tsx';

const DB_NAME = 'whatsapp_reels_db';
const DB_VERSION = 1;
const STORE_NAME = 'user_reels';
const LOCAL_STORAGE_BACKUP_KEY = 'whatsapp_web_user_created_reels_v3';

// Open or create the IndexedDB database
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
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

export interface StoredReelRecord {
  id: string;
  reelData: ReelItem;
  mediaBlob?: Blob;
  mediaDataUrl?: string;
  createdAt: number;
}

/**
 * Compresses an uploaded image file so it is lightweight, high-res, and permanently storable in base64.
 */
export async function compressImageFile(file: File, maxDimension = 1280, quality = 0.85): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Use webp or jpeg for compact permanent storage
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.onerror = () => {
        resolve(e.target?.result as string);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Reads any file as a Data URL (base64 string).
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Sanitizes a reel item into a pure, clean JSON-serializable object with zero DOM/FiberNode references.
 */
export function sanitizeReel(r: ReelItem): ReelItem {
  return {
    id: String(r.id),
    mediaType: r.mediaType === 'photo' ? 'photo' : 'video',
    videoUrl: String(r.videoUrl || ''),
    imageUrl: r.imageUrl ? String(r.imageUrl) : undefined,
    isOwn: Boolean(r.isOwn),
    author: {
      name: String(r.author?.name || 'Tú'),
      username: String(r.author?.username || '@usuario'),
      avatar: String(r.author?.avatar || ''),
      verified: Boolean(r.author?.verified),
    },
    description: String(r.description || ''),
    musicTrack: String(r.musicTrack || ''),
    likesCount: Number(r.likesCount || 0),
    commentsCount: Number(r.commentsCount || 0),
    sharesCount: Number(r.sharesCount || 0),
    category: String(r.category || 'Tendencias'),
    tags: Array.isArray(r.tags) ? r.tags.map(String) : [],
    comments: Array.isArray(r.comments)
      ? r.comments.map((c) => ({
          id: String(c.id),
          author: String(c.author),
          avatar: String(c.avatar),
          text: String(c.text),
          timestamp: String(c.timestamp),
          likes: Number(c.likes || 0),
        }))
      : [],
    createdAt: r.createdAt ? String(r.createdAt) : undefined,
  };
}

/**
 * Saves a user-created reel permanently into IndexedDB and LocalStorage backup.
 */
export async function persistUserReel(reel: ReelItem, fileBlob?: Blob | null): Promise<void> {
  const cleanReel = sanitizeReel(reel);
  const record: StoredReelRecord = {
    id: cleanReel.id,
    reelData: cleanReel,
    mediaBlob: fileBlob || undefined,
    mediaDataUrl: cleanReel.mediaType === 'photo' ? (cleanReel.imageUrl || cleanReel.videoUrl) : undefined,
    createdAt: Date.now(),
  };

  // 1. Save into IndexedDB
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // IndexedDB fallback handled silently
  }

  // 2. Save into LocalStorage backup (only metadata and URLs to prevent quota limits)
  try {
    const existingStr = localStorage.getItem(LOCAL_STORAGE_BACKUP_KEY);
    const existing: ReelItem[] = existingStr ? JSON.parse(existingStr) : [];
    // Replace or prepend
    const filtered = existing.filter((r) => r.id !== cleanReel.id).map(sanitizeReel);
    const updated = [cleanReel, ...filtered];
    localStorage.setItem(LOCAL_STORAGE_BACKUP_KEY, JSON.stringify(updated.slice(0, 30)));
  } catch {
    // LocalStorage fallback handled silently
  }
}

/**
 * Loads all user-created reels from IndexedDB (or localStorage fallback).
 */
export async function loadUserPersistedReels(): Promise<ReelItem[]> {
  try {
    const db = await openDB();
    const records: StoredReelRecord[] = await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result as StoredReelRecord[]);
      req.onerror = () => reject(req.error);
    });

    if (records && records.length > 0) {
      // Sort newest first
      records.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

      const restoredReels: ReelItem[] = records.map((rec) => {
        const item = { ...rec.reelData };

        // If a real Blob was saved for video/photo, recreate a valid active session URL!
        if (rec.mediaBlob) {
          const freshObjectUrl = URL.createObjectURL(rec.mediaBlob);
          if (item.mediaType === 'video') {
            item.videoUrl = freshObjectUrl;
            delete item.imageUrl;
          } else {
            item.imageUrl = freshObjectUrl;
            item.videoUrl = '';
          }
        } else if (rec.mediaDataUrl) {
          if (item.mediaType === 'photo') {
            item.imageUrl = rec.mediaDataUrl;
            item.videoUrl = '';
          } else {
            item.videoUrl = rec.mediaDataUrl;
            delete item.imageUrl;
          }
        }

        return item;
      });

      return restoredReels;
    }
  } catch {
    // IndexedDB read fallback handled silently
  }

  // Fallback to localStorage
  try {
    const local = localStorage.getItem(LOCAL_STORAGE_BACKUP_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // Ignore
  }

  return [];
}

/**
 * Deletes a user reel permanently.
 */
export async function removePersistedUserReel(reelId: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(reelId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Ignore
  }

  try {
    const existingStr = localStorage.getItem(LOCAL_STORAGE_BACKUP_KEY);
    if (existingStr) {
      const existing: ReelItem[] = JSON.parse(existingStr);
      const filtered = existing.filter((r) => r.id !== reelId);
      localStorage.setItem(LOCAL_STORAGE_BACKUP_KEY, JSON.stringify(filtered));
    }
  } catch {
    // Ignore
  }
}
