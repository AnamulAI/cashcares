import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MohoranaPayment {
  id: string;
  user_id: string;
  record_id: string;
  paid_on: string;
  amount: number;
  account_id: string | null;
  payment_type: string;
  note: string | null;
  attachment_path: string | null;
  created_at: string;
  updated_at: string;
}

export type MohoranaPaymentInsert = Omit<MohoranaPayment, "id" | "user_id" | "created_at" | "updated_at">;

export function useMohoranaPayments(recordId?: string) {
  return useQuery({
    queryKey: ["mohorana_payments", recordId || "all"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      let q = (supabase as any)
        .from("mohorana_payments")
        .select("*, account:accounts!mohorana_payments_account_id_fkey(name)")
        .eq("user_id", user.id)
        .order("paid_on", { ascending: false });
      if (recordId) q = q.eq("record_id", recordId);
      const { data, error } = await q;
      if (error) {
        // fallback without join if FK alias is unknown
        const fallback = await (supabase as any)
          .from("mohorana_payments")
          .select("*")
          .eq("user_id", user.id)
          .order("paid_on", { ascending: false });
        if (fallback.error) throw fallback.error;
        return (fallback.data || []) as (MohoranaPayment & { account?: { name: string } | null })[];
      }
      return (data || []) as (MohoranaPayment & { account?: { name: string } | null })[];
    },
  });
}

export function useCreateMohoranaPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: MohoranaPaymentInsert) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await (supabase as any)
        .from("mohorana_payments")
        .insert({ ...p, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mohorana_payments"] });
      toast.success("Payment recorded");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateMohoranaPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MohoranaPaymentInsert> & { id: string }) => {
      const { data, error } = await (supabase as any)
        .from("mohorana_payments")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mohorana_payments"] });
      toast.success("Payment updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteMohoranaPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("mohorana_payments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mohorana_payments"] });
      toast.success("Payment deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
