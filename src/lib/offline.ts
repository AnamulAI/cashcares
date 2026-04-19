import { QueryClient } from "@tanstack/react-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

/**
 * Shared QueryClient configured for offline support:
 * - Mutations have networkMode: "offlineFirst" so they queue when offline
 *   and resume automatically once the browser reports online again.
 * - gcTime is bumped so persisted cache entries are not garbage-collected
 *   on rehydration.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: "offlineFirst",
      gcTime: 1000 * 60 * 60 * 24, // 24h — survive reloads
      staleTime: 1000 * 30,
      retry: 1,
    },
    mutations: {
      networkMode: "offlineFirst",
      retry: 3,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
    },
  },
});

export const persister = createSyncStoragePersister({
  storage: typeof window !== "undefined" ? window.localStorage : undefined,
  key: "MAHBOOK_QUERY_CACHE_V1",
  throttleTime: 1000,
});

/** Tracks whether there are mutations waiting to be flushed. */
export function getPendingMutationCount() {
  return queryClient.getMutationCache().getAll().filter((m) => m.state.status === "pending" || m.state.isPaused).length;
}
