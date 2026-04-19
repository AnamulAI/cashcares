import { useMutationState } from "@tanstack/react-query";
import { useMemo } from "react";

/**
 * Collects IDs of entries currently being mutated (pending or paused-while-offline).
 * Works for any mutation whose `variables` object contains an `id` field — which
 * covers our update/delete hooks across transactions, ledger entries, etc.
 *
 * Returns a Set for O(1) lookup from table rows.
 */
export function usePendingEntryIds(): Set<string> {
  const states = useMutationState({
    filters: { status: "pending" },
    select: (m) => m.state.variables,
  });

  return useMemo(() => {
    const ids = new Set<string>();
    for (const vars of states) {
      if (!vars || typeof vars !== "object") continue;
      const v = vars as Record<string, unknown>;
      // Common shapes: { id }, { entryId }, { txn: { id } }, { att: { id } }
      const candidates = [v.id, v.entryId, v.bookId, (v.txn as any)?.id, (v.att as any)?.id];
      for (const c of candidates) {
        if (typeof c === "string") ids.add(c);
      }
    }
    return ids;
  }, [states]);
}

/**
 * Convenience helper hook for a single entry id.
 */
export function useIsEntryPending(id: string | undefined): boolean {
  const ids = usePendingEntryIds();
  return id ? ids.has(id) : false;
}
