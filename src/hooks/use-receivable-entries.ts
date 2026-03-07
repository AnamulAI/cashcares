import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ReceivableEntry {
  id: string;
  user_id: string;
  book_id: string;
  date: string;
  description: string | null;
  category: string | null;
  linked_account_id: string | null;
  amount: number;
  collected_amount: number;
  due_date: string | null;
  note: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  linked_account?: { name: string } | null;
}

export type ReceivableEntryInsert = {
  book_id: string;
  date: string;
  description?: string | null;
  category?: string | null;
  linked_account_id?: string | null;
  amount: number;
  collected_amount?: number;
  due_date?: string | null;
  note?: string | null;
  status?: string;
};

export function useReceivableEntries(bookId: string | undefined) {
  return useQuery({
    queryKey: ["receivable_entries", bookId],
    enabled: !!bookId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("receivable_entries")
        .select("*, linked_account:accounts!receivable_entries_linked_account_id_fkey(name)")
        .eq("book_id", bookId)
        .order("date", { ascending: false });
      if (error) throw error;
      return (data || []) as ReceivableEntry[];
    },
  });
}

export function useAllReceivableEntries() {
  return useQuery({
    queryKey: ["receivable_entries_all"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await (supabase as any)
        .from("receivable_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });
      if (error) throw error;
      return (data || []) as ReceivableEntry[];
    },
  });
}

export function useCreateReceivableEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (e: ReceivableEntryInsert) => {
      const { data, error } = await (supabase as any).from("receivable_entries").insert(e).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["receivable_entries", vars.book_id] });
      qc.invalidateQueries({ queryKey: ["receivable_entries_all"] });
      qc.invalidateQueries({ queryKey: ["receivable_books"] });
      toast.success("Entry added");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateReceivableEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ReceivableEntryInsert> & { id: string }) => {
      const { data, error } = await (supabase as any).from("receivable_entries").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["receivable_entries"] });
      qc.invalidateQueries({ queryKey: ["receivable_entries_all"] });
      qc.invalidateQueries({ queryKey: ["receivable_books"] });
      toast.success("Entry updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteReceivableEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("receivable_entries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["receivable_entries"] });
      qc.invalidateQueries({ queryKey: ["receivable_entries_all"] });
      qc.invalidateQueries({ queryKey: ["receivable_books"] });
      toast.success("Entry deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

async function adjustBalance(accountId: string, amount: number) {
  const { data } = await supabase.from("accounts").select("balance").eq("id", accountId).single();
  if (data) await supabase.from("accounts").update({ balance: Number(data.balance) + amount }).eq("id", accountId);
}

export function useRecordEntryCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, amount, linkedAccountId, note }: { id: string; amount: number; linkedAccountId?: string | null; note?: string }) => {
      const { data: current, error: fetchErr } = await (supabase as any).from("receivable_entries").select("*").eq("id", id).single();
      if (fetchErr) throw fetchErr;
      const newCollected = Number(current.collected_amount) + amount;
      const remaining = Number(current.amount) - newCollected;
      const newStatus = remaining <= 0 ? "collected" : "partial";
      const { error } = await (supabase as any).from("receivable_entries").update({ collected_amount: newCollected, status: newStatus }).eq("id", id);
      if (error) throw error;
      // Insert collection history record
      await (supabase as any).from("receivable_collection_history").insert({
        entry_id: id,
        date: new Date().toISOString().split("T")[0],
        amount,
        account_id: linkedAccountId || null,
        note: note || null,
      });
      if (linkedAccountId) await adjustBalance(linkedAccountId, amount);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["receivable_entries"] });
      qc.invalidateQueries({ queryKey: ["receivable_entries_all"] });
      qc.invalidateQueries({ queryKey: ["receivable_books"] });
      qc.invalidateQueries({ queryKey: ["receivable_collection_history"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Collection recorded");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
