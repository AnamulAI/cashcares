import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MohoranaAdjustment {
  id: string;
  user_id: string;
  record_id: string;
  adjusted_on: string;
  amount: number;
  reason: string | null;
  note: string | null;
  attachment_path: string | null;
  created_at: string;
  updated_at: string;
}

export type MohoranaAdjustmentInsert = Omit<MohoranaAdjustment, "id" | "user_id" | "created_at" | "updated_at">;

export function useMohoranaAdjustments(recordId?: string) {
  return useQuery({
    queryKey: ["mohorana_adjustments", recordId || "all"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      let q = (supabase as any)
        .from("mohorana_adjustments")
        .select("*")
        .eq("user_id", user.id)
        .order("adjusted_on", { ascending: false });
      if (recordId) q = q.eq("record_id", recordId);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as MohoranaAdjustment[];
    },
  });
}

export function useCreateMohoranaAdjustment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: MohoranaAdjustmentInsert) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await (supabase as any)
        .from("mohorana_adjustments")
        .insert({ ...p, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mohorana_adjustments"] });
      toast.success("Adjustment recorded");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateMohoranaAdjustment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MohoranaAdjustmentInsert> & { id: string }) => {
      const { data, error } = await (supabase as any)
        .from("mohorana_adjustments")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mohorana_adjustments"] });
      toast.success("Adjustment updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteMohoranaAdjustment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("mohorana_adjustments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mohorana_adjustments"] });
      toast.success("Adjustment deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
