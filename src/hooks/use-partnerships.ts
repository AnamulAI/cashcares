import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DbPartnership {
  id: string;
  partnership_name: string;
  partner_name: string;
  partner_1_name: string | null;
  partner_2_name: string | null;
  partner_1_share: number;
  partner_2_share: number;
  your_contribution: number;
  partner_contribution: number;
  shared_expense_total: number;
  settlement_amount: number;
  total_capital: number;
  total_withdrawn: number;
  total_profit_distributed: number;
  total_reinvested: number;
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
  linked_account_id: string | null;
  created_at: string;
}

export interface PartnershipInsert {
  partnership_name: string;
  partner_name: string;
  partner_1_name: string;
  partner_2_name: string;
  partner_1_share: number;
  partner_2_share: number;
  start_date?: string | null;
  note?: string | null;
  status: string;
}

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

export function usePartnership(id?: string) {
  return useQuery({
    queryKey: ["partnerships", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("partnerships")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as DbPartnership;
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
      const { data, error } = await (supabase as any).from("partnerships").insert({
        ...p,
        your_contribution: 0,
        partner_contribution: 0,
        shared_expense_total: 0,
        settlement_amount: 0,
        total_capital: 0,
        total_withdrawn: 0,
        total_profit_distributed: 0,
        total_reinvested: 0,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["partnerships"] }); toast.success("Partnership created"); },
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
      // Delete entries first
      await (supabase as any).from("partnership_entries").delete().eq("partnership_id", id);
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
    mutationFn: async ({ partnershipId, entry }: {
      partnershipId: string;
      entry: Omit<DbPartnershipEntry, "id" | "created_at">;
    }) => {
      // Insert entry
      const { error: entryErr } = await (supabase as any).from("partnership_entries").insert(entry);
      if (entryErr) throw entryErr;

      // Recalculate partnership totals from entries
      const { data: allEntries, error: fetchErr } = await (supabase as any)
        .from("partnership_entries")
        .select("*")
        .eq("partnership_id", partnershipId);
      if (fetchErr) throw fetchErr;

      const { data: partnership } = await (supabase as any)
        .from("partnerships")
        .select("partner_1_name, partner_2_name")
        .eq("id", partnershipId)
        .single();

      const p1Name = partnership?.partner_1_name || "";
      const p2Name = partnership?.partner_2_name || "";

      let p1Contribution = 0, p2Contribution = 0, totalWithdrawn = 0, totalProfitDist = 0, totalReinvested = 0;

      for (const e of allEntries) {
        const amt = Number(e.amount);
        const isP1 = e.contributor === p1Name;
        if (e.entry_type === "initial_invest" || e.entry_type === "new_invest") {
          if (isP1) p1Contribution += amt; else p2Contribution += amt;
        } else if (e.entry_type === "withdraw") {
          totalWithdrawn += amt;
        } else if (e.entry_type === "profit_distribution") {
          totalProfitDist += amt;
        } else if (e.entry_type === "reinvest") {
          totalReinvested += amt;
        }
      }

      const totalCapital = p1Contribution + p2Contribution + totalReinvested - totalWithdrawn;

      const { error: updateErr } = await (supabase as any).from("partnerships").update({
        your_contribution: p1Contribution,
        partner_contribution: p2Contribution,
        total_capital: totalCapital,
        total_withdrawn: totalWithdrawn,
        total_profit_distributed: totalProfitDist,
        total_reinvested: totalReinvested,
      }).eq("id", partnershipId);
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

export function useDeletePartnershipEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ entryId, partnershipId }: { entryId: string; partnershipId: string }) => {
      const { error: delErr } = await (supabase as any).from("partnership_entries").delete().eq("id", entryId);
      if (delErr) throw delErr;

      // Recalculate
      const { data: allEntries } = await (supabase as any)
        .from("partnership_entries")
        .select("*")
        .eq("partnership_id", partnershipId);

      const { data: partnership } = await (supabase as any)
        .from("partnerships")
        .select("partner_1_name, partner_2_name")
        .eq("id", partnershipId)
        .single();

      const p1Name = partnership?.partner_1_name || "";
      let p1Contribution = 0, p2Contribution = 0, totalWithdrawn = 0, totalProfitDist = 0, totalReinvested = 0;

      for (const e of (allEntries || [])) {
        const amt = Number(e.amount);
        const isP1 = e.contributor === p1Name;
        if (e.entry_type === "initial_invest" || e.entry_type === "new_invest") {
          if (isP1) p1Contribution += amt; else p2Contribution += amt;
        } else if (e.entry_type === "withdraw") {
          totalWithdrawn += amt;
        } else if (e.entry_type === "profit_distribution") {
          totalProfitDist += amt;
        } else if (e.entry_type === "reinvest") {
          totalReinvested += amt;
        }
      }

      const totalCapital = p1Contribution + p2Contribution + totalReinvested - totalWithdrawn;

      await (supabase as any).from("partnerships").update({
        your_contribution: p1Contribution,
        partner_contribution: p2Contribution,
        total_capital: totalCapital,
        total_withdrawn: totalWithdrawn,
        total_profit_distributed: totalProfitDist,
        total_reinvested: totalReinvested,
      }).eq("id", partnershipId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["partnerships"] });
      qc.invalidateQueries({ queryKey: ["partnership_entries"] });
      toast.success("Entry deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
