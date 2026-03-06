import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PayableEntry {
  id: string;
  user_id: string;
  book_id: string;
  date: string;
  description: string | null;
  category: string | null;
  linked_account_id: string | null;
  amount: number;
  paid_amount: number;
  due_date: string | null;
  note: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  linked_account?: { name: string } | null;
}

export type PayableEntryInsert = {
  book_id: string;
  date: string;
  description?: string | null;
  category?: string | null;
  linked_account_id?: string | null;
  amount: number;
  paid_amount?: number;
  due_date?: string | null;
  note?: string | null;
  status?: string;
};

export function usePayableEntries(bookId: string | undefined) {
  return useQuery({
    queryKey: ["payable_entries", bookId],
    enabled: !!bookId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("payable_entries")
        .select("*, linked_account:accounts!payable_entries_linked_account_id_fkey(name)")
        .eq("book_id", bookId)
        .order("date", { ascending: false });
      if (error) throw error;
      return (data || []) as PayableEntry[];
    },
  });
}

export function useAllPayableEntries() {
  return useQuery({
    queryKey: ["payable_entries_all"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("payable_entries")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return (data || []) as PayableEntry[];
    },
  });
}

export function useCreatePayableEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (e: PayableEntryInsert) => {
      const { data, error } = await (supabase as any).from("payable_entries").insert(e).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["payable_entries", vars.book_id] });
      qc.invalidateQueries({ queryKey: ["payable_entries_all"] });
      qc.invalidateQueries({ queryKey: ["payable_books"] });
      toast.success("Entry added");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdatePayableEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PayableEntryInsert> & { id: string }) => {
      const { data, error } = await (supabase as any).from("payable_entries").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payable_entries"] });
      qc.invalidateQueries({ queryKey: ["payable_entries_all"] });
      qc.invalidateQueries({ queryKey: ["payable_books"] });
      toast.success("Entry updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeletePayableEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("payable_entries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payable_entries"] });
      qc.invalidateQueries({ queryKey: ["payable_entries_all"] });
      qc.invalidateQueries({ queryKey: ["payable_books"] });
      toast.success("Entry deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

async function adjustBalance(accountId: string, amount: number) {
  const { data } = await supabase.from("accounts").select("balance").eq("id", accountId).single();
  if (data) await supabase.from("accounts").update({ balance: Number(data.balance) + amount }).eq("id", accountId);
}

export function useRecordEntryPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, amount, linkedAccountId, note }: { id: string; amount: number; linkedAccountId?: string | null; note?: string }) => {
      const { data: current, error: fetchErr } = await (supabase as any).from("payable_entries").select("*").eq("id", id).single();
      if (fetchErr) throw fetchErr;
      const newPaid = Number(current.paid_amount) + amount;
      const remaining = Number(current.amount) - newPaid;
      const newStatus = remaining <= 0 ? "paid" : "partial";
      const { error } = await (supabase as any).from("payable_entries").update({ paid_amount: newPaid, status: newStatus }).eq("id", id);
      if (error) throw error;
      // Insert payment history record
      await (supabase as any).from("payable_payment_history").insert({
        entry_id: id,
        date: new Date().toISOString().split("T")[0],
        amount,
        account_id: linkedAccountId || null,
        note: note || null,
      });
      if (linkedAccountId) await adjustBalance(linkedAccountId, -amount);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payable_entries"] });
      qc.invalidateQueries({ queryKey: ["payable_entries_all"] });
      qc.invalidateQueries({ queryKey: ["payable_books"] });
      qc.invalidateQueries({ queryKey: ["payable_payment_history"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Payment recorded");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
