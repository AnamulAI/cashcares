import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ArrowLeftRight, ArrowRight } from "lucide-react";
import { useAccounts } from "@/hooks/use-accounts";
import { useCreateTransaction } from "@/hooks/use-transactions";
import { toast } from "sonner";

interface TransferModalProps { open: boolean; onOpenChange: (open: boolean) => void; }

export function TransferModal({ open, onOpenChange }: TransferModalProps) {
  const { data: accounts = [] } = useAccounts();
  const createTxn = useCreateTransaction();

  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [fee, setFee] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = async () => {
    if (!fromAccountId || !toAccountId || !amount) return;
    if (fromAccountId === toAccountId) {
      toast.error("Cannot transfer to the same account");
      return;
    }
    await createTxn.mutateAsync({
      type: "transfer",
      category_id: null,
      account_id: fromAccountId,
      to_account_id: toAccountId,
      amount: Number(amount),
      date,
      note: note || null,
      tags: null,
      status: "completed",
      transfer_fee: Number(fee) || 0,
    });
    setFromAccountId(""); setToAccountId(""); setAmount(""); setFee(""); setNote("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <ArrowLeftRight className="h-4 w-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="font-display text-base">Transfer Money</DialogTitle>
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
          <Button className="w-full h-10 font-medium" onClick={handleSubmit} disabled={createTxn.isPending || !fromAccountId || !toAccountId || !amount}>
            {createTxn.isPending ? "Transferring..." : "Transfer Money"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-[13px] font-medium">{label}</Label>{children}</div>;
}
