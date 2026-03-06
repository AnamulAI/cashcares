import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PaymentHistoryRecord {
  id: string;
  entry_id: string;
  user_id: string;
  date: string;
  amount: number;
  account_id: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
  account?: { name: string } | null;
}

export function usePaymentHistory(entryId: string | undefined) {
  return useQuery({
    queryKey: ["payable_payment_history", entryId],
    enabled: !!entryId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("payable_payment_history")
        .select("*, account:accounts!payable_payment_history_account_id_fkey(name)")
        .eq("entry_id", entryId)
        .order("date", { ascending: true });
      if (error) throw error;
      return (data || []) as PaymentHistoryRecord[];
    },
  });
}

export interface CollectionHistoryRecord {
  id: string;
  entry_id: string;
  user_id: string;
  date: string;
  amount: number;
  account_id: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
  account?: { name: string } | null;
}

export function useCollectionHistory(entryId: string | undefined) {
  return useQuery({
    queryKey: ["receivable_collection_history", entryId],
    enabled: !!entryId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("receivable_collection_history")
        .select("*, account:accounts!receivable_collection_history_account_id_fkey(name)")
        .eq("entry_id", entryId)
        .order("date", { ascending: true });
      if (error) throw error;
      return (data || []) as CollectionHistoryRecord[];
    },
  });
}
