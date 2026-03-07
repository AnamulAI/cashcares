import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DbPartnership {
  id: string;
  partnership_name: string;
  partner_name: string;
  your_contribution: number;
  partner_contribution: number;
  shared_expense_total: number;
  settlement_amount: number;
  start_date: string | null;
  note: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DbPartnershipEntry {
  id: string;
  partnership_id: string;
  entry_type: string;
  contributor: string | null;
  description: string | null;
  amount: number;
  date: string;
  note: string | null;
  created_at: string;
}

export type PartnershipInsert = Omit<DbPartnership, "id" | "created_at" | "updated_at">;

export function usePartnerships() {
  return useQuery({
    queryKey: ["partnerships"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await (supabase as any)
        .from("partnerships")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as DbPartnership[];
    },
  });
}

export function usePartnershipEntries(partnershipId?: string) {
  return useQuery({
    queryKey: ["partnership_entries", partnershipId],
    enabled: !!partnershipId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("partnership_entries")
        .select("*")
        .eq("partnership_id", partnershipId)
        .order("date", { ascending: false });
      if (error) throw error;
      return (data || []) as DbPartnershipEntry[];
    },
  });
}

export function useCreatePartnership() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: PartnershipInsert) => {
      const { data, error } = await (supabase as any).from("partnerships").insert(p).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["partnerships"] }); toast.success("Partnership added"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdatePartnership() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PartnershipInsert> & { id: string }) => {
      const { data, error } = await (supabase as any).from("partnerships").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["partnerships"] }); toast.success("Partnership updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeletePartnership() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("partnerships").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["partnerships"] }); toast.success("Partnership deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useCreatePartnershipEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ partnershipId, entry, field, amount }: {
      partnershipId: string;
      entry: Omit<DbPartnershipEntry, "id" | "created_at">;
      field: "your_contribution" | "partner_contribution" | "shared_expense_total" | "settlement_amount";
      amount: number;
    }) => {
      // Insert entry
      const { error: entryErr } = await (supabase as any).from("partnership_entries").insert(entry);
      if (entryErr) throw entryErr;
      // Update partnership total
      const { data: current, error: fetchErr } = await (supabase as any).from("partnerships").select("*").eq("id", partnershipId).single();
      if (fetchErr) throw fetchErr;
      const update: Record<string, number> = {};
      update[field] = Number(current[field]) + amount;
      const { error: updateErr } = await (supabase as any).from("partnerships").update(update).eq("id", partnershipId);
      if (updateErr) throw updateErr;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["partnerships"] });
      qc.invalidateQueries({ queryKey: ["partnership_entries"] });
      toast.success("Entry recorded");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
