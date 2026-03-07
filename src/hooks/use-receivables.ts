import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DbReceivable {
  id: string;
  person_name: string;
  reason: string | null;
  total_amount: number;
  received_amount: number;
  due_date: string | null;
  linked_account_id: string | null;
  note: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export type ReceivableInsert = Omit<DbReceivable, "id" | "created_at" | "updated_at">;

async function adjustBalance(accountId: string, amount: number) {
  const { data } = await supabase.from("accounts").select("balance").eq("id", accountId).single();
  if (data) {
    await supabase.from("accounts").update({ balance: Number(data.balance) + amount }).eq("id", accountId);
  }
}

export function useReceivables() {
  return useQuery({
    queryKey: ["receivables"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await (supabase as any)
        .from("receivables")
        .select("*, linked_account:accounts!receivables_linked_account_id_fkey(name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as (DbReceivable & { linked_account: { name: string } | null })[];
    },
  });
}

export function useCreateReceivable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (r: ReceivableInsert) => {
      const { data, error } = await (supabase as any).from("receivables").insert(r).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["receivables"] }); toast.success("Receivable added"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateReceivable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ReceivableInsert> & { id: string }) => {
      const { data, error } = await (supabase as any).from("receivables").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["receivables"] }); toast.success("Receivable updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteReceivable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("receivables").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["receivables"] }); toast.success("Receivable deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRecordCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, amount, linkedAccountId }: { id: string; amount: number; linkedAccountId?: string | null }) => {
      const { data: current, error: fetchErr } = await (supabase as any).from("receivables").select("*").eq("id", id).single();
      if (fetchErr) throw fetchErr;
      const newReceived = Number(current.received_amount) + amount;
      const remaining = Number(current.total_amount) - newReceived;
      const newStatus = remaining <= 0 ? "collected" : "partial";
      const { error } = await (supabase as any).from("receivables").update({ received_amount: newReceived, status: newStatus }).eq("id", id);
      if (error) throw error;
      if (linkedAccountId) await adjustBalance(linkedAccountId, amount);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["receivables"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Collection recorded");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
