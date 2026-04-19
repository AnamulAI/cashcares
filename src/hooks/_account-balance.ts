import { supabase } from "@/integrations/supabase/client";

/**
 * Adjust a single account's balance by `delta` (positive = inflow, negative = outflow).
 * Best-effort: if the account is missing or fetch fails, this silently no-ops to avoid
 * blocking the parent write. Callers should still invalidate the ["accounts"] query.
 */
export async function adjustBalance(accountId: string | null | undefined, delta: number) {
  if (!accountId || !delta) return;
  const { data, error } = await supabase.from("accounts").select("balance").eq("id", accountId).single();
  if (error || !data) return;
  await supabase.from("accounts").update({ balance: Number(data.balance) + delta }).eq("id", accountId);
}
