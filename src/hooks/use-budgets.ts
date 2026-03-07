import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DbBudget {
  id: string;
  category_id: string;
  allocated_amount: number;
  alert_threshold: number;
  period_type: string;
  start_date: string;
  note: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type BudgetInsert = Omit<DbBudget, "id" | "created_at" | "updated_at">;
export type BudgetUpdate = Partial<BudgetInsert>;

export function useBudgets() {
  return useQuery({
    queryKey: ["budgets"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await (supabase as any)
        .from("budgets")
        .select("*, category:categories!budgets_category_id_fkey(name, icon, color, group)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []) as (DbBudget & { category: { name: string; icon: string | null; color: string; group: string } })[];
    },
  });
}

export function useCreateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (budget: BudgetInsert) => {
      const { data, error } = await (supabase as any).from("budgets").insert(budget).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Budget created successfully");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: BudgetUpdate & { id: string }) => {
      const { data, error } = await (supabase as any).from("budgets").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Budget updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("budgets").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Budget deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
