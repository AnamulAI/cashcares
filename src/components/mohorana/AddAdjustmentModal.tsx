import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateMohoranaAdjustment, useUpdateMohoranaAdjustment, MohoranaAdjustment } from "@/hooks/use-mohorana-adjustments";
import { useTranslation } from "@/i18n/useTranslation";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recordId: string;
  editing?: MohoranaAdjustment | null;
}

const REASON_PRESETS = [
  { value: "gold_sold", labelKey: "mohorana.reasonGoldSold", fallback: "Sold spouse's gold" },
  { value: "emergency_loan", labelKey: "mohorana.reasonEmergency", fallback: "Emergency loan" },
  { value: "debt_repayment", labelKey: "mohorana.reasonDebtRepay", fallback: "Used for debt repayment" },
  { value: "other", labelKey: "mohorana.reasonOther", fallback: "Other" },
];

export function AddAdjustmentModal({ open, onOpenChange, recordId, editing }: Props) {
  const { t } = useTranslation();
  const createMut = useCreateMohoranaAdjustment();
  const updateMut = useUpdateMohoranaAdjustment();

  const [form, setForm] = useState({
    adjusted_on: new Date().toISOString().slice(0, 10),
    amount: "0",
    reason: "gold_sold",
    note: "",
  });

  useEffect(() => {
    if (editing) {
      setForm({
        adjusted_on: editing.adjusted_on,
        amount: String(editing.amount),
        reason: editing.reason || "other",
        note: editing.note || "",
      });
    } else {
      setForm({ adjusted_on: new Date().toISOString().slice(0, 10), amount: "0", reason: "gold_sold", note: "" });
    }
  }, [editing, open]);

  const handleSave = () => {
    const payload = {
      record_id: recordId,
      adjusted_on: form.adjusted_on,
      amount: Number(form.amount || 0),
      reason: form.reason || null,
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
          <DialogTitle>{editing ? t("mohorana.editAdjustment", "Edit Adjustment") : t("mohorana.addAdjustment", "Add Adjustment")}</DialogTitle>
          <DialogDescription>{t("mohorana.adjustmentDesc", "Record additional debt owed to your spouse — this will increase the remaining balance.")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">{t("mohorana.adjustedOn", "Date")} *</Label>
              <Input type="date" value={form.adjusted_on} onChange={e => setForm(f => ({ ...f, adjusted_on: e.target.value }))} className="mt-1 h-9 text-sm" />
            </div>
            <div>
              <Label className="text-xs">{t("mohorana.amount")} *</Label>
              <Input type="number" min="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="mt-1 h-9 text-sm" />
            </div>
          </div>
          <div>
            <Label className="text-xs">{t("mohorana.adjustmentReason", "Reason")}</Label>
            <Select value={form.reason} onValueChange={v => setForm(f => ({ ...f, reason: v }))}>
              <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {REASON_PRESETS.map(r => (
                  <SelectItem key={r.value} value={r.value}>{t(r.labelKey, r.fallback)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">{t("mohorana.note")}</Label>
            <Textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} rows={2} className="mt-1 text-sm" placeholder={t("mohorana.adjustmentNoteHint", "Details about how the money was used") as string} />
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
