import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ArrowUpRight, Plus, X } from "lucide-react";
import { useAccounts } from "@/hooks/use-accounts";
import { useCategories } from "@/hooks/use-categories";
import { useCreateTransaction, useUpdateTransaction } from "@/hooks/use-transactions";
import { useTranslation } from "@/i18n/useTranslation";

interface AddExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTransaction?: any;
}

export function AddExpenseModal({ open, onOpenChange, editTransaction }: AddExpenseModalProps) {
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const createTxn = useCreateTransaction();
  const updateTxn = useUpdateTransaction();
  const { t } = useTranslation();

  const expenseCategories = categories.filter(c => c.group === "expense");
  const isEdit = !!editTransaction;

  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [tags, setTags] = useState("");
  const [splitEnabled, setSplitEnabled] = useState(false);
  const [splits, setSplits] = useState([{ id: 1 }]);

  useEffect(() => {
    if (editTransaction && open) {
      setCategoryId(editTransaction.category_id || "");
      setAccountId(editTransaction.account_id || "");
      setAmount(String(editTransaction.amount || ""));
      setDate(editTransaction.date || new Date().toISOString().split("T")[0]);
      setNote(editTransaction.note || "");
      setTags(editTransaction.tags?.join(", ") || "");
    } else if (!open) {
      setCategoryId(""); setAccountId(""); setAmount(""); setNote(""); setTags("");
      setDate(new Date().toISOString().split("T")[0]);
      setSplitEnabled(false);
    }
  }, [editTransaction, open]);

  const handleSubmit = async () => {
    if (!accountId || !amount) return;
    const payload = {
      type: "expense" as const,
      category_id: categoryId || null,
      account_id: accountId,
      to_account_id: null,
      amount: Number(amount),
      date,
      note: note || null,
      tags: tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : null,
      status: "completed",
      transfer_fee: 0,
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
    setCategoryId(""); setAccountId(""); setAmount(""); setNote(""); setTags(""); setSplitEnabled(false);
    onOpenChange(false);
  };

  const isPending = isEdit ? updateTxn.isPending : createTxn.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-negative/10 flex items-center justify-center">
              <ArrowUpRight className="h-4 w-4 text-negative" />
            </div>
            <div>
              <DialogTitle className="font-display text-base">{isEdit ? t("action.edit") : t("action.addExpense")}</DialogTitle>
              <DialogDescription className="text-xs">{t("transactions.recordExpense")}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4 mt-1">
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label={t("table.category")}>
              <Select value={categoryId} onValueChange={setCategoryId}><SelectTrigger className="h-9"><SelectValue placeholder={t("transactions.selectCategory")} /></SelectTrigger>
                <SelectContent>{expenseCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </FieldGroup>
            <FieldGroup label={t("table.account")}>
              <Select value={accountId} onValueChange={setAccountId}><SelectTrigger className="h-9"><SelectValue placeholder={t("transactions.selectAccount")} /></SelectTrigger>
                <SelectContent>{accounts.filter(a => a.is_active).map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
              </Select>
            </FieldGroup>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label={t("table.amount")}><Input type="number" placeholder="0.00" className="h-9" value={amount} onChange={e => setAmount(e.target.value)} /></FieldGroup>
            <FieldGroup label={t("table.date")}><Input type="date" className="h-9" value={date} onChange={e => setDate(e.target.value)} /></FieldGroup>
          </div>
          <FieldGroup label={t("table.note")}><Textarea placeholder={t("transactions.addNote")} rows={2} className="resize-none" value={note} onChange={e => setNote(e.target.value)} /></FieldGroup>
          <FieldGroup label={t("transactions.tags")}><Input placeholder={t("transactions.tagsPlaceholder")} className="h-9" value={tags} onChange={e => setTags(e.target.value)} /></FieldGroup>
          <Separator />
          <div className="flex items-center justify-between">
            <div><Label className="text-sm">{t("transactions.splitPayment")}</Label><p className="text-[11px] text-muted-foreground">{t("transactions.splitPaymentDesc")}</p></div>
            <Switch checked={splitEnabled} onCheckedChange={v => { setSplitEnabled(v); if (!v) setSplits([{ id: 1 }]); }} />
          </div>
          {splitEnabled && (
            <div className="space-y-2 rounded-lg bg-accent/40 p-3">
              {splits.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2">
                  <Select><SelectTrigger className="h-8 text-xs flex-1"><SelectValue placeholder={t("table.account")} /></SelectTrigger>
                    <SelectContent>{accounts.filter(a => a.is_active).map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input type="number" placeholder="0.00" className="h-8 w-24 text-xs" />
                  {splits.length > 1 && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSplits(splits.filter((_, j) => j !== i))}><X className="h-3 w-3" /></Button>}
                </div>
              ))}
              <Button variant="ghost" size="sm" className="text-xs gap-1 h-7 text-primary" onClick={() => setSplits([...splits, { id: Date.now() }])}>
                <Plus className="h-3 w-3" /> {t("transactions.addSplit")}
              </Button>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div><Label className="text-sm">{t("transactions.recurring")}</Label><p className="text-[11px] text-muted-foreground">{t("transactions.recurringDesc")}</p></div>
            <Switch />
          </div>
          <Button className="w-full h-10 font-medium" onClick={handleSubmit} disabled={isPending || !accountId || !amount}>
            {isPending ? t("action.saving") : isEdit ? t("action.save") : t("action.addExpense")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-[13px] font-medium">{label}</Label>{children}</div>;
}
