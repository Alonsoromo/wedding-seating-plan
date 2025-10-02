import { useEffect, useCallback, useRef } from 'react';
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
  const [value, setValue, deleteValue] = useKV<T>(key, initialValue);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const lastUpdateTimestamp = useRef<number>(0);
  const showSyncToast = options?.showSyncToast ?? true;
  const syncChannelName = options?.syncChannelName ?? 'wedding-planner-sync';

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
          setValue(message.value);
          if (showSyncToast) {
            toast.info('Datos actualizados desde otra sesión', {
              duration: 2000,
            });
          }
        } else if (message.type === 'DELETE') {
          deleteValue();
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
  }, [key, syncChannelName, setValue, deleteValue, showSyncToast]);

  // Enhanced setValue that broadcasts changes to other tabs
  const syncedSetValue = useCallback(
    (newValue: T | ((oldValue?: T) => T)) => {
      const timestamp = Date.now();
      lastUpdateTimestamp.current = timestamp;

      // Update local state (which will also persist to KV via useKV)
      // We need to capture the actual value to broadcast it
      setValue((currentValue) => {
        const actualValue = typeof newValue === 'function' 
          ? (newValue as (oldValue?: T) => T)(currentValue)
          : newValue;

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

        return actualValue;
      });
    },
    [key, setValue]
  );

  // Enhanced deleteValue that broadcasts deletion to other tabs
  const syncedDeleteValue = useCallback(() => {
    const timestamp = Date.now();
    lastUpdateTimestamp.current = timestamp;

    // Delete local state
    deleteValue();

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
  }, [key, deleteValue]);

  return [value, syncedSetValue, syncedDeleteValue] as const;
}
