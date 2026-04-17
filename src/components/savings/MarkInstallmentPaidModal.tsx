import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAccounts } from "@/hooks/use-accounts";
import { useMarkInstallmentPaid, type SavingsInstallment } from "@/hooks/use-savings";
import { formatCurrency } from "@/lib/formatters";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  installment: SavingsInstallment | null;
}

export function MarkInstallmentPaidModal({ open, onOpenChange, installment }: Props) {
  const { data: accounts = [] } = useAccounts();
  const markPaid = useMarkInstallmentPaid();
  const [paidDate, setPaidDate] = useState(new Date().toISOString().slice(0, 10));
  const [paidAmount, setPaidAmount] = useState(0);
  const [accountId, setAccountId] = useState<string>("none");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (installment) {
      setPaidAmount(Number(installment.amount));
      setPaidDate(new Date().toISOString().slice(0, 10));
      setAccountId("none");
      setNote("");
    }
  }, [installment]);

  if (!installment) return null;

  async function handleSave() {
    await markPaid.mutateAsync({
      installment: installment!,
      paid_date: paidDate,
      paid_amount: Number(paidAmount),
      linked_account_id: accountId === "none" ? null : accountId,
      note,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Mark Installment Paid</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Date Paid</Label>
            <Input type="date" value={paidDate} onChange={e => setPaidDate(e.target.value)} />
          </div>
          <div>
            <Label>Amount</Label>
            <Input type="number" value={paidAmount} onChange={e => setPaidAmount(Number(e.target.value))} />
          </div>
          <div>
            <Label>Pay From Account (optional)</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger><SelectValue placeholder="None — record only" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None — record only</SelectItem>
                {accounts.map((a: any) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name} — {formatCurrency(a.balance)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Note</Label>
            <Textarea value={note} onChange={e => setNote(e.target.value)} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={markPaid.isPending}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
