import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, HeartHandshake, Pencil, Trash2, MoreHorizontal, Search, RotateCcw, BookOpen, FileText, CheckCircle2, AlertTriangle, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { FeatureIO } from "@/components/shared/FeatureIO";
import { PremiumLocked } from "@/components/shared/PremiumLocked";
import { EmptyState } from "@/components/shared/EmptyState";
import { FinanceCard } from "@/components/shared/FinanceCard";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { BulkActionBar } from "@/components/shared/BulkActionBar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useMohoranaRecords, useDeleteMohoranaRecord, MohoranaRecord } from "@/hooks/use-mohorana";
import { useMohoranaPayments } from "@/hooks/use-mohorana-payments";
import { useMohoranaAdjustments } from "@/hooks/use-mohorana-adjustments";
import { AddMohoranaModal } from "@/components/mohorana/AddMohoranaModal";
import { useAppContext, CURRENCIES } from "@/contexts/AppContext";
import { useTranslation } from "@/i18n/useTranslation";
import { formatAmount, formatAppDate } from "@/lib/formatters";
import { supabase } from "@/integrations/supabase/client";

const statusBadge: Record<string, string> = {
  active: "bg-primary/10 text-primary",
  completed: "bg-positive/10 text-positive",
  archived: "bg-muted text-muted-foreground",
};

