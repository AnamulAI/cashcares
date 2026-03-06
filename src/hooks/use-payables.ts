import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DbPayable {
  id: string;
  person_name: string;
  reason: string | null;
  total_amount: number;
  paid_amount: number;
  due_date: string | null;
  linked_account_id: string | null;
  note: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export type PayableInsert = Omit<DbPayable, "id" | "created_at" | "updated_at">;

async function adjustBalance(accountId: string, amount: number) {
  const { data } = await supabase.from("accounts").select("balance").eq("id", accountId).single();
  if (data) await supabase.from("accounts").update({ balance: Number(data.balance) + amount }).eq("id", accountId);
}

export function usePayables() {
  return useQuery({
    queryKey: ["payables"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("payables")
        .select("*, linked_account:accounts!payables_linked_account_id_fkey(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as (DbPayable & { linked_account: { name: string } | null })[];
    },
  });
}

export function useCreatePayable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: PayableInsert) => {
      const { data, error } = await (supabase as any).from("payables").insert(p).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["payables"] }); toast.success("Payable added"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdatePayable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PayableInsert> & { id: string }) => {
      const { data, error } = await (supabase as any).from("payables").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["payables"] }); toast.success("Payable updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeletePayable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("payables").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["payables"] }); toast.success("Payable deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRecordPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, amount, linkedAccountId }: { id: string; amount: number; linkedAccountId?: string | null }) => {
      const { data: current, error: fetchErr } = await (supabase as any).from("payables").select("*").eq("id", id).single();
      if (fetchErr) throw fetchErr;
      const newPaid = Number(current.paid_amount) + amount;
      const remaining = Number(current.total_amount) - newPaid;
      const newStatus = remaining <= 0 ? "paid" : "partial";
      const { error } = await (supabase as any).from("payables").update({ paid_amount: newPaid, status: newStatus }).eq("id", id);
      if (error) throw error;
      if (linkedAccountId) await adjustBalance(linkedAccountId, -amount);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payables"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Payment recorded");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
