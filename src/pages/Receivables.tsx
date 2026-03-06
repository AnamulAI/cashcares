import { useState, useMemo } from "react";
import { Plus, HandCoins, AlertTriangle, CheckCircle2, Clock, Search, RotateCcw, Trash2, Pencil, DollarSign } from "lucide-react";
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
import { useReceivables, useCreateReceivable, useUpdateReceivable, useDeleteReceivable, useRecordCollection, ReceivableInsert } from "@/hooks/use-receivables";
import { useAccounts } from "@/hooks/use-accounts";
import { useAppContext } from "@/contexts/AppContext";
import { useTranslation } from "@/i18n/useTranslation";
import { formatAmount, formatAppDate } from "@/lib/formatters";
import { parseISO, isAfter, startOfMonth, endOfMonth } from "date-fns";

const statusColors: Record<string, string> = {
  open: "bg-primary/10 text-primary",
  partial: "bg-warning/10 text-warning",
  collected: "bg-positive/10 text-positive",
  overdue: "bg-negative/10 text-negative",
};

export default function Receivables() {
  const { currency, isPremium, settings } = useAppContext();
  const { t, lang } = useTranslation();
  const { data: items = [], isLoading } = useReceivables();
  const { data: accounts = [] } = useAccounts();
  const createMut = useCreateReceivable();
  const updateMut = useUpdateReceivable();
  const deleteMut = useDeleteReceivable();
  const collectMut = useRecordCollection();

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [collectModal, setCollectModal] = useState<any>(null);
  const [collectAmt, setCollectAmt] = useState("");
  const [collectAcct, setCollectAcct] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [form, setForm] = useState({ person_name: "", reason: "", total_amount: "", received_amount: "0", due_date: "", linked_account_id: "", note: "", status: "open" });

  const fmt = (n: number) => formatAmount(n, currency, lang);
  const fmtDate = (d: string) => formatAppDate(d, settings.dateFormat, settings.timezone, lang);

  const now = new Date();
  const mStart = startOfMonth(now);
  const mEnd = endOfMonth(now);

  const processed = useMemo(() => items.map(r => {
    if (r.status === "open" && r.due_date && isAfter(now, parseISO(r.due_date))) return { ...r, status: "overdue" };
    return r;
  }), [items]);

  const filtered = useMemo(() => processed.filter(r => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (search && !r.person_name.toLowerCase().includes(search.toLowerCase()) && !(r.reason || "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [processed, statusFilter, search]);

  const totalReceivable = processed.reduce((s, r) => s + (Number(r.total_amount) - Number(r.received_amount)), 0);
  const overdueAmt = processed.filter(r => r.status === "overdue").reduce((s, r) => s + (Number(r.total_amount) - Number(r.received_amount)), 0);
  const collectedThisMonth = items.filter(r => r.status === "collected" && r.updated_at && parseISO(r.updated_at) >= mStart && parseISO(r.updated_at) <= mEnd).reduce((s, r) => s + Number(r.received_amount), 0);
  const openCount = processed.filter(r => r.status !== "collected").length;

  const openModal = (item?: any) => {
    if (item) {
      setEditing(item);
      setForm({ person_name: item.person_name, reason: item.reason || "", total_amount: String(item.total_amount), received_amount: String(item.received_amount), due_date: item.due_date || "", linked_account_id: item.linked_account_id || "", note: item.note || "", status: item.status });
    } else {
      setEditing(null);
      setForm({ person_name: "", reason: "", total_amount: "", received_amount: "0", due_date: "", linked_account_id: "", note: "", status: "open" });
    }
    setModal(true);
  };

  const handleSave = () => {
    const payload: ReceivableInsert = {
      person_name: form.person_name,
      reason: form.reason || null,
      total_amount: Number(form.total_amount),
      received_amount: Number(form.received_amount || 0),
      due_date: form.due_date || null,
      linked_account_id: form.linked_account_id || null,
      note: form.note || null,
      status: form.status,
    };
    if (editing) {
      updateMut.mutate({ id: editing.id, ...payload }, { onSuccess: () => setModal(false) });
    } else {
      createMut.mutate(payload, { onSuccess: () => setModal(false) });
    }
  };

  const handleCollect = () => {
    if (!collectModal || !collectAmt) return;
    collectMut.mutate({ id: collectModal.id, amount: Number(collectAmt), linkedAccountId: collectAcct || collectModal.linked_account_id }, {
      onSuccess: () => { setCollectModal(null); setCollectAmt(""); setCollectAcct(""); }
    });
  };

  if (!isPremium) {
    return (
      <div className="space-y-6">
        <PageHeader title={t("receivables.title")} subtitle={t("receivables.subtitle")} />
        <PremiumLocked icon={<HandCoins className="h-7 w-7 text-primary" />} moduleName={t("receivables.title")} description={t("premium.upgradeDesc.receivables")} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("receivables.title")} subtitle={t("receivables.subtitle")} actions={<Button size="sm" className="gap-1.5 shadow-sm" onClick={() => openModal()}><Plus className="h-4 w-4" /> {t("action.addReceivable")}</Button>} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <FinanceCard icon={<HandCoins className="h-5 w-5 text-feature-receivables" />} iconBg="bg-feature-receivables/10" label={t("module.totalReceivable")} value={fmt(totalReceivable)} />
        <FinanceCard icon={<AlertTriangle className="h-5 w-5 text-negative" />} iconBg="bg-negative/10" label={t("module.overdue")} value={fmt(overdueAmt)} />
        <FinanceCard icon={<CheckCircle2 className="h-5 w-5 text-positive" />} iconBg="bg-positive/10" label={t("module.collectedThisMonth")} value={fmt(collectedThisMonth)} />
        <FinanceCard icon={<Clock className="h-5 w-5 text-feature-receivables" />} iconBg="bg-feature-receivables/10" label={t("module.openCount")} value={String(openCount)} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder={t("action.search") + "..."} value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("module.allStatus")}</SelectItem>
            <SelectItem value="open">{t("status.open")}</SelectItem>
            <SelectItem value="partial">{t("status.partial")}</SelectItem>
            <SelectItem value="collected">{t("status.collected")}</SelectItem>
            <SelectItem value="overdue">{t("status.overdue")}</SelectItem>
          </SelectContent>
        </Select>
        {(search || statusFilter !== "all") && <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={() => { setSearch(""); setStatusFilter("all"); }}><RotateCcw className="h-3 w-3" /> {t("action.reset")}</Button>}
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<HandCoins className="h-7 w-7 text-muted-foreground" />}
          title={t("module.noReceivables")}
          description={t("module.noReceivablesDesc")}
          action={<Button size="sm" onClick={() => openModal()}><Plus className="h-4 w-4 mr-1" /> {t("action.addReceivable")}</Button>}
        />
      ) : (
        <Card className="finance-card-static overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">{t("module.person")}</TableHead>
                <TableHead className="text-xs">{t("table.reason")}</TableHead>
                <TableHead className="text-xs text-right">{t("module.total")}</TableHead>
                <TableHead className="text-xs text-right">{t("module.received")}</TableHead>
                <TableHead className="text-xs text-right">{t("table.remaining")}</TableHead>
                <TableHead className="text-xs">{t("table.dueDate")}</TableHead>
                <TableHead className="text-xs">{t("table.status")}</TableHead>
                <TableHead className="text-xs text-right">{t("table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(r => {
                const remaining = Number(r.total_amount) - Number(r.received_amount);
                return (
                  <TableRow key={r.id} className="group">
                    <TableCell className="text-xs font-medium">{r.person_name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.reason || "—"}</TableCell>
                    <TableCell className="text-xs text-right font-semibold">{fmt(Number(r.total_amount))}</TableCell>
                    <TableCell className="text-xs text-right text-positive">{fmt(Number(r.received_amount))}</TableCell>
                    <TableCell className="text-xs text-right">{fmt(remaining)}</TableCell>
                    <TableCell className="text-xs">{r.due_date ? fmtDate(r.due_date) : "—"}</TableCell>
                    <TableCell><Badge variant="secondary" className={`text-[10px] capitalize ${statusColors[r.status] || ""}`}>{r.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {r.status !== "collected" && <Button variant="ghost" size="icon" className="h-7 w-7" title={t("module.recordCollection")} onClick={() => { setCollectModal(r); setCollectAmt(""); setCollectAcct(r.linked_account_id || ""); }}><DollarSign className="h-3.5 w-3.5" /></Button>}
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openModal(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-negative" onClick={() => setDeleteId(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={modal} onOpenChange={setModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? t("module.editReceivable") : t("module.addReceivable")}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-1">
            <div><Label className="text-xs">{t("module.personName")} *</Label><Input value={form.person_name} onChange={e => setForm(f => ({ ...f, person_name: e.target.value }))} className="mt-1 h-9 text-sm" /></div>
            <div><Label className="text-xs">{t("table.reason")}</Label><Input value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} className="mt-1 h-9 text-sm" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">{t("module.totalAmount")} *</Label><Input type="number" min="0" value={form.total_amount} onChange={e => setForm(f => ({ ...f, total_amount: e.target.value }))} className="mt-1 h-9 text-sm" /></div>
              <div><Label className="text-xs">{t("module.receivedAmount")}</Label><Input type="number" min="0" value={form.received_amount} onChange={e => setForm(f => ({ ...f, received_amount: e.target.value }))} className="mt-1 h-9 text-sm" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">{t("table.dueDate")}</Label><Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} className="mt-1 h-9 text-sm" /></div>
              <div>
                <Label className="text-xs">{t("module.linkedAccount")}</Label>
                <Select value={form.linked_account_id} onValueChange={v => setForm(f => ({ ...f, linked_account_id: v }))}>
                  <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>{accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label className="text-xs">{t("table.note")}</Label><Textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} className="mt-1 text-sm" rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setModal(false)}>{t("action.cancel")}</Button>
            <Button size="sm" onClick={handleSave} disabled={!form.person_name || !form.total_amount || createMut.isPending || updateMut.isPending}>
              {createMut.isPending || updateMut.isPending ? t("common.saving") : t("action.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Collection Modal */}
      <Dialog open={!!collectModal} onOpenChange={() => setCollectModal(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>{t("module.recordCollection")}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-1">
            <p className="text-xs text-muted-foreground">{t("module.remaining")}: {collectModal && fmt(Number(collectModal.total_amount) - Number(collectModal.received_amount))}</p>
            <div><Label className="text-xs">{t("module.collectionAmount")} *</Label><Input type="number" min="0" value={collectAmt} onChange={e => setCollectAmt(e.target.value)} className="mt-1 h-9 text-sm" /></div>
            <div>
              <Label className="text-xs">{t("module.creditToAccount")}</Label>
              <Select value={collectAcct} onValueChange={setCollectAcct}>
                <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>{accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setCollectModal(null)}>{t("action.cancel")}</Button>
            <Button size="sm" onClick={handleCollect} disabled={!collectAmt || collectMut.isPending}>{collectMut.isPending ? t("module.recording") : t("module.record")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title={t("confirm.deleteReceivable")}
        description={t("confirm.deleteDesc")}
        onConfirm={() => { if (deleteId) deleteMut.mutate(deleteId); setDeleteId(null); }}
      />
    </div>
  );
}