export default function Mohorana() {
  const { isPremium, currency, settings } = useAppContext();
  const { t, lang } = useTranslation();
  const navigate = useNavigate();
  const { data: records = [], isLoading } = useMohoranaRecords();
  const { data: allPayments = [] } = useMohoranaPayments();
  const deleteMut = useDeleteMohoranaRecord();

  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<MohoranaRecord | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const paidByRecord = useMemo(() => {
    const map: Record<string, { paid: number; count: number }> = {};
    allPayments.forEach(p => {
      if (!map[p.record_id]) map[p.record_id] = { paid: 0, count: 0 };
      map[p.record_id].paid += Number(p.amount);
      map[p.record_id].count += 1;
    });
    return map;
  }, [allPayments]);

  const totals = useMemo(() => {
    let total = 0, paid = 0;
    records.forEach(r => {
      total += Number(r.total_amount);
      paid += paidByRecord[r.id]?.paid || 0;
    });
    return { total, paid, remaining: Math.max(0, total - paid), active: records.filter(r => r.status === "active").length };
  }, [records, paidByRecord]);

  const filtered = useMemo(() => records.filter(r => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (search && !r.spouse_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [records, statusFilter, search]);

  const fmt = (n: number) => formatAmount(n, currency, lang);
  const fmtDate = (d: string) => formatAppDate(d, settings.dateFormat, settings.timezone, lang);

  const openAdd = (r?: MohoranaRecord) => { setEditing(r || null); setAddOpen(true); };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    try {
      for (const id of selected) {
        await (supabase as any).from("mohorana_payments").delete().eq("record_id", id);
        await (supabase as any).from("mohorana_records").delete().eq("id", id);
      }
      window.location.reload();
    } finally { setBulkDeleting(false); }
  };

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
          <div className="flex items-center gap-2">
            <FeatureIO feature="mohorana" tables={[{ table: "mohorana_records" }, { table: "mohorana_payments" }]} />
            <Button size="sm" className="gap-1.5 shadow-sm" onClick={() => openAdd()}>
              <Plus className="h-4 w-4" /> {t("mohorana.addRecord")}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <FinanceCard icon={<HeartHandshake className="h-5 w-5 text-feature-receivables" />} iconBg="bg-feature-receivables/10" label={t("mohorana.totalCommitted")} value={fmt(totals.total)} />
        <FinanceCard icon={<CheckCircle2 className="h-5 w-5 text-positive" />} iconBg="bg-positive/10" label={t("mohorana.totalPaid")} value={fmt(totals.paid)} />
        <FinanceCard icon={<AlertTriangle className="h-5 w-5 text-negative" />} iconBg="bg-negative/10" label={t("mohorana.totalRemaining")} value={fmt(totals.remaining)} />
        <FinanceCard icon={<Users className="h-5 w-5 text-feature-receivables" />} iconBg="bg-feature-receivables/10" label="Active Records" value={String(totals.active)} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search spouse name..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("module.allStatus")}</SelectItem>
            <SelectItem value="active">{t("mohorana.statusActive", "Active")}</SelectItem>
            <SelectItem value="completed">{t("mohorana.statusCompleted", "Completed")}</SelectItem>
            <SelectItem value="archived">{t("mohorana.statusArchived", "Archived")}</SelectItem>
          </SelectContent>
        </Select>
        {(search || statusFilter !== "all") && (
          <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={() => { setSearch(""); setStatusFilter("all"); }}>
            <RotateCcw className="h-3 w-3" /> {t("action.reset")}
          </Button>
        )}
      </div>

      <BulkActionBar selectedCount={selected.size} onDelete={() => setBulkDeleteOpen(true)} onClear={() => setSelected(new Set())} deleting={bulkDeleting} />

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<HeartHandshake className="h-7 w-7 text-muted-foreground" />}
          title={t("mohorana.empty")}
          description={t("mohorana.emptyDesc")}
          action={<Button size="sm" onClick={() => openAdd()}><Plus className="h-4 w-4 mr-1" /> {t("mohorana.addRecord")}</Button>}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map(r => {
            const recordCurrency = CURRENCIES.find(c => c.code === r.currency) || currency;
            const recordFmt = (n: number) => formatAmount(n, recordCurrency, lang);
            const agg = paidByRecord[r.id] || { paid: 0, count: 0 };
            const total = Number(r.total_amount);
            const remaining = Math.max(0, total - agg.paid);
            return (
              <Card key={r.id} className="finance-card-static p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/mohorana/${r.id}`)}>
                <div className="flex items-center gap-3">
                  <Checkbox checked={selected.has(r.id)} onCheckedChange={() => toggleOne(r.id)} onClick={e => e.stopPropagation()} />
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-feature-receivables/10">
                    <HeartHandshake className="h-5 w-5 text-feature-receivables" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold truncate">{r.spouse_name}</h3>
                      <Badge variant="secondary" className={`text-[10px] capitalize ${statusBadge[r.status] || ""}`}>
                        {t(`mohorana.status${r.status.charAt(0).toUpperCase() + r.status.slice(1)}`, r.status)}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {agg.count} {t("mohorana.paymentsCount", "payments")}
                      {r.marriage_date && ` · ${t("mohorana.marriedOn")} ${fmtDate(r.marriage_date)}`}
                    </p>
                  </div>
                  <div className="text-right shrink-0 hidden sm:block">
                    <p className="text-xs text-muted-foreground">{t("mohorana.total")}: {recordFmt(total)}</p>
                    <p className="text-xs text-positive">{t("mohorana.paid")}: {recordFmt(agg.paid)}</p>
                    <p className="text-sm font-bold mt-0.5">{t("mohorana.remaining")}: {recordFmt(remaining)}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={e => { e.stopPropagation(); navigate(`/mohorana/${r.id}`); }}>
                        <BookOpen className="h-3.5 w-3.5 mr-2" /> {t("mohorana.openLedger", "Open Ledger")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={e => { e.stopPropagation(); openAdd(r); }}>
                        <Pencil className="h-3.5 w-3.5 mr-2" /> {t("action.edit")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={e => { e.stopPropagation(); navigate(`/mohorana/${r.id}`); }}>
                        <FileText className="h-3.5 w-3.5 mr-2" /> {t("action.report", "Report")}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={e => { e.stopPropagation(); setDeleteId(r.id); }}>
                        <Trash2 className="h-3.5 w-3.5 mr-2" /> {t("action.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <AddMohoranaModal open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) setEditing(null); }} editing={editing} />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title={t("mohorana.deleteTitle")}
        description={t("mohorana.deleteDesc")}
        onConfirm={() => { if (deleteId) deleteMut.mutate(deleteId); setDeleteId(null); }}
      />
      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title={t("bulk.deleteTitle")}
        description={t("bulk.deleteDesc").replace("{count}", String(selected.size))}
        onConfirm={handleBulkDelete}
        loading={bulkDeleting}
        confirmLabel={t("bulk.confirmDelete").replace("{count}", String(selected.size))}
      />
    </div>
  );
}
