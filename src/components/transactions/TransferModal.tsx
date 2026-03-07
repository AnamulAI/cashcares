import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ArrowLeftRight, ArrowRight } from "lucide-react";
import { useAccounts } from "@/hooks/use-accounts";
import { useCreateTransaction, useUpdateTransaction } from "@/hooks/use-transactions";
import { toast } from "sonner";

interface TransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTransaction?: any;
}

export function TransferModal({ open, onOpenChange, editTransaction }: TransferModalProps) {
  const { data: accounts = [] } = useAccounts();
  const createTxn = useCreateTransaction();
  const updateTxn = useUpdateTransaction();
  const isEdit = !!editTransaction;

  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [fee, setFee] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (editTransaction && open) {
      setFromAccountId(editTransaction.account_id || "");
      setToAccountId(editTransaction.to_account_id || "");
      setAmount(String(editTransaction.amount || ""));
      setDate(editTransaction.date || new Date().toISOString().split("T")[0]);
      setFee(editTransaction.transfer_fee ? String(editTransaction.transfer_fee) : "");
      setNote(editTransaction.note || "");
    } else if (!open) {
      setFromAccountId(""); setToAccountId(""); setAmount(""); setFee(""); setNote("");
      setDate(new Date().toISOString().split("T")[0]);
    }
  }, [editTransaction, open]);

  const handleSubmit = async () => {
    if (!fromAccountId || !toAccountId || !amount) return;
    if (fromAccountId === toAccountId) {
      toast.error("Cannot transfer to the same account");
      return;
    }
    const payload = {
      type: "transfer" as const,
      category_id: null,
      account_id: fromAccountId,
      to_account_id: toAccountId,
      amount: Number(amount),
      date,
      note: note || null,
      tags: null,
      status: "completed",
      transfer_fee: Number(fee) || 0,
    };

    if (isEdit) {
      await updateTxn.mutateAsync({
        id: editTransaction.id,
        oldTxn: {
          type: editTransaction.type,
          amount: Number(editTransaction.amount),
          account_id: editTransaction.account_id,
          to_account_id: editTransaction.to_account_id,
          transfer_fee: editTransaction.transfer_fee ? Number(editTransaction.transfer_fee) : null,
          category_id: editTransaction.category_id,
        },
        newTxn: payload,
      });
    } else {
      await createTxn.mutateAsync(payload);
    }
    setFromAccountId(""); setToAccountId(""); setAmount(""); setFee(""); setNote("");
    onOpenChange(false);
  };

  const isPending = isEdit ? updateTxn.isPending : createTxn.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <ArrowLeftRight className="h-4 w-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="font-display text-base">{isEdit ? "Edit Transfer" : "Transfer Money"}</DialogTitle>
              <DialogDescription className="text-xs">Move funds between your accounts</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4 mt-1">
          <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-end">
            <FieldGroup label="From Account">
              <Select value={fromAccountId} onValueChange={setFromAccountId}><SelectTrigger className="h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{accounts.filter(a => a.is_active).map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
              </Select>
            </FieldGroup>
            <div className="h-9 flex items-center">
              <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center"><ArrowRight className="h-4 w-4 text-muted-foreground" /></div>
            </div>
            <FieldGroup label="To Account">
              <Select value={toAccountId} onValueChange={setToAccountId}><SelectTrigger className="h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{accounts.filter(a => a.is_active).map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
              </Select>
            </FieldGroup>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Amount"><Input type="number" placeholder="0.00" className="h-9" value={amount} onChange={e => setAmount(e.target.value)} /></FieldGroup>
            <FieldGroup label="Date"><Input type="date" className="h-9" value={date} onChange={e => setDate(e.target.value)} /></FieldGroup>
          </div>
          <FieldGroup label="Transfer Fee"><Input type="number" placeholder="0.00" className="h-9" value={fee} onChange={e => setFee(e.target.value)} /></FieldGroup>
          <FieldGroup label="Note"><Textarea placeholder="Add a note..." rows={2} className="resize-none" value={note} onChange={e => setNote(e.target.value)} /></FieldGroup>
          <Button className="w-full h-10 font-medium" onClick={handleSubmit} disabled={isPending || !fromAccountId || !toAccountId || !amount}>
            {isPending ? "Saving..." : isEdit ? "Save Changes" : "Transfer Money"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-[13px] font-medium">{label}</Label>{children}</div>;
}
