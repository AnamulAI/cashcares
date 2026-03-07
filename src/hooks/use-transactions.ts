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

async function adjustBalance(accountId: string, amount: number) {
  const { data } = await supabase.from("accounts").select("balance").eq("id", accountId).single();
  if (data) {
    await supabase.from("accounts").update({ balance: Number(data.balance) + amount }).eq("id", accountId);
  }
}

async function incrementUsage(categoryId: string) {
  const { data } = await supabase.from("categories").select("usage_count").eq("id", categoryId).single();
  if (data) {
    await supabase.from("categories").update({ usage_count: (data.usage_count || 0) + 1 }).eq("id", categoryId);
  }
}

export function useTransactions() {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("transactions")
        .select("*, account:accounts!transactions_account_id_fkey(name), to_account:accounts!transactions_to_account_id_fkey(name), category:categories!transactions_category_id_fkey(name, group)")
        .eq("user_id", user.id)
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
      const { data, error } = await supabase.from("transactions").insert(txn).select().single();
      if (error) throw error;

      // Update account balances
      if (txn.type === "income") {
        await adjustBalance(txn.account_id, txn.amount);
      } else if (txn.type === "expense") {
        await adjustBalance(txn.account_id, -txn.amount);
      } else if (txn.type === "transfer") {
        await adjustBalance(txn.account_id, -(txn.amount + (txn.transfer_fee || 0)));
        if (txn.to_account_id) {
          await adjustBalance(txn.to_account_id, txn.amount);
        }
      }

      if (txn.category_id) {
        await incrementUsage(txn.category_id);
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
        await adjustBalance(txn.account_id, -txn.amount);
      } else if (txn.type === "expense") {
        await adjustBalance(txn.account_id, txn.amount);
      } else if (txn.type === "transfer") {
        await adjustBalance(txn.account_id, txn.amount + (txn.transfer_fee || 0));
        if (txn.to_account_id) {
          await adjustBalance(txn.to_account_id, -txn.amount);
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
