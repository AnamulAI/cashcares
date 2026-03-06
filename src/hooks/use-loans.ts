import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DbLoan {
  id: string;
  lender_name: string;
  loan_type: string;
  principal_amount: number;
  paid_amount: number;
  due_date: string | null;
  installment_amount: number | null;
  interest_rate: number | null;
  linked_account_id: string | null;
  note: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export type LoanInsert = Omit<DbLoan, "id" | "created_at" | "updated_at">;

async function adjustBalance(accountId: string, amount: number) {
  const { data } = await supabase.from("accounts").select("balance").eq("id", accountId).single();
  if (data) await supabase.from("accounts").update({ balance: Number(data.balance) + amount }).eq("id", accountId);
}

export function useLoans() {
  return useQuery({
    queryKey: ["loans"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("loans")
        .select("*, linked_account:accounts!loans_linked_account_id_fkey(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as (DbLoan & { linked_account: { name: string } | null })[];
    },
  });
}

export function useCreateLoan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (l: LoanInsert) => {
      const { data, error } = await (supabase as any).from("loans").insert(l).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["loans"] }); toast.success("Loan added"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateLoan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<LoanInsert> & { id: string }) => {
      const { data, error } = await (supabase as any).from("loans").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["loans"] }); toast.success("Loan updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteLoan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("loans").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["loans"] }); toast.success("Loan deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRecordRepayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, amount, linkedAccountId }: { id: string; amount: number; linkedAccountId?: string | null }) => {
      const { data: current, error: fetchErr } = await (supabase as any).from("loans").select("*").eq("id", id).single();
      if (fetchErr) throw fetchErr;
      const newPaid = Number(current.paid_amount) + amount;
      const remaining = Number(current.principal_amount) - newPaid;
      const newStatus = remaining <= 0 ? "paid_off" : "partial";
      const { error } = await (supabase as any).from("loans").update({ paid_amount: newPaid, status: newStatus }).eq("id", id);
      if (error) throw error;
      if (linkedAccountId) await adjustBalance(linkedAccountId, -amount);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["loans"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Repayment recorded");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
