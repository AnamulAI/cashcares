import { useState, useMemo } from "react";
import { Plus, HeartHandshake, Pencil, Trash2, MoreHorizontal, Calendar } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { PremiumLocked } from "@/components/shared/PremiumLocked";
import { EmptyState } from "@/components/shared/EmptyState";
import { FinanceCard } from "@/components/shared/FinanceCard";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useMohoranaRecords, useDeleteMohoranaRecord, MohoranaRecord } from "@/hooks/use-mohorana";
import { useMohoranaPayments } from "@/hooks/use-mohorana-payments";
import { AddMohoranaModal } from "@/components/mohorana/AddMohoranaModal";
import { MohoranaDetailModal } from "@/components/mohorana/MohoranaDetailModal";
import { useAppContext, CURRENCIES } from "@/contexts/AppContext";
import { useTranslation } from "@/i18n/useTranslation";
import { formatAmount, formatAppDate } from "@/lib/formatters";

const statusBadge: Record<string, string> = {
  active: "bg-primary/10 text-primary",
  completed: "bg-positive/10 text-positive",
  archived: "bg-muted text-muted-foreground",
};

export default function Mohorana() {
  const { isPremium, currency, settings } = useAppContext();
  const { t, lang } = useTranslation();
  const { data: records = [], isLoading } = useMohoranaRecords();
  const { data: allPayments = [] } = useMohoranaPayments();
  const deleteMut = useDeleteMohoranaRecord();

  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<MohoranaRecord | null>(null);
  const [detail, setDetail] = useState<MohoranaRecord | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const paidByRecord = useMemo(() => {
    const map: Record<string, number> = {};
    allPayments.forEach(p => {
      map[p.record_id] = (map[p.record_id] || 0) + Number(p.amount);
    });
    return map;
  }, [allPayments]);

  const totals = useMemo(() => {
    let total = 0, paid = 0;
    records.forEach(r => {
      total += Number(r.total_amount);
      paid += paidByRecord[r.id] || 0;
    });
    return { total, paid, remaining: Math.max(0, total - paid) };
  }, [records, paidByRecord]);

  const fmt = (n: number) => formatAmount(n, currency, lang);
  const fmtDate = (d: string) => formatAppDate(d, settings.dateFormat, settings.timezone, lang);

  const openAdd = (r?: MohoranaRecord) => { setEditing(r || null); setAddOpen(true); };

  if (!isPremium) {
    return (
      <div className="space-y-6">
        <PageHeader title={t("mohorana.title")} subtitle={t("mohorana.subtitle")} />
        <PremiumLocked
          icon={<HeartHandshake className="h-7 w-7 text-feature-receivables" />}
          moduleName={t("mohorana.title")}
          description={t("mohorana.premiumDesc")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("mohorana.title")}
        subtitle={t("mohorana.subtitle")}
        actions={
          <Button size="sm" className="gap-1.5 shadow-sm" onClick={() => openAdd()}>
            <Plus className="h-4 w-4" /> {t("mohorana.addRecord")}
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <FinanceCard
          icon={<HeartHandshake className="h-5 w-5 text-feature-receivables" />}
          iconBg="bg-feature-receivables/10"
          label={t("mohorana.totalCommitted")}
          value={fmt(totals.total)}
        />
        <FinanceCard
          icon={<HeartHandshake className="h-5 w-5 text-positive" />}
          iconBg="bg-positive/10"
          label={t("mohorana.totalPaid")}
          value={fmt(totals.paid)}
        />
        <FinanceCard
          icon={<HeartHandshake className="h-5 w-5 text-negative" />}
          iconBg="bg-negative/10"
          label={t("mohorana.totalRemaining")}
          value={fmt(totals.remaining)}
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1, 2].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      ) : records.length === 0 ? (
        <EmptyState
          icon={<HeartHandshake className="h-7 w-7 text-muted-foreground" />}
          title={t("mohorana.empty")}
          description={t("mohorana.emptyDesc")}
          action={<Button size="sm" onClick={() => openAdd()}><Plus className="h-4 w-4 mr-1" /> {t("mohorana.addRecord")}</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {records.map(r => {
            const recordCurrency = CURRENCIES.find(c => c.code === r.currency) || currency;
            const recordFmt = (n: number) => formatAmount(n, recordCurrency, lang);
            const paid = paidByRecord[r.id] || 0;
            const total = Number(r.total_amount);
            const remaining = Math.max(0, total - paid);
            const pct = total > 0 ? Math.min(100, (paid / total) * 100) : 0;
            return (
              <Card key={r.id} className="finance-card-static p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setDetail(r)}>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-feature-receivables/10">
                    <HeartHandshake className="h-5 w-5 text-feature-receivables" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold truncate">{r.spouse_name}</h3>
                      <Badge variant="secondary" className={`text-[10px] capitalize ${statusBadge[r.status] || ""}`}>
                        {t(`mohorana.status${r.status.charAt(0).toUpperCase() + r.status.slice(1)}`, r.status)}
                      </Badge>
                    </div>
                    {r.marriage_date && (
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3 w-3" /> {fmtDate(r.marriage_date)}
                      </p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={e => { e.stopPropagation(); openAdd(r); }}>
                        <Pencil className="h-3.5 w-3.5 mr-2" /> {t("action.edit")}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={e => { e.stopPropagation(); setDeleteId(r.id); }}>
                        <Trash2 className="h-3.5 w-3.5 mr-2" /> {t("action.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{t("mohorana.paid")} / {t("mohorana.total")}</span>
                    <span className="font-medium">{recordFmt(paid)} / {recordFmt(total)}</span>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                  <div className="flex items-center justify-between text-[11px] pt-0.5">
                    <span className="text-muted-foreground">{t("mohorana.remaining")}: <span className="text-negative font-medium">{recordFmt(remaining)}</span></span>
                    <span className="text-muted-foreground">{Math.round(pct)}%</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <AddMohoranaModal open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) setEditing(null); }} editing={editing} />
      <MohoranaDetailModal open={!!detail} onOpenChange={(o) => { if (!o) setDetail(null); }} record={detail} />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title={t("mohorana.deleteTitle")}
        description={t("mohorana.deleteDesc")}
        onConfirm={() => { if (deleteId) deleteMut.mutate(deleteId); setDeleteId(null); }}
      />
    </div>
  );
}
