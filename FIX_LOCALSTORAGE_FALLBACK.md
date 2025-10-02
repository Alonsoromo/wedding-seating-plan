# Fix: localStorage Fallback for Data Persistence

## Problem
**Issue**: "No guarda los datos despues de recargar la pagina" (Data is not saved after reloading the page)

Users reported that data was being lost after page reload. Investigation revealed that the GitHub Spark KV store was returning 403 Forbidden errors when:
- Running in local development environment
- KV store permissions not properly configured
- Running outside the Spark runtime environment

## Root Cause
The application relied exclusively on `useKV` hook from `@github/spark/hooks` for data persistence. When the KV store was unavailable or returned errors, all data was lost because there was no fallback mechanism.

## Solution Implemented
Added **localStorage as a fallback storage mechanism** with KV store as a best-effort secondary storage.

### Architecture
```
┌─────────────────────────────────────┐
│       useSyncedKV Hook              │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────────────────────┐  │
│  │   localStorage (Primary)     │  │
│  │   - Always available         │  │
│  │   - Reliable persistence     │  │
│  │   - Fast read/write          │  │
│  └──────────────────────────────┘  │
│               ▲                     │
│               │                     │
│  ┌────────────▼─────────────────┐  │
│  │   KV Store (Secondary)       │  │
│  │   - Best effort              │  │
│  │   - Cloud storage            │  │
│  │   - Errors silently handled  │  │
│  └──────────────────────────────┘  │
│               ▲                     │
│               │                     │
│  ┌────────────▼─────────────────┐  │
│  │   BroadcastChannel           │  │
│  │   - Cross-tab sync           │  │
│  │   - Real-time updates        │  │
│  └──────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

## Changes Made

### File Modified: `src/hooks/use-synced-kv.ts`

#### 1. Added localStorage Helper Functions
```typescript
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
```

#### 2. Changed Storage Strategy
- **Before**: KV store was the only storage, data lost if it failed
- **After**: localStorage is primary storage, KV store is best-effort

#### 3. Updated Hook Logic
```typescript
// localStorage is the source of truth
const [localValue, setLocalValue] = useState<T>(() => {
  return localStorageHelper.get(key, initialValue);
});

// Always use localStorage value
const value = localValue;

// Sync with KV when available
useEffect(() => {
  if (kvValue !== initialValue || kvLoadedRef.current) {
    kvLoadedRef.current = true;
    localStorageHelper.set(key, kvValue);
    setLocalValue(kvValue);
  }
}, [kvValue, key, initialValue]);
```

#### 4. Error Handling
All KV operations are now wrapped in try-catch blocks:
```typescript
// Try to update KV store (best effort)
try {
  kvSetValue(actualValue);
} catch (error) {
  // Silently fail - localStorage is our primary storage
}

// Always update localStorage (primary storage)
localStorageHelper.set(key, actualValue);
setLocalValue(actualValue);
```

## Benefits

### ✅ Reliability
- Data persists even when KV store is unavailable
- Works in all environments (local, production, etc.)
- No data loss due to permission issues

### ✅ Compatibility
- Zero breaking changes to existing code
- Same API interface maintained
- Cross-tab synchronization still works

### ✅ Performance
- localStorage is faster than network requests
- Immediate data availability on page load
- Reduced network errors in console

### ✅ Graceful Degradation
- KV store used when available
- localStorage fallback when KV fails
- BroadcastChannel for cross-tab sync

## Testing Results

### Test 1: Basic Persistence ✅
1. Add guests to the app
2. Refresh the page
3. **Result**: All guests persist correctly

### Test 2: Multiple Operations ✅
1. Add guest "Test User 1"
2. Add guest "Test User 2"
3. Refresh the page
4. **Result**: Both guests persist (Total: 2)

### Test 3: KV Store Errors ✅
- KV store returns 403 Forbidden errors
- localStorage catches the data successfully
- No data loss after refresh

## Impact

### Modified Files
- `src/hooks/use-synced-kv.ts` (~90 lines added/modified)

### Breaking Changes
- **None** - fully backward compatible

### Dependencies
- No new dependencies added
- Uses browser's native localStorage API
- Works with existing `@github/spark/hooks`

## Migration Path

### For Existing Users
No migration needed - data will automatically be:
1. Loaded from localStorage on first load after update
2. Saved to both localStorage and KV (when available)
3. Synced across tabs via BroadcastChannel

### For New Users
Everything works out of the box:
- localStorage is automatically used
- KV store is attempted (but not required)
- Data persists reliably

## Technical Details

### Storage Keys
- `wedding-guests` - Array of guest objects
- `wedding-tables` - Array of table objects

### Data Format
Both localStorage and KV store use JSON serialization:
```json
{
  "wedding-guests": "[{\"id\":\"uuid\",\"name\":\"Guest Name\"}]",
  "wedding-tables": "[{\"id\":1,\"guests\":[...]}]"
}
```

### Cross-Tab Synchronization
Still works via BroadcastChannel:
1. Tab A updates data
2. Data saved to localStorage
3. BroadcastChannel message sent
4. Tab B receives message
5. Tab B updates from localStorage
6. UI updates automatically

## Conclusion

This fix resolves the data persistence issue by adding a robust localStorage fallback mechanism. The solution:
- ✅ Fixes the reported issue completely
- ✅ Maintains backward compatibility
- ✅ Adds no new dependencies
- ✅ Improves reliability and performance
- ✅ Requires zero user migration

Users can now confidently use the application knowing their data will persist reliably across page reloads, regardless of KV store availability.
