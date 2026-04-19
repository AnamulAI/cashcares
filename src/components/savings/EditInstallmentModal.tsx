import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { SavingsInstallment } from "@/hooks/use-savings";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  installment: SavingsInstallment | null;
}

export function EditInstallmentModal({ open, onOpenChange, installment }: Props) {
  const qc = useQueryClient();
  const [dueDate, setDueDate] = useState("");
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (installment) {
      setDueDate(installment.due_date);
      setAmount(Number(installment.amount));
      setNote(installment.note || "");
    }
  }, [installment]);

  if (!installment) return null;
  const isPaid = installment.status === "paid";

  async function handleSave() {
    if (!dueDate) return toast.error("Due date is required");
    if (!amount || amount <= 0) return toast.error("Amount must be greater than 0");

    setSaving(true);
    try {
      const updates: any = { note: note || null };
      // Only allow due_date and amount edits when not paid
      if (!isPaid) {
        updates.due_date = dueDate;
        updates.amount = Number(amount);
      }
      const { error } = await (supabase as any)
        .from("savings_installments")
        .update(updates)
        .eq("id", installment!.id);
      if (error) throw error;

      qc.invalidateQueries({ queryKey: ["savings_installments", installment!.plan_id] });
      qc.invalidateQueries({ queryKey: ["savings_installments_all"] });
      toast.success("Installment updated");
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Edit Installment</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          {isPaid && (
            <p className="text-xs text-muted-foreground bg-muted/40 rounded-md px-3 py-2">
              This installment is already paid. Only the note can be edited. Reverse it first to change due date or amount.
            </p>
          )}
          <div>
            <Label>Due Date</Label>
            <Input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              disabled={isPaid}
            />
          </div>
          <div>
            <Label>Amount</Label>
            <Input
              type="number"
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              disabled={isPaid}
            />
          </div>
          <div>
            <Label>Note</Label>
            <Textarea value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="Optional note" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
