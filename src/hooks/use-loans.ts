import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { adjustBalance } from "./_account-balance";

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

/**
 * Cash impact rules:
 *  - "borrowed" loan with linked account → +principal (cash IN)
 *  - "lent"     loan with linked account → -principal (cash OUT to other party)
 */
function principalSign(loanType: string): 1 | -1 {
  return loanType === "lent" ? -1 : 1;
}

export function useLoans() {
  return useQuery({
    queryKey: ["loans"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await (supabase as any)
        .from("loans")
        .select("*, linked_account:accounts!loans_linked_account_id_fkey(name)")
        .eq("user_id", user.id)
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
      if (l.linked_account_id && Number(l.principal_amount) > 0) {
        await adjustBalance(l.linked_account_id, principalSign(l.loan_type) * Number(l.principal_amount));
      }
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["loans"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Loan added");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateLoan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<LoanInsert> & { id: string }) => {
      const { data: current, error: fErr } = await (supabase as any)
        .from("loans").select("*").eq("id", id).single();
      if (fErr) throw fErr;

      const oldAcct = current.linked_account_id as string | null;
      const oldPrincipal = Number(current.principal_amount || 0);
      const oldType = current.loan_type as string;
      const newAcct = (updates.linked_account_id !== undefined ? updates.linked_account_id : oldAcct) as string | null;
      const newPrincipal = updates.principal_amount !== undefined ? Number(updates.principal_amount) : oldPrincipal;
      const newType = updates.loan_type !== undefined ? updates.loan_type : oldType;

      // Reverse old principal impact, apply new principal impact
      if (oldAcct && oldPrincipal > 0) await adjustBalance(oldAcct, -principalSign(oldType) * oldPrincipal);
      if (newAcct && newPrincipal > 0) await adjustBalance(newAcct, principalSign(newType) * newPrincipal);

      const { data, error } = await (supabase as any).from("loans").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["loans"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Loan updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteLoan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: current } = await (supabase as any)
        .from("loans").select("linked_account_id, principal_amount, paid_amount, loan_type").eq("id", id).single();
      const { error } = await (supabase as any).from("loans").delete().eq("id", id);
      if (error) throw error;
      if (current?.linked_account_id) {
        // Net cash that touched this account = principal - already-paid (repayments already moved cash)
        const principal = Number(current.principal_amount || 0);
        const paid = Number(current.paid_amount || 0);
        const net = principal - paid;
        if (net > 0) {
          await adjustBalance(current.linked_account_id, -principalSign(current.loan_type) * net);
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["loans"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Loan deleted");
    },
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
      // Repayment direction is opposite of principal direction:
      //  - borrowed loan → repayment moves cash OUT (-)
      //  - lent loan     → repayment received moves cash IN (+)
      if (linkedAccountId) await adjustBalance(linkedAccountId, -principalSign(current.loan_type) * amount);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["loans"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Repayment recorded");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
