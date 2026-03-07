import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DbReminder {
  id: string;
  title: string;
  reminder_type: string;
  due_date: string;
  related_entity_id: string | null;
  related_module: string | null;
  priority: string;
  note: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export type ReminderInsert = Omit<DbReminder, "id" | "created_at" | "updated_at">;

export function useReminders() {
  return useQuery({
    queryKey: ["reminders"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await (supabase as any)
        .from("reminders")
        .select("*")
        .eq("user_id", user.id)
        .order("due_date", { ascending: true });
      if (error) throw error;
      return (data || []) as DbReminder[];
    },
  });
}

export function useCreateReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (r: ReminderInsert) => {
      const { data, error } = await (supabase as any).from("reminders").insert(r).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reminders"] }); toast.success("Reminder added"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ReminderInsert> & { id: string }) => {
      const { data, error } = await (supabase as any).from("reminders").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reminders"] }); toast.success("Reminder updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("reminders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reminders"] }); toast.success("Reminder deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });
}
