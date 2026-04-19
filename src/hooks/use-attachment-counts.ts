import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { EntryType } from "@/hooks/use-entry-attachments";

/**
 * Fetches attachment counts for a batch of entries of the same type.
 * Returns a Record<entry_id, count>.
 */
export function useAttachmentCounts(entryIds: string[], entryType: EntryType) {
  // Stable cache key from sorted IDs
  const sortedIds = [...entryIds].sort();
  return useQuery({
    queryKey: ["entry_attachment_counts", entryType, sortedIds],
    enabled: sortedIds.length > 0,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("entry_attachments")
        .select("entry_id")
        .eq("entry_type", entryType)
        .in("entry_id", sortedIds);
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data || []).forEach((row: { entry_id: string }) => {
        counts[row.entry_id] = (counts[row.entry_id] || 0) + 1;
      });
      return counts;
    },
    staleTime: 30_000,
  });
}
