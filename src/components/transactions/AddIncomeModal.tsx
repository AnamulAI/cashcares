import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ArrowDownLeft, Paperclip } from "lucide-react";
import { useAccounts } from "@/hooks/use-accounts";
import { useCategories } from "@/hooks/use-categories";
import { useCreateTransaction } from "@/hooks/use-transactions";

interface AddIncomeModalProps { open: boolean; onOpenChange: (open: boolean) => void; }

export function AddIncomeModal({ open, onOpenChange }: AddIncomeModalProps) {
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const createTxn = useCreateTransaction();

  const incomeCategories = categories.filter(c => c.group === "income");

  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [tags, setTags] = useState("");

  const handleSubmit = async () => {
    if (!accountId || !amount) return;
    await createTxn.mutateAsync({
      type: "income",
      category_id: categoryId || null,
      account_id: accountId,
      to_account_id: null,
      amount: Number(amount),
      date,
      note: note || null,
      tags: tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : null,
      status: "completed",
      transfer_fee: 0,
    });
    setCategoryId(""); setAccountId(""); setAmount(""); setNote(""); setTags("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-positive/10 flex items-center justify-center">
              <ArrowDownLeft className="h-4 w-4 text-positive" />
            </div>
            <div>
              <DialogTitle className="font-display text-base">Add Income</DialogTitle>
              <DialogDescription className="text-xs">Record a new income transaction</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4 mt-1">
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Category">
              <Select value={categoryId} onValueChange={setCategoryId}><SelectTrigger className="h-9"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{incomeCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </FieldGroup>
            <FieldGroup label="Account">
              <Select value={accountId} onValueChange={setAccountId}><SelectTrigger className="h-9"><SelectValue placeholder="Select account" /></SelectTrigger>
                <SelectContent>{accounts.filter(a => a.is_active).map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
              </Select>
            </FieldGroup>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Amount"><Input type="number" placeholder="0.00" className="h-9" value={amount} onChange={e => setAmount(e.target.value)} /></FieldGroup>
            <FieldGroup label="Date"><Input type="date" className="h-9" value={date} onChange={e => setDate(e.target.value)} /></FieldGroup>
          </div>
          <FieldGroup label="Note"><Textarea placeholder="Add a note..." rows={2} className="resize-none" value={note} onChange={e => setNote(e.target.value)} /></FieldGroup>
          <FieldGroup label="Tags"><Input placeholder="e.g. march, bonus" className="h-9" value={tags} onChange={e => setTags(e.target.value)} /></FieldGroup>
          <Separator />
          <div className="flex items-center justify-between">
            <div><Label className="text-sm">Recurring</Label><p className="text-[11px] text-muted-foreground">Repeat automatically</p></div>
            <Switch />
          </div>
          <Button className="w-full h-10 font-medium" onClick={handleSubmit} disabled={createTxn.isPending || !accountId || !amount}>
            {createTxn.isPending ? "Saving..." : "Add Income"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-[13px] font-medium">{label}</Label>{children}</div>;
}
