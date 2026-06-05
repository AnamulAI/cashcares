import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MohoranaRecord {
  id: string;
  user_id: string;
  spouse_name: string;
  marriage_date: string | null;
  currency: string;
  total_amount: number;
  muajjal_amount: number;
  muakhkhar_amount: number;
  note: string | null;
  attachment_path: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export type MohoranaRecordInsert = Omit<MohoranaRecord, "id" | "user_id" | "created_at" | "updated_at">;

export function useMohoranaRecords() {
  return useQuery({
    queryKey: ["mohorana_records"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await (supabase as any)
        .from("mohorana_records")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as MohoranaRecord[];
    },
  });
}

export function useCreateMohoranaRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: MohoranaRecordInsert) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await (supabase as any)
        .from("mohorana_records")
        .insert({ ...p, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mohorana_records"] });
      toast.success("Record saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateMohoranaRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MohoranaRecordInsert> & { id: string }) => {
      const { data, error } = await (supabase as any)
        .from("mohorana_records")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mohorana_records"] });
      toast.success("Record updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteMohoranaRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("mohorana_records").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mohorana_records"] });
      qc.invalidateQueries({ queryKey: ["mohorana_payments"] });
      toast.success("Record deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
