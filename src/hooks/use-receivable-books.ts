import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ReceivableBook {
  id: string;
  user_id: string;
  person_name: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  status: string;
  opening_balance: number;
  created_at: string;
  updated_at: string;
}

export type ReceivableBookInsert = Omit<ReceivableBook, "id" | "user_id" | "created_at" | "updated_at">;

export function useReceivableBooks() {
  return useQuery({
    queryKey: ["receivable_books"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await (supabase as any)
        .from("receivable_books")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as ReceivableBook[];
    },
  });
}

export function useReceivableBook(id: string | undefined) {
  return useQuery({
    queryKey: ["receivable_books", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("receivable_books")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as ReceivableBook;
    },
  });
}

export function useCreateReceivableBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (b: ReceivableBookInsert) => {
      const { data, error } = await (supabase as any).from("receivable_books").insert(b).select().single();
      if (error) throw error;
      return data as ReceivableBook;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["receivable_books"] }); toast.success("Receivable book created"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateReceivableBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ReceivableBookInsert> & { id: string }) => {
      const { data, error } = await (supabase as any).from("receivable_books").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["receivable_books"] }); toast.success("Book updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteReceivableBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("receivable_books").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["receivable_books"] }); toast.success("Book deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });
}
