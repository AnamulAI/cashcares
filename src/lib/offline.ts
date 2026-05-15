import { QueryClient, onlineManager } from "@tanstack/react-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

/**
 * Shared QueryClient configured for offline support:
 * - Queries use networkMode "offlineFirst" so cached data is shown when offline.
 * - Mutations use networkMode "online" so they pause (instead of failing) while
 *   offline, and React Query auto-resumes them when connectivity returns.
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
      networkMode: "online",
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

/**
 * Whenever the browser regains connectivity, replay any paused mutations and
 * refresh server state so queries reflect the synced rows.
 */
let reconnectWired = false;
export function wireOfflineReconnect() {
  if (reconnectWired || typeof window === "undefined") return;
  reconnectWired = true;

  onlineManager.subscribe(async (online) => {
    if (!online) return;
    try {
      await queryClient.resumePausedMutations();
    } finally {
      queryClient.invalidateQueries();
    }
  });
}
