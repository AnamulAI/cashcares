import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DbAsset {
  id: string;
  asset_name: string;
  asset_type: string;
  purchase_value: number;
  current_value: number;
  acquisition_date: string | null;
  linked_account_id: string | null;
  note: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export type AssetInsert = Omit<DbAsset, "id" | "created_at" | "updated_at">;

export function useAssets() {
  return useQuery({
    queryKey: ["assets"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("assets")
        .select("*, linked_account:accounts!assets_linked_account_id_fkey(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as (DbAsset & { linked_account: { name: string } | null })[];
    },
  });
}

export function useCreateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (a: AssetInsert) => {
      const { data, error } = await (supabase as any).from("assets").insert(a).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["assets"] }); toast.success("Asset added"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AssetInsert> & { id: string }) => {
      const { data, error } = await (supabase as any).from("assets").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["assets"] }); toast.success("Asset updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("assets").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["assets"] }); toast.success("Asset deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });
}
