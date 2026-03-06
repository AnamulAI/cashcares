import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
      const { data, error } = await (supabase as any)
        .from("investments")
        .select("*, linked_account:accounts!investments_linked_account_id_fkey(name)")
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
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["investments"] }); toast.success("Investment added"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateInvestment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<InvestmentInsert> & { id: string }) => {
      const { data, error } = await (supabase as any).from("investments").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["investments"] }); toast.success("Investment updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteInvestment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("investments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["investments"] }); toast.success("Investment deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });
}
