import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Pencil, Trash2, HeartHandshake } from "lucide-react";
import { useMohoranaPayments, useDeleteMohoranaPayment, MohoranaPayment } from "@/hooks/use-mohorana-payments";
import { MohoranaRecord } from "@/hooks/use-mohorana";
import { AddPaymentModal } from "./AddPaymentModal";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useAppContext, CURRENCIES } from "@/contexts/AppContext";
import { useTranslation } from "@/i18n/useTranslation";
import { formatAmount, formatAppDate } from "@/lib/formatters";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: MohoranaRecord | null;
}

export function MohoranaDetailModal({ open, onOpenChange, record }: Props) {
  const { t, lang } = useTranslation();
  const { settings } = useAppContext();
  const { data: payments = [] } = useMohoranaPayments(record?.id);
  const deleteMut = useDeleteMohoranaPayment();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [editing, setEditing] = useState<MohoranaPayment | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const currency = useMemo(() => {
    if (!record) return CURRENCIES[0];
    return CURRENCIES.find(c => c.code === record.currency) || CURRENCIES[0];
  }, [record]);

  const totals = useMemo(() => {
    const paid = payments.reduce((s, p) => s + Number(p.amount), 0);
    const muajjalPaid = payments.filter(p => p.payment_type === "muajjal").reduce((s, p) => s + Number(p.amount), 0);
    const muakhkharPaid = payments.filter(p => p.payment_type === "muakhkhar").reduce((s, p) => s + Number(p.amount), 0);
    return { paid, muajjalPaid, muakhkharPaid };
  }, [payments]);

  if (!record) return null;

  const total = Number(record.total_amount);
  const remaining = Math.max(0, total - totals.paid);
  const pct = total > 0 ? Math.min(100, (totals.paid / total) * 100) : 0;
  const fmt = (n: number) => formatAmount(n, currency, lang);
  const fmtDate = (d: string) => formatAppDate(d, settings.dateFormat, settings.timezone, lang);

  const openAdd = (p?: MohoranaPayment) => { setEditing(p || null); setPaymentOpen(true); };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-feature-receivables/10">
                <HeartHandshake className="h-5 w-5 text-feature-receivables" />
              </div>
              <div>
                <p>{record.spouse_name}</p>
                {record.marriage_date && <p className="text-xs font-normal text-muted-foreground">{t("mohorana.marriedOn")} {fmtDate(record.marriage_date)}</p>}
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border bg-card p-3">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{t("mohorana.total")}</p>
                <p className="text-base font-bold mt-0.5">{fmt(total)}</p>
              </div>
              <div className="rounded-xl border bg-card p-3">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{t("mohorana.paid")}</p>
                <p className="text-base font-bold mt-0.5 text-positive">{fmt(totals.paid)}</p>
              </div>
              <div className="rounded-xl border bg-card p-3">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{t("mohorana.remaining")}</p>
                <p className="text-base font-bold mt-0.5 text-negative">{fmt(remaining)}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">{t("mohorana.progress")}</span>
                <span className="font-medium">{Math.round(pct)}%</span>
              </div>
              <Progress value={pct} className="h-2" />
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border p-3">
                <p className="text-xs font-semibold">{t("mohorana.muajjal")}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{t("mohorana.total")}: {fmt(Number(record.muajjal_amount))}</p>
                <p className="text-[11px] text-positive">{t("mohorana.paid")}: {fmt(totals.muajjalPaid)}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs font-semibold">{t("mohorana.muakhkhar")}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{t("mohorana.total")}: {fmt(Number(record.muakhkhar_amount))}</p>
                <p className="text-[11px] text-positive">{t("mohorana.paid")}: {fmt(totals.muakhkharPaid)}</p>
              </div>
            </div>

            {record.note && (
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{t("mohorana.note")}</p>
                <p className="text-xs mt-1 whitespace-pre-wrap">{record.note}</p>
              </div>
            )}

            {/* Payments history */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">{t("mohorana.paymentHistory")}</h3>
                <Button size="sm" className="h-8 gap-1.5" onClick={() => openAdd()}>
                  <Plus className="h-3.5 w-3.5" /> {t("mohorana.addPayment")}
                </Button>
              </div>

              {payments.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">{t("mohorana.noPayments")}</p>
              ) : (
                <div className="space-y-1.5">
                  {payments.map(p => (
                    <div key={p.id} className="flex items-center gap-3 rounded-lg border bg-card p-2.5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{fmt(Number(p.amount))}</span>
                          <Badge variant="secondary" className="text-[10px] capitalize">{t(`mohorana.${p.payment_type}`, p.payment_type)}</Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {fmtDate(p.paid_on)}
                          {(p as any).account?.name && ` · ${(p as any).account.name}`}
                        </p>
                        {p.note && <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{p.note}</p>}
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openAdd(p)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(p.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AddPaymentModal open={paymentOpen} onOpenChange={setPaymentOpen} recordId={record.id} editing={editing} />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title={t("mohorana.deletePaymentTitle")}
        description={t("mohorana.deletePaymentDesc")}
        onConfirm={() => { if (deleteId) deleteMut.mutate(deleteId); setDeleteId(null); }}
      />
    </>
  );
}
