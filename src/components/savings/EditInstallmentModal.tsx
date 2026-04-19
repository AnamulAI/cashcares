import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useUpdateInstallment, type SavingsInstallment } from "@/hooks/use-savings";
import { useAccounts } from "@/hooks/use-accounts";
import { EntryAttachments } from "@/components/ledger/EntryAttachments";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  installment: SavingsInstallment | null;
}

export function EditInstallmentModal({ open, onOpenChange, installment }: Props) {
  const update = useUpdateInstallment();
  const { data: accounts = [] } = useAccounts();
  const [dueDate, setDueDate] = useState("");
  const [amount, setAmount] = useState(0);
  const [accountId, setAccountId] = useState<string>("none");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (installment) {
      setDueDate(installment.due_date);
      setAmount(Number(installment.amount));
      setAccountId(installment.linked_account_id ?? "none");
      setNote(installment.note || "");
    }
  }, [installment]);

  if (!installment) return null;
  const isPaid = installment.status === "paid";

  async function handleSave() {
    if (!dueDate) return toast.error("Due date is required");
    if (!amount || amount <= 0) return toast.error("Amount must be greater than 0");

    const linkedAccountId = accountId === "none" ? null : accountId;
    const updates: Partial<SavingsInstallment> = {
      due_date: dueDate,
      amount: Number(amount),
      linked_account_id: linkedAccountId,
      note: note || null,
    };
    if (isPaid) {
      // Ensure reconciliation path runs in the hook
      updates.paid_amount = Number(amount);
    }
    try {
      await update.mutateAsync({ installment: installment!, updates });
      onOpenChange(false);
    } catch {
      // toast handled by hook
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Edit Installment</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          {isPaid && (
            <p className="text-xs text-muted-foreground bg-muted/40 rounded-md px-3 py-2">
              Editing a paid installment will adjust the linked account balance and plan total automatically.
            </p>
          )}
          <div>
            <Label>Due Date</Label>
            <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>
          <div>
            <Label>Amount</Label>
            <Input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} />
          </div>
          <div>
            <Label>Account</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None — record only</SelectItem>
                {accounts.map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Note</Label>
            <Textarea value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="Optional note" />
          </div>
          <EntryAttachments entryId={installment.id} entryType="savings_installment" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={update.isPending}>{update.isPending ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
