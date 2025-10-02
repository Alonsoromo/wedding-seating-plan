import { useEffect, useCallback, useRef, useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

interface SyncMessage<T> {
  type: 'UPDATE' | 'DELETE';
  key: string;
  value?: T;
  timestamp: number;
  senderId: string;
}

// Generate a unique ID for this browser session
const SESSION_ID = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Helper to safely access localStorage
const localStorageHelper = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return defaultValue;
    }
  },
  set<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn('Failed to write to localStorage:', error);
      return false;
    }
  },
  remove(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
      return false;
    }
  }
};

/**
 * Enhanced version of useKV that synchronizes data across browser tabs and sessions
 * in real-time using BroadcastChannel API.
 * 
 * @param key - The key under which to store the value in KV store
 * @param initialValue - The initial value to use if no stored value is found
 * @param options - Optional configuration
 * @returns An array containing [value, setValue, deleteValue]
 */
export function useSyncedKV<T>(
  key: string,
  initialValue: T,
  options?: {
    showSyncToast?: boolean; // Whether to show toast notifications when syncing
    syncChannelName?: string; // Custom BroadcastChannel name
  }
) {
  const [kvValue, kvSetValue, kvDeleteValue] = useKV<T>(key, initialValue);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const lastUpdateTimestamp = useRef<number>(0);
  const showSyncToast = options?.showSyncToast ?? true;
  const syncChannelName = options?.syncChannelName ?? 'wedding-planner-sync';
  
  // Use local state with localStorage as the primary storage
  const [localValue, setLocalValue] = useState<T>(() => {
    // Always try to load from localStorage first
    const stored = localStorageHelper.get(key, initialValue);
    // Check if we have actual data (not just the initial value)
    return stored;
  });
  
  // Track if we've ever successfully loaded from KV
  const kvLoadedRef = useRef<boolean>(false);
  
  // Always use localStorage value as the source of truth
  const value = localValue;
  
  // Sync localStorage when KV value changes (only if KV successfully loads)
  useEffect(() => {
    // Check if kvValue is different from initialValue, indicating a successful KV load
    if (kvValue !== initialValue || kvLoadedRef.current) {
      kvLoadedRef.current = true;
      localStorageHelper.set(key, kvValue);
      setLocalValue(kvValue);
    }
  }, [kvValue, key, initialValue]);

  // Initialize BroadcastChannel for cross-tab communication
  useEffect(() => {
    // BroadcastChannel is supported in modern browsers
    if (typeof BroadcastChannel !== 'undefined') {
      channelRef.current = new BroadcastChannel(syncChannelName);

      // Listen for messages from other tabs/sessions
      channelRef.current.onmessage = (event: MessageEvent<SyncMessage<T>>) => {
        const message = event.data;

        // Ignore messages from ourselves
        if (message.senderId === SESSION_ID) {
          return;
        }

        // Ignore stale messages
        if (message.timestamp <= lastUpdateTimestamp.current) {
          return;
        }

        // Only process messages for this key
        if (message.key !== key) {
          return;
        }

        lastUpdateTimestamp.current = message.timestamp;

        if (message.type === 'UPDATE' && message.value !== undefined) {
          // Update KV (best effort)
          try {
            kvSetValue(message.value);
          } catch (error) {
            // Silently fail
          }
          
          // Update localStorage (primary storage)
          localStorageHelper.set(key, message.value);
          setLocalValue(message.value);
          
          if (showSyncToast) {
            toast.info('Datos actualizados desde otra sesión', {
              duration: 2000,
            });
          }
        } else if (message.type === 'DELETE') {
          // Delete from KV (best effort)
          try {
            kvDeleteValue();
          } catch (error) {
            // Silently fail
          }
          
          // Delete from localStorage (primary storage)
          localStorageHelper.remove(key);
          setLocalValue(initialValue);
          
          if (showSyncToast) {
            toast.info('Datos borrados desde otra sesión', {
              duration: 2000,
            });
          }
        }
      };
    }

    // Cleanup
    return () => {
      if (channelRef.current) {
        channelRef.current.close();
        channelRef.current = null;
      }
    };
  }, [key, syncChannelName, kvSetValue, kvDeleteValue, showSyncToast, initialValue]);

  // Enhanced setValue that broadcasts changes to other tabs
  const syncedSetValue = useCallback(
    (newValue: T | ((oldValue?: T) => T)) => {
      const timestamp = Date.now();
      lastUpdateTimestamp.current = timestamp;

      // Calculate the actual value using current localValue
      const actualValue = typeof newValue === 'function' 
        ? (newValue as (oldValue?: T) => T)(localValue)
        : newValue;

      // Try to update KV store (best effort, don't fail if it doesn't work)
      try {
        kvSetValue(actualValue);
      } catch (error) {
        // Silently fail - localStorage is our primary storage
      }
      
      // Always update localStorage (primary storage)
      localStorageHelper.set(key, actualValue);
      setLocalValue(actualValue);
      
      // Broadcast the change to other tabs/sessions
      if (channelRef.current) {
        const message: SyncMessage<T> = {
          type: 'UPDATE',
          key,
          value: actualValue,
          timestamp,
          senderId: SESSION_ID,
        };
        channelRef.current.postMessage(message);
      }
    },
    [key, kvSetValue, localValue]
  );

  // Enhanced deleteValue that broadcasts deletion to other tabs
  const syncedDeleteValue = useCallback(() => {
    const timestamp = Date.now();
    lastUpdateTimestamp.current = timestamp;

    // Try to delete from KV store
    try {
      kvDeleteValue();
    } catch (error) {
      console.warn('Failed to delete from KV store:', error);
    }
    
    // Always delete from localStorage
    localStorageHelper.remove(key);
    setLocalValue(initialValue);

    // Broadcast the deletion to other tabs/sessions
    if (channelRef.current) {
      const message: SyncMessage<T> = {
        type: 'DELETE',
        key,
        timestamp,
        senderId: SESSION_ID,
      };
      channelRef.current.postMessage(message);
    }
  }, [key, kvDeleteValue, initialValue]);

  return [value, syncedSetValue, syncedDeleteValue] as const;
}
