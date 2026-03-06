import { useState, useMemo } from "react";
import { Plus, TrendingUp, TrendingDown, Hash, Search, RotateCcw, Trash2, Pencil, DollarSign } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { FinanceCard } from "@/components/shared/FinanceCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PremiumLocked } from "@/components/shared/PremiumLocked";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useInvestments, useCreateInvestment, useUpdateInvestment, useDeleteInvestment, InvestmentInsert } from "@/hooks/use-investments";
import { useAccounts } from "@/hooks/use-accounts";
import { useAppContext } from "@/contexts/AppContext";
import { useTranslation } from "@/i18n/useTranslation";
import { formatAmount, formatAppDate } from "@/lib/formatters";
import { parseISO } from "date-fns";

const INVESTMENT_TYPES = ["stocks", "mutual_funds", "dps_fdr", "crypto", "business_investment", "private_investment", "other"];
const statusColors: Record<string, string> = { active: "bg-positive/10 text-positive", closed: "bg-muted text-muted-foreground", on_hold: "bg-warning/10 text-warning" };

export default function Investments() {
  const { currency, isPremium, settings } = useAppContext();
  const { t, lang } = useTranslation();
  const { data: items = [], isLoading } = useInvestments();
  const { data: accounts = [] } = useAccounts();
  const createMut = useCreateInvestment();
  const updateMut = useUpdateInvestment();
  const deleteMut = useDeleteInvestment();

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [form, setForm] = useState({ investment_name: "", investment_type: "other", invested_amount: "", current_value: "", start_date: "", linked_account_id: "", note: "", status: "active" });
  const fmt = (n: number) => formatAmount(n, currency, lang);
  const fmtDate = (d: string) => formatAppDate(d, settings.dateFormat, settings.timezone, lang);

  const filtered = useMemo(() => items.filter(inv => {
    if (statusFilter !== "all" && inv.status !== statusFilter) return false;
    if (typeFilter !== "all" && inv.investment_type !== typeFilter) return false;
    if (search && !inv.investment_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [items, statusFilter, typeFilter, search]);

  const activeItems = items.filter(i => i.status === "active");
  const totalInvested = activeItems.reduce((s, i) => s + Number(i.invested_amount), 0);
  const totalCurrentValue = activeItems.reduce((s, i) => s + Number(i.current_value), 0);
  const totalPL = totalCurrentValue - totalInvested;
  const activeCount = activeItems.length;

  const openModal = (item?: any) => {
    if (item) {
      setEditing(item);
      setForm({ investment_name: item.investment_name, investment_type: item.investment_type, invested_amount: String(item.invested_amount), current_value: String(item.current_value), start_date: item.start_date || "", linked_account_id: item.linked_account_id || "", note: item.note || "", status: item.status });
    } else {
      setEditing(null);
      setForm({ investment_name: "", investment_type: "other", invested_amount: "", current_value: "", start_date: "", linked_account_id: "", note: "", status: "active" });
    }
    setModal(true);
  };

  const handleSave = () => {
    const payload: InvestmentInsert = { investment_name: form.investment_name, investment_type: form.investment_type, invested_amount: Number(form.invested_amount), current_value: Number(form.current_value || form.invested_amount), start_date: form.start_date || null, linked_account_id: form.linked_account_id || null, note: form.note || null, status: form.status };
    if (editing) updateMut.mutate({ id: editing.id, ...payload }, { onSuccess: () => setModal(false) });
    else createMut.mutate(payload, { onSuccess: () => setModal(false) });
  };

  if (!isPremium) {
    return (
      <div className="space-y-6">
        <PageHeader title={t("investments.title")} subtitle={t("investments.subtitle")} />
        <PremiumLocked icon={<TrendingUp className="h-7 w-7 text-feature-investments" />} moduleName={t("investments.title")} description={t("premium.upgradeDesc.investments")} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("investments.title")} subtitle={t("investments.subtitle")} actions={<Button size="sm" className="gap-1.5 shadow-sm" onClick={() => openModal()}><Plus className="h-4 w-4" /> {t("action.addInvestment")}</Button>} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <FinanceCard icon={<DollarSign className="h-5 w-5 text-feature-investments" />} iconBg="bg-feature-investments/10" label={t("module.totalInvested")} value={fmt(totalInvested)} />
        <FinanceCard icon={<TrendingUp className="h-5 w-5 text-feature-investments" />} iconBg="bg-feature-investments/10" label={t("module.currentValue")} value={fmt(totalCurrentValue)} />
        <FinanceCard icon={totalPL >= 0 ? <TrendingUp className="h-5 w-5 text-positive" /> : <TrendingDown className="h-5 w-5 text-negative" />} iconBg={totalPL >= 0 ? "bg-positive/10" : "bg-negative/10"} label={t("module.profitLoss")} value={`${totalPL >= 0 ? "+" : ""}${fmt(totalPL)}`} />
        <FinanceCard icon={<Hash className="h-5 w-5 text-feature-investments" />} iconBg="bg-feature-investments/10" label={t("module.activeCount")} value={String(activeCount)} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px] max-w-xs"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder={t("action.search") + "..."} value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" /></div>
        <Select value={typeFilter} onValueChange={setTypeFilter}><SelectTrigger className="w-[150px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">{t("module.allTypes")}</SelectItem>{INVESTMENT_TYPES.map(it => <SelectItem key={it} value={it}>{it.replace(/_/g, " ")}</SelectItem>)}</SelectContent></Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">{t("module.allStatus")}</SelectItem><SelectItem value="active">{t("status.active")}</SelectItem><SelectItem value="closed">{t("status.closed")}</SelectItem><SelectItem value="on_hold">{t("status.onHold")}</SelectItem></SelectContent></Select>
        {(search || typeFilter !== "all" || statusFilter !== "all") && <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={() => { setSearch(""); setTypeFilter("all"); setStatusFilter("all"); }}><RotateCcw className="h-3 w-3" /> {t("action.reset")}</Button>}
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<TrendingUp className="h-7 w-7 text-muted-foreground" />} title={t("module.noInvestments")} description={t("module.noInvestmentsDesc")} action={<Button size="sm" onClick={() => openModal()}><Plus className="h-4 w-4 mr-1" /> {t("action.addInvestment")}</Button>} />
      ) : (
        <Card className="finance-card-static overflow-hidden">
          <Table>
            <TableHeader><TableRow>
              <TableHead className="text-xs">{t("table.name")}</TableHead><TableHead className="text-xs">{t("module.investmentType")}</TableHead>
              <TableHead className="text-xs text-right">{t("module.invested")}</TableHead><TableHead className="text-xs text-right">{t("module.current")}</TableHead>
              <TableHead className="text-xs text-right">{t("module.profitLoss")}</TableHead><TableHead className="text-xs text-right">{t("module.roi")}</TableHead>
              <TableHead className="text-xs">{t("module.startDate")}</TableHead><TableHead className="text-xs">{t("table.status")}</TableHead>
              <TableHead className="text-xs text-right">{t("table.actions")}</TableHead>
            </TableRow></TableHeader>
            <TableBody>{filtered.map(inv => {
              const pl = Number(inv.current_value) - Number(inv.invested_amount);
              const roi = Number(inv.invested_amount) > 0 ? ((pl / Number(inv.invested_amount)) * 100).toFixed(1) : "0";
              return (<TableRow key={inv.id} className="group">
                <TableCell className="text-xs font-medium">{inv.investment_name}</TableCell>
                <TableCell className="text-xs text-muted-foreground capitalize">{inv.investment_type.replace(/_/g, " ")}</TableCell>
                <TableCell className="text-xs text-right">{fmt(Number(inv.invested_amount))}</TableCell>
                <TableCell className="text-xs text-right font-semibold">{fmt(Number(inv.current_value))}</TableCell>
                <TableCell className={`text-xs text-right font-semibold ${pl >= 0 ? "text-positive" : "text-negative"}`}>{pl >= 0 ? "+" : ""}{fmt(pl)}</TableCell>
                <TableCell className={`text-xs text-right ${Number(roi) >= 0 ? "text-positive" : "text-negative"}`}>{roi}%</TableCell>
                <TableCell className="text-xs">{inv.start_date ? fmtDate(inv.start_date) : "—"}</TableCell>
                <TableCell><Badge variant="secondary" className={`text-[10px] capitalize ${statusColors[inv.status] || ""}`}>{inv.status.replace(/_/g, " ")}</Badge></TableCell>
                <TableCell className="text-right"><div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openModal(inv)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-negative" onClick={() => setDeleteId(inv.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div></TableCell>
              </TableRow>);
            })}</TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={modal} onOpenChange={setModal}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>{editing ? t("module.editInvestment") : t("module.addInvestment")}</DialogTitle></DialogHeader>
        <div className="space-y-3 py-1">
          <div><Label className="text-xs">{t("module.investmentName")} *</Label><Input value={form.investment_name} onChange={e => setForm(f => ({ ...f, investment_name: e.target.value }))} className="mt-1 h-9 text-sm" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">{t("module.investmentType")}</Label><Select value={form.investment_type} onValueChange={v => setForm(f => ({ ...f, investment_type: v }))}><SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger><SelectContent>{INVESTMENT_TYPES.map(it => <SelectItem key={it} value={it}>{it.replace(/_/g, " ")}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className="text-xs">{t("table.status")}</Label><Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}><SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">{t("status.active")}</SelectItem><SelectItem value="closed">{t("status.closed")}</SelectItem><SelectItem value="on_hold">{t("status.onHold")}</SelectItem></SelectContent></Select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">{t("module.investedAmount")} *</Label><Input type="number" min="0" value={form.invested_amount} onChange={e => setForm(f => ({ ...f, invested_amount: e.target.value }))} className="mt-1 h-9 text-sm" /></div>
            <div><Label className="text-xs">{t("module.currentValue")}</Label><Input type="number" min="0" value={form.current_value} onChange={e => setForm(f => ({ ...f, current_value: e.target.value }))} className="mt-1 h-9 text-sm" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">{t("module.startDate")}</Label><Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className="mt-1 h-9 text-sm" /></div>
            <div><Label className="text-xs">{t("module.linkedAccount")}</Label><Select value={form.linked_account_id} onValueChange={v => setForm(f => ({ ...f, linked_account_id: v }))}><SelectTrigger className="mt-1 h-9 text-sm"><SelectValue placeholder="—" /></SelectTrigger><SelectContent>{accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div><Label className="text-xs">{t("table.note")}</Label><Textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} className="mt-1 text-sm" rows={2} /></div>
        </div>
        <DialogFooter><Button variant="outline" size="sm" onClick={() => setModal(false)}>{t("action.cancel")}</Button><Button size="sm" onClick={handleSave} disabled={!form.investment_name || !form.invested_amount || createMut.isPending || updateMut.isPending}>{createMut.isPending || updateMut.isPending ? t("common.saving") : t("action.save")}</Button></DialogFooter>
      </DialogContent></Dialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title={t("confirm.deleteInvestment")} description={t("confirm.deleteDesc")} onConfirm={() => { if (deleteId) deleteMut.mutate(deleteId); setDeleteId(null); }} />
    </div>
  );
}
