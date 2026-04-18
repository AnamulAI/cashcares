import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PayableBook {
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

export type PayableBookInsert = Omit<PayableBook, "id" | "user_id" | "created_at" | "updated_at">;

export function usePayableBooks() {
  return useQuery({
    queryKey: ["payable_books"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await (supabase as any)
        .from("payable_books")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as PayableBook[];
    },
  });
}

export function usePayableBook(id: string | undefined) {
  return useQuery({
    queryKey: ["payable_books", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("payable_books")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as PayableBook;
    },
  });
}

export function useCreatePayableBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (b: PayableBookInsert) => {
      const { data, error } = await (supabase as any).from("payable_books").insert(b).select().single();
      if (error) throw error;
      return data as PayableBook;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["payable_books"] }); toast.success("Payable book created"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdatePayableBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PayableBookInsert> & { id: string }) => {
      const { data, error } = await (supabase as any).from("payable_books").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["payable_books"] }); toast.success("Book updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeletePayableBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("payable_books").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payable_books"] });
      qc.invalidateQueries({ queryKey: ["payable_entries"] });
      qc.invalidateQueries({ queryKey: ["payable_entries_all"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Book deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
