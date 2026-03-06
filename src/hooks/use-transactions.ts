import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DbTransaction {
  id: string;
  type: string;
  category_id: string | null;
  account_id: string;
  to_account_id: string | null;
  amount: number;
  date: string;
  note: string | null;
  tags: string[] | null;
  status: string;
  transfer_fee: number | null;
  created_at: string;
  updated_at: string;
}

export type TransactionInsert = Omit<DbTransaction, "id" | "created_at" | "updated_at">;

export function useTransactions() {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*, account:accounts!transactions_account_id_fkey(name), to_account:accounts!transactions_to_account_id_fkey(name), category:categories!transactions_category_id_fkey(name, group)")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (txn: TransactionInsert) => {
      // Insert transaction
      const { data, error } = await supabase.from("transactions").insert(txn).select().single();
      if (error) throw error;

      // Update account balances
      if (txn.type === "income") {
        await supabase.rpc("increment_balance" as any, { account_uuid: txn.account_id, amount_val: txn.amount });
      } else if (txn.type === "expense") {
        await supabase.rpc("increment_balance" as any, { account_uuid: txn.account_id, amount_val: -txn.amount });
      } else if (txn.type === "transfer") {
        await supabase.rpc("increment_balance" as any, { account_uuid: txn.account_id, amount_val: -(txn.amount + (txn.transfer_fee || 0)) });
        if (txn.to_account_id) {
          await supabase.rpc("increment_balance" as any, { account_uuid: txn.to_account_id, amount_val: txn.amount });
        }
      }

      // Increment category usage count
      if (txn.category_id) {
        await supabase.rpc("increment_usage" as any, { cat_uuid: txn.category_id });
      }

      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Transaction saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (txn: { id: string; type: string; amount: number; account_id: string; to_account_id?: string | null; transfer_fee?: number | null; category_id?: string | null }) => {
      // Reverse balance impact
      if (txn.type === "income") {
        await supabase.rpc("increment_balance" as any, { account_uuid: txn.account_id, amount_val: -txn.amount });
      } else if (txn.type === "expense") {
        await supabase.rpc("increment_balance" as any, { account_uuid: txn.account_id, amount_val: txn.amount });
      } else if (txn.type === "transfer") {
        await supabase.rpc("increment_balance" as any, { account_uuid: txn.account_id, amount_val: txn.amount + (txn.transfer_fee || 0) });
        if (txn.to_account_id) {
          await supabase.rpc("increment_balance" as any, { account_uuid: txn.to_account_id, amount_val: -txn.amount });
        }
      }

      const { error } = await supabase.from("transactions").delete().eq("id", txn.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Transaction deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
