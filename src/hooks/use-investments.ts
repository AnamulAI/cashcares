import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { adjustBalance } from "./_account-balance";

export interface DbInvestment {
  id: string;
  investment_name: string;
  investment_type: string;
  invested_amount: number;
  current_value: number;
  start_date: string | null;
  linked_account_id: string | null;
  note: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export type InvestmentInsert = Omit<DbInvestment, "id" | "created_at" | "updated_at">;

export function useInvestments() {
  return useQuery({
    queryKey: ["investments"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await (supabase as any)
        .from("investments")
        .select("*, linked_account:accounts!investments_linked_account_id_fkey(name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as (DbInvestment & { linked_account: { name: string } | null })[];
    },
  });
}

export function useCreateInvestment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (inv: InvestmentInsert) => {
      const { data, error } = await (supabase as any).from("investments").insert(inv).select().single();
      if (error) throw error;
      // Investing = cash OUT from linked account
      if (inv.linked_account_id && Number(inv.invested_amount) > 0) {
        await adjustBalance(inv.linked_account_id, -Number(inv.invested_amount));
      }
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["investments"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Investment added");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateInvestment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<InvestmentInsert> & { id: string }) => {
      const { data: current, error: fErr } = await (supabase as any)
        .from("investments").select("*").eq("id", id).single();
      if (fErr) throw fErr;

      const oldAcct = current.linked_account_id as string | null;
      const oldInv = Number(current.invested_amount || 0);
      const newAcct = (updates.linked_account_id !== undefined ? updates.linked_account_id : oldAcct) as string | null;
      const newInv = updates.invested_amount !== undefined ? Number(updates.invested_amount) : oldInv;

      if (oldAcct && oldInv > 0) await adjustBalance(oldAcct, oldInv);
      if (newAcct && newInv > 0) await adjustBalance(newAcct, -newInv);

      const { data, error } = await (supabase as any).from("investments").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["investments"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Investment updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteInvestment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: current } = await (supabase as any)
        .from("investments").select("linked_account_id, invested_amount").eq("id", id).single();
      const { error } = await (supabase as any).from("investments").delete().eq("id", id);
      if (error) throw error;
      if (current?.linked_account_id && Number(current.invested_amount) > 0) {
        await adjustBalance(current.linked_account_id, Number(current.invested_amount));
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["investments"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Investment deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
