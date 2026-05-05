import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { adjustBalance } from "./_account-balance";

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await (supabase as any)
        .from("assets")
        .select("*, linked_account:accounts!assets_linked_account_id_fkey(name)")
        .eq("user_id", user.id)
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
      // Asset adds value to linked account
      if (a.linked_account_id && Number(a.purchase_value) > 0 && a.status !== 'sold') {
        await adjustBalance(a.linked_account_id, Number(a.purchase_value));
      }
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assets"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Asset added");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AssetInsert> & { id: string }) => {
      const { data: current, error: fErr } = await (supabase as any)
        .from("assets").select("*").eq("id", id).single();
      if (fErr) throw fErr;

      const oldAcct = current.linked_account_id as string | null;
      const oldPv = Number(current.purchase_value || 0);
      const oldStatus = current.status;
      
      const newAcct = (updates.linked_account_id !== undefined ? updates.linked_account_id : oldAcct) as string | null;
      const newPv = updates.purchase_value !== undefined ? Number(updates.purchase_value) : oldPv;
      const newStatus = updates.status !== undefined ? updates.status : oldStatus;

      // Reverse old effect if it was added
      if (oldAcct && oldPv > 0 && oldStatus !== 'sold') {
        await adjustBalance(oldAcct, -oldPv);
      }
      
      // Apply new effect if it is active/not sold
      if (newAcct && newPv > 0 && newStatus !== 'sold') {
        await adjustBalance(newAcct, newPv);
      }

      const { data, error } = await (supabase as any).from("assets").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assets"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Asset updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: current } = await (supabase as any)
        .from("assets").select("linked_account_id, purchase_value, status").eq("id", id).single();
      const { error } = await (supabase as any).from("assets").delete().eq("id", id);
      if (error) throw error;
      // Remove value from linked account if it was added
      if (current?.linked_account_id && Number(current.purchase_value) > 0 && current.status !== 'sold') {
        await adjustBalance(current.linked_account_id, -Number(current.purchase_value));
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assets"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Asset deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

