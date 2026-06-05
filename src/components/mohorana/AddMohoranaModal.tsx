import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateMohoranaRecord, useUpdateMohoranaRecord, MohoranaRecord } from "@/hooks/use-mohorana";
import { CURRENCIES } from "@/contexts/AppContext";
import { useTranslation } from "@/i18n/useTranslation";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: MohoranaRecord | null;
}

export function AddMohoranaModal({ open, onOpenChange, editing }: Props) {
  const { t } = useTranslation();
  const createMut = useCreateMohoranaRecord();
  const updateMut = useUpdateMohoranaRecord();

  const [form, setForm] = useState({
    spouse_name: "",
    marriage_date: "",
    currency: "BDT",
    total_amount: "0",
    muajjal_amount: "0",
    muakhkhar_amount: "0",
    status: "active",
    note: "",
  });

  useEffect(() => {
    if (editing) {
      setForm({
        spouse_name: editing.spouse_name,
        marriage_date: editing.marriage_date || "",
        currency: editing.currency || "BDT",
        total_amount: String(editing.total_amount),
        muajjal_amount: String(editing.muajjal_amount),
        muakhkhar_amount: String(editing.muakhkhar_amount),
        status: editing.status,
        note: editing.note || "",
      });
    } else {
      setForm({ spouse_name: "", marriage_date: "", currency: "BDT", total_amount: "0", muajjal_amount: "0", muakhkhar_amount: "0", status: "active", note: "" });
    }
  }, [editing, open]);

  const handleSave = () => {
    const payload = {
      spouse_name: form.spouse_name.trim(),
      marriage_date: form.marriage_date || null,
      currency: form.currency,
      total_amount: Number(form.total_amount || 0),
      muajjal_amount: Number(form.muajjal_amount || 0),
      muakhkhar_amount: Number(form.muakhkhar_amount || 0),
      status: form.status,
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
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? t("mohorana.editRecord") : t("mohorana.addRecord")}</DialogTitle>
          <DialogDescription>{t("mohorana.formDesc")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div>
            <Label className="text-xs">{t("mohorana.spouseName")} *</Label>
            <Input value={form.spouse_name} onChange={e => setForm(f => ({ ...f, spouse_name: e.target.value }))} className="mt-1 h-9 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">{t("mohorana.marriageDate")}</Label>
              <Input type="date" value={form.marriage_date} onChange={e => setForm(f => ({ ...f, marriage_date: e.target.value }))} className="mt-1 h-9 text-sm" />
            </div>
            <div>
              <Label className="text-xs">{t("mohorana.currency")}</Label>
              <Select value={form.currency} onValueChange={v => setForm(f => ({ ...f, currency: v }))}>
                <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(c => <SelectItem key={c.code} value={c.code}>{c.symbol} {c.code}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs">{t("mohorana.totalAmount")} *</Label>
            <Input type="number" min="0" value={form.total_amount} onChange={e => setForm(f => ({ ...f, total_amount: e.target.value }))} className="mt-1 h-9 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">{t("mohorana.muajjal")}</Label>
              <Input type="number" min="0" value={form.muajjal_amount} onChange={e => setForm(f => ({ ...f, muajjal_amount: e.target.value }))} className="mt-1 h-9 text-sm" />
            </div>
            <div>
              <Label className="text-xs">{t("mohorana.muakhkhar")}</Label>
              <Input type="number" min="0" value={form.muakhkhar_amount} onChange={e => setForm(f => ({ ...f, muakhkhar_amount: e.target.value }))} className="mt-1 h-9 text-sm" />
            </div>
          </div>
          <div>
            <Label className="text-xs">{t("mohorana.status")}</Label>
            <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
              <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{t("mohorana.statusActive")}</SelectItem>
                <SelectItem value="completed">{t("mohorana.statusCompleted")}</SelectItem>
                <SelectItem value="archived">{t("mohorana.statusArchived")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">{t("mohorana.note")}</Label>
            <Textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} rows={2} className="mt-1 text-sm" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>{t("action.cancel")}</Button>
          <Button size="sm" onClick={handleSave} disabled={!form.spouse_name || pending}>
            {pending ? t("action.saving") : t("action.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
