import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SavingsPlan {
  id: string;
  user_id: string;
  plan_name: string;
  recipient_name: string | null;
  plan_type: "fixed" | "open";
  installment_amount: number;
  frequency: "monthly" | "weekly" | "quarterly";
  duration_months: number | null;
  target_amount: number;
  start_date: string;
  maturity_date: string | null;
  total_saved: number;
  status: "active" | "completed" | "paused";
  note: string | null;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface SavingsInstallment {
  id: string;
  user_id: string;
  plan_id: string;
  due_date: string;
  amount: number;
  status: "pending" | "paid" | "overdue";
  paid_date: string | null;
  paid_amount: number;
  linked_account_id: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export type NewPlanInput = {
  plan_name: string;
  recipient_name?: string;
  plan_type: "fixed" | "open";
  installment_amount: number;
  frequency: "monthly" | "weekly" | "quarterly";
  duration_months?: number;
  start_date: string;
  note?: string;
};

function addPeriod(dateStr: string, freq: string, n: number): string {
  const d = new Date(dateStr);
  if (freq === "weekly") d.setDate(d.getDate() + 7 * n);
  else if (freq === "quarterly") d.setMonth(d.getMonth() + 3 * n);
  else d.setMonth(d.getMonth() + n);
  return d.toISOString().slice(0, 10);
}

export function useSavingsPlans() {
  return useQuery({
    queryKey: ["savings_plans"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await (supabase as any)
        .from("savings_plans").select("*").eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as SavingsPlan[];
    },
  });
}

export function useSavingsInstallments(planId?: string) {
  return useQuery({
    queryKey: ["savings_installments", planId],
    enabled: !!planId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("savings_installments").select("*").eq("plan_id", planId)
        .order("due_date", { ascending: true });
      if (error) throw error;
      const today = new Date().toISOString().slice(0, 10);
      return ((data || []) as SavingsInstallment[]).map(i =>
        i.status === "pending" && i.due_date < today ? { ...i, status: "overdue" as const } : i
      );
    },
  });
}

export function useAllInstallments() {
  return useQuery({
    queryKey: ["savings_installments_all"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await (supabase as any)
        .from("savings_installments").select("*").eq("user_id", user.id);
      if (error) throw error;
      return (data || []) as SavingsInstallment[];
    },
  });
}

export function useCreateSavingsPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewPlanInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const isFixed = input.plan_type === "fixed";
      const months = input.duration_months || 0;
      const target = isFixed ? input.installment_amount * months : 0;
      const maturity = isFixed && months > 0 ? addPeriod(input.start_date, input.frequency, months) : null;

      const { data: plan, error } = await (supabase as any).from("savings_plans").insert({
        user_id: user.id,
        plan_name: input.plan_name,
        recipient_name: input.recipient_name || null,
        plan_type: input.plan_type,
        installment_amount: input.installment_amount,
        frequency: input.frequency,
        duration_months: isFixed ? months : null,
        target_amount: target,
        start_date: input.start_date,
        maturity_date: maturity,
        note: input.note || null,
      }).select().single();
      if (error) throw error;

      // Generate installments
      const count = isFixed ? months : 12; // open: seed first 12 periods
      const rows = Array.from({ length: count }, (_, i) => ({
        user_id: user.id,
        plan_id: plan.id,
        due_date: addPeriod(input.start_date, input.frequency, i),
        amount: input.installment_amount,
      }));
      if (rows.length > 0) {
        const { error: ie } = await (supabase as any).from("savings_installments").insert(rows);
        if (ie) throw ie;
      }
      return plan;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["savings_plans"] });
      qc.invalidateQueries({ queryKey: ["savings_installments_all"] });
      toast.success("Savings plan created");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateSavingsPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SavingsPlan> & { id: string }) => {
      const { data, error } = await (supabase as any).from("savings_plans").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["savings_plans"] });
      toast.success("Plan updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteSavingsPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("savings_plans").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["savings_plans"] });
      qc.invalidateQueries({ queryKey: ["savings_installments_all"] });
      toast.success("Plan deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useMarkInstallmentPaid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      installment: SavingsInstallment;
      paid_date: string;
      paid_amount: number;
      linked_account_id?: string | null;
      note?: string;
    }) => {
      const { installment, paid_date, paid_amount, linked_account_id, note } = params;

      // Update installment
      const { error: ue } = await (supabase as any).from("savings_installments").update({
        status: "paid",
        paid_date,
        paid_amount,
        linked_account_id: linked_account_id || null,
        note: note || null,
      }).eq("id", installment.id);
      if (ue) throw ue;

      // Deduct from account if linked
      if (linked_account_id) {
        const { data: acct, error: ae } = await (supabase as any)
          .from("accounts").select("balance").eq("id", linked_account_id).single();
        if (ae) throw ae;
        const newBal = Number(acct.balance) - paid_amount;
        const { error: be } = await (supabase as any)
          .from("accounts").update({ balance: newBal }).eq("id", linked_account_id);
        if (be) throw be;
      }

      // Update plan total_saved & status
      const { data: plan } = await (supabase as any)
        .from("savings_plans").select("*").eq("id", installment.plan_id).single();
      if (plan) {
        const newTotal = Number(plan.total_saved) + paid_amount;
        const updates: any = { total_saved: newTotal };
        if (plan.plan_type === "fixed" && plan.target_amount > 0 && newTotal >= plan.target_amount) {
          updates.status = "completed";
        }
        await (supabase as any).from("savings_plans").update(updates).eq("id", plan.id);
      }
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["savings_plans"] });
      qc.invalidateQueries({ queryKey: ["savings_installments", vars.installment.plan_id] });
      qc.invalidateQueries({ queryKey: ["savings_installments_all"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Installment marked paid");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
