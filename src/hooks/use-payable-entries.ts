import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { adjustBalance } from "./_account-balance";

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await (supabase as any)
        .from("payable_entries")
        .select("*")
        .eq("user_id", user.id)
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
      // Apply paid_amount outflow on linked account (money paid out)
      const paid = Number(e.paid_amount || 0);
      if (e.linked_account_id && paid > 0) {
        await adjustBalance(e.linked_account_id, -paid);
      }
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["payable_entries", vars.book_id] });
      qc.invalidateQueries({ queryKey: ["payable_entries_all"] });
      qc.invalidateQueries({ queryKey: ["payable_books"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Entry added");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdatePayableEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PayableEntryInsert> & { id: string }) => {
      const { data: current, error: fErr } = await (supabase as any)
        .from("payable_entries").select("*").eq("id", id).single();
      if (fErr) throw fErr;

      const oldAcct = current.linked_account_id as string | null;
      const oldPaid = Number(current.paid_amount || 0);
      const newAcct = (updates.linked_account_id !== undefined ? updates.linked_account_id : oldAcct) as string | null;
      const newPaid = updates.paid_amount !== undefined ? Number(updates.paid_amount) : oldPaid;

      // Reverse old outflow (+) then apply new outflow (-)
      if (oldAcct && oldPaid > 0) await adjustBalance(oldAcct, oldPaid);
      if (newAcct && newPaid > 0) await adjustBalance(newAcct, -newPaid);

      const { data, error } = await (supabase as any).from("payable_entries").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payable_entries"] });
      qc.invalidateQueries({ queryKey: ["payable_entries_all"] });
      qc.invalidateQueries({ queryKey: ["payable_books"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Entry updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeletePayableEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: current } = await (supabase as any)
        .from("payable_entries").select("linked_account_id, paid_amount").eq("id", id).single();
      const { error } = await (supabase as any).from("payable_entries").delete().eq("id", id);
      if (error) throw error;
      if (current?.linked_account_id && Number(current.paid_amount) > 0) {
        // Reverse the outflow → refund balance
        await adjustBalance(current.linked_account_id, Number(current.paid_amount));
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payable_entries"] });
      qc.invalidateQueries({ queryKey: ["payable_entries_all"] });
      qc.invalidateQueries({ queryKey: ["payable_books"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Entry deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
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
