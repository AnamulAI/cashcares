import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateMohoranaPayment, useUpdateMohoranaPayment, MohoranaPayment } from "@/hooks/use-mohorana-payments";
import { useAccounts } from "@/hooks/use-accounts";
import { useTranslation } from "@/i18n/useTranslation";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recordId: string;
  editing?: MohoranaPayment | null;
}

export function AddPaymentModal({ open, onOpenChange, recordId, editing }: Props) {
  const { t } = useTranslation();
  const { data: accounts = [] } = useAccounts();
  const createMut = useCreateMohoranaPayment();
  const updateMut = useUpdateMohoranaPayment();

  const [form, setForm] = useState({
    paid_on: new Date().toISOString().slice(0, 10),
    amount: "0",
    account_id: "none",
    payment_type: "general",
    note: "",
  });

  useEffect(() => {
    if (editing) {
      setForm({
        paid_on: editing.paid_on,
        amount: String(editing.amount),
        account_id: editing.account_id || "none",
        payment_type: editing.payment_type,
        note: editing.note || "",
      });
    } else {
      setForm({ paid_on: new Date().toISOString().slice(0, 10), amount: "0", account_id: "none", payment_type: "general", note: "" });
    }
  }, [editing, open]);

  const handleSave = () => {
    const payload = {
      record_id: recordId,
      paid_on: form.paid_on,
      amount: Number(form.amount || 0),
      account_id: form.account_id === "none" ? null : form.account_id,
      payment_type: form.payment_type,
      note: form.note || null,
      attachment_path: editing?.attachment_path || null,
    };
    if (editing) {
      updateMut.mutate({ id: editing.id, ...payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      createMut.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  const pending = createMut.isPending || updateMut.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? t("mohorana.editPayment") : t("mohorana.addPayment")}</DialogTitle>
          <DialogDescription>{t("mohorana.paymentDesc")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">{t("mohorana.paidOn")} *</Label>
              <Input type="date" value={form.paid_on} onChange={e => setForm(f => ({ ...f, paid_on: e.target.value }))} className="mt-1 h-9 text-sm" />
            </div>
            <div>
              <Label className="text-xs">{t("mohorana.amount")} *</Label>
              <Input type="number" min="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="mt-1 h-9 text-sm" />
            </div>
          </div>
          <div>
            <Label className="text-xs">{t("mohorana.paymentType")}</Label>
            <Select value={form.payment_type} onValueChange={v => setForm(f => ({ ...f, payment_type: v }))}>
              <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="muajjal">{t("mohorana.muajjal")}</SelectItem>
                <SelectItem value="muakhkhar">{t("mohorana.muakhkhar")}</SelectItem>
                <SelectItem value="general">{t("mohorana.general")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">{t("mohorana.accountRef")}</Label>
            <Select value={form.account_id} onValueChange={v => setForm(f => ({ ...f, account_id: v }))}>
              <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue placeholder={t("mohorana.noAccount")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("mohorana.noAccount")}</SelectItem>
                {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground mt-1">{t("mohorana.accountRefHint")}</p>
          </div>
          <div>
            <Label className="text-xs">{t("mohorana.note")}</Label>
            <Textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} rows={2} className="mt-1 text-sm" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>{t("action.cancel")}</Button>
          <Button size="sm" onClick={handleSave} disabled={Number(form.amount) <= 0 || pending}>
            {pending ? t("action.saving") : t("action.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
