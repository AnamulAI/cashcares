import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Direction = "receivable-to-payable" | "payable-to-receivable";

export function useMoveBook() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookId, direction }: { bookId: string; direction: Direction }) => {
      if (direction === "receivable-to-payable") {
        // 1. Fetch book
        const { data: book, error: bErr } = await (supabase as any)
          .from("receivable_books").select("*").eq("id", bookId).single();
        if (bErr) throw bErr;

        // 2. Create payable book
        const { data: newBook, error: nbErr } = await (supabase as any)
          .from("payable_books").insert({
            person_name: book.person_name,
            description: book.description,
            phone: book.phone,
            email: book.email,
            status: book.status,
            opening_balance: book.opening_balance,
          }).select().single();
        if (nbErr) throw nbErr;

        // 3. Fetch entries
        const { data: entries = [], error: eErr } = await (supabase as any)
          .from("receivable_entries").select("*").eq("book_id", bookId);
        if (eErr) throw eErr;

        // 4. Move entries: receivable_entries → payable_entries
        for (const entry of entries) {
          const { data: newEntry, error: neErr } = await (supabase as any)
            .from("payable_entries").insert({
              book_id: newBook.id,
              date: entry.date,
              description: entry.description,
              category: entry.category,
              linked_account_id: entry.linked_account_id,
              amount: entry.amount,
              paid_amount: entry.collected_amount, // map collected → paid
              due_date: entry.due_date,
              note: entry.note,
              status: entry.status === "collected" ? "paid" : entry.status,
            }).select().single();
          if (neErr) throw neErr;

          // 5. Move collection history → payment history
          const { data: history = [] } = await (supabase as any)
            .from("receivable_collection_history").select("*").eq("entry_id", entry.id);
          for (const h of history) {
            await (supabase as any).from("payable_payment_history").insert({
              entry_id: newEntry.id,
              date: h.date,
              amount: h.amount,
              account_id: h.account_id,
              note: h.note,
            });
          }

          // 6. Delete old history & entry
          await (supabase as any).from("receivable_collection_history").delete().eq("entry_id", entry.id);
          await (supabase as any).from("receivable_entries").delete().eq("id", entry.id);
        }

        // 7. Delete old book
        await (supabase as any).from("receivable_books").delete().eq("id", bookId);

      } else {
        // payable-to-receivable
        const { data: book, error: bErr } = await (supabase as any)
          .from("payable_books").select("*").eq("id", bookId).single();
        if (bErr) throw bErr;

        const { data: newBook, error: nbErr } = await (supabase as any)
          .from("receivable_books").insert({
            person_name: book.person_name,
            description: book.description,
            phone: book.phone,
            email: book.email,
            status: book.status,
            opening_balance: book.opening_balance,
          }).select().single();
        if (nbErr) throw nbErr;

        const { data: entries = [], error: eErr } = await (supabase as any)
          .from("payable_entries").select("*").eq("book_id", bookId);
        if (eErr) throw eErr;

        for (const entry of entries) {
          const { data: newEntry, error: neErr } = await (supabase as any)
            .from("receivable_entries").insert({
              book_id: newBook.id,
              date: entry.date,
              description: entry.description,
              category: entry.category,
              linked_account_id: entry.linked_account_id,
              amount: entry.amount,
              collected_amount: entry.paid_amount, // map paid → collected
              due_date: entry.due_date,
              note: entry.note,
              status: entry.status === "paid" ? "collected" : entry.status,
            }).select().single();
          if (neErr) throw neErr;

          const { data: history = [] } = await (supabase as any)
            .from("payable_payment_history").select("*").eq("entry_id", entry.id);
          for (const h of history) {
            await (supabase as any).from("receivable_collection_history").insert({
              entry_id: newEntry.id,
              date: h.date,
              amount: h.amount,
              account_id: h.account_id,
              note: h.note,
            });
          }

          await (supabase as any).from("payable_payment_history").delete().eq("entry_id", entry.id);
          await (supabase as any).from("payable_entries").delete().eq("id", entry.id);
        }

        await (supabase as any).from("payable_books").delete().eq("id", bookId);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["receivable_books"] });
      qc.invalidateQueries({ queryKey: ["payable_books"] });
      qc.invalidateQueries({ queryKey: ["receivable_entries"] });
      qc.invalidateQueries({ queryKey: ["receivable_entries_all"] });
      qc.invalidateQueries({ queryKey: ["payable_entries"] });
      qc.invalidateQueries({ queryKey: ["payable_entries_all"] });
      qc.invalidateQueries({ queryKey: ["receivable_collection_history"] });
      qc.invalidateQueries({ queryKey: ["payable_payment_history"] });
      toast.success("Book moved successfully");
    },
    onError: (e: Error) => toast.error("Move failed: " + e.message),
  });
}
