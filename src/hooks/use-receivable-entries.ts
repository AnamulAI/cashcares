import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { adjustBalance } from "./_account-balance";

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
      // Apply collected_amount inflow on linked account (money received)
      const collected = Number(e.collected_amount || 0);
      if (e.linked_account_id && collected > 0) {
        await adjustBalance(e.linked_account_id, collected);
      }
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["receivable_entries", vars.book_id] });
      qc.invalidateQueries({ queryKey: ["receivable_entries_all"] });
      qc.invalidateQueries({ queryKey: ["receivable_books"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Entry added");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateReceivableEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ReceivableEntryInsert> & { id: string }) => {
      // Fetch current row to compute reversal
      const { data: current, error: fErr } = await (supabase as any)
        .from("receivable_entries").select("*").eq("id", id).single();
      if (fErr) throw fErr;

      const oldAcct = current.linked_account_id as string | null;
      const oldCollected = Number(current.collected_amount || 0);
      const newAcct = (updates.linked_account_id !== undefined ? updates.linked_account_id : oldAcct) as string | null;
      const newCollected = updates.collected_amount !== undefined ? Number(updates.collected_amount) : oldCollected;

      // Reverse old impact, apply new impact
      if (oldAcct && oldCollected > 0) await adjustBalance(oldAcct, -oldCollected);
      if (newAcct && newCollected > 0) await adjustBalance(newAcct, newCollected);

      const { data, error } = await (supabase as any).from("receivable_entries").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["receivable_entries"] });
      qc.invalidateQueries({ queryKey: ["receivable_entries_all"] });
      qc.invalidateQueries({ queryKey: ["receivable_books"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Entry updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteReceivableEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // Fetch first so we can reverse balance impact
      const { data: current } = await (supabase as any)
        .from("receivable_entries").select("linked_account_id, collected_amount").eq("id", id).single();
      const { error } = await (supabase as any).from("receivable_entries").delete().eq("id", id);
      if (error) throw error;
      if (current?.linked_account_id && Number(current.collected_amount) > 0) {
        await adjustBalance(current.linked_account_id, -Number(current.collected_amount));
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["receivable_entries"] });
      qc.invalidateQueries({ queryKey: ["receivable_entries_all"] });
      qc.invalidateQueries({ queryKey: ["receivable_books"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Entry deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
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
