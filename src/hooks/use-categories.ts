import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DbCategory {
  id: string;
  name: string;
  group: string;
  icon: string | null;
  color: string;
  parent_id: string | null;
  is_subcategory: boolean;
  description: string | null;
  usage_count: number;
  is_active: boolean;
  usable_in_budgets: boolean;
  created_at: string;
  updated_at: string;
}

export type CategoryInsert = Omit<DbCategory, "id" | "created_at" | "updated_at" | "usage_count">;
export type CategoryUpdate = Partial<CategoryInsert>;

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as DbCategory[];
    },
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (cat: CategoryInsert) => {
      const { data, error } = await supabase.from("categories").insert(cat).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category created successfully");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: CategoryUpdate & { id: string }) => {
      const { data, error } = await supabase.from("categories").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
