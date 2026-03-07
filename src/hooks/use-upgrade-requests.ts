import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UpgradeRequest {
  id: string;
  user_id: string;
  requested_plan: string;
  current_plan: string;
  status: string;
  note: string | null;
  admin_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useMyUpgradeRequests() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["upgrade-requests", "mine", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("upgrade_requests" as any)
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as UpgradeRequest[];
    },
    enabled: !!user,
  });
}

export function useAllUpgradeRequests() {
  return useQuery({
    queryKey: ["upgrade-requests", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("upgrade_requests" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as UpgradeRequest[];
    },
  });
}

export function useSubmitUpgradeRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { requested_plan: string; current_plan: string; note?: string }) => {
      const { error } = await supabase
        .from("upgrade_requests" as any)
        .insert({
          requested_plan: params.requested_plan,
          current_plan: params.current_plan,
          note: params.note || null,
        } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["upgrade-requests"] });
    },
  });
}

export function useReviewUpgradeRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: string; status: "approved" | "rejected"; admin_note?: string; reviewed_by: string }) => {
      const { error } = await supabase
        .from("upgrade_requests" as any)
        .update({
          status: params.status,
          admin_note: params.admin_note || null,
          reviewed_by: params.reviewed_by,
          reviewed_at: new Date().toISOString(),
        } as any)
        .eq("id", params.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["upgrade-requests"] });
    },
  });
}
