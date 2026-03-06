import { useState, useMemo } from "react";
import { Plus, CreditCard, AlertTriangle, CheckCircle2, Clock, Search, RotateCcw, Trash2, Pencil, DollarSign } from "lucide-react";
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
import { usePayables, useCreatePayable, useUpdatePayable, useDeletePayable, useRecordPayment, PayableInsert } from "@/hooks/use-payables";
import { useAccounts } from "@/hooks/use-accounts";
import { useAppContext } from "@/contexts/AppContext";
import { useTranslation } from "@/i18n/useTranslation";
import { formatAmount, formatAppDate } from "@/lib/formatters";
import { parseISO, isAfter, startOfMonth, endOfMonth } from "date-fns";

const statusColors: Record<string, string> = { open: "bg-primary/10 text-primary", partial: "bg-warning/10 text-warning", paid: "bg-positive/10 text-positive", overdue: "bg-negative/10 text-negative" };

export default function Payables() {
  const { currency, isPremium, settings } = useAppContext();
  const { t, lang } = useTranslation();
  const { data: items = [], isLoading } = usePayables();
  const { data: accounts = [] } = useAccounts();
  const createMut = useCreatePayable();
  const updateMut = useUpdatePayable();
  const deleteMut = useDeletePayable();
  const payMut = useRecordPayment();

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [payModal, setPayModal] = useState<any>(null);
  const [payAmt, setPayAmt] = useState("");
  const [payAcct, setPayAcct] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [form, setForm] = useState({ person_name: "", reason: "", total_amount: "", paid_amount: "0", due_date: "", linked_account_id: "", note: "", status: "open" });
  const fmt = (n: number) => formatAmount(n, currency, lang);
  const fmtDate = (d: string) => formatAppDate(d, settings.dateFormat, settings.timezone, lang);
  const now = new Date();
  const mStart = startOfMonth(now);
  const mEnd = endOfMonth(now);

  const processed = useMemo(() => items.map(p => {
    if (p.status === "open" && p.due_date && isAfter(now, parseISO(p.due_date))) return { ...p, status: "overdue" };
    return p;
  }), [items]);

  const filtered = useMemo(() => processed.filter(p => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (search && !p.person_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [processed, statusFilter, search]);

  const totalPayable = processed.reduce((s, p) => s + (Number(p.total_amount) - Number(p.paid_amount)), 0);
  const overdueAmt = processed.filter(p => p.status === "overdue").reduce((s, p) => s + (Number(p.total_amount) - Number(p.paid_amount)), 0);
  const paidThisMonth = items.filter(p => p.status === "paid" && p.updated_at && parseISO(p.updated_at) >= mStart && parseISO(p.updated_at) <= mEnd).reduce((s, p) => s + Number(p.paid_amount), 0);
  const openCount = processed.filter(p => p.status !== "paid").length;

  const openModal = (item?: any) => {
    if (item) {
      setEditing(item);
      setForm({ person_name: item.person_name, reason: item.reason || "", total_amount: String(item.total_amount), paid_amount: String(item.paid_amount), due_date: item.due_date || "", linked_account_id: item.linked_account_id || "", note: item.note || "", status: item.status });
    } else {
      setEditing(null);
      setForm({ person_name: "", reason: "", total_amount: "", paid_amount: "0", due_date: "", linked_account_id: "", note: "", status: "open" });
    }
    setModal(true);
  };

  const handleSave = () => {
    const payload: PayableInsert = { person_name: form.person_name, reason: form.reason || null, total_amount: Number(form.total_amount), paid_amount: Number(form.paid_amount || 0), due_date: form.due_date || null, linked_account_id: form.linked_account_id || null, note: form.note || null, status: form.status };
    if (editing) updateMut.mutate({ id: editing.id, ...payload }, { onSuccess: () => setModal(false) });
    else createMut.mutate(payload, { onSuccess: () => setModal(false) });
  };

  const handlePay = () => {
    if (!payModal || !payAmt) return;
    payMut.mutate({ id: payModal.id, amount: Number(payAmt), linkedAccountId: payAcct || payModal.linked_account_id }, { onSuccess: () => { setPayModal(null); setPayAmt(""); setPayAcct(""); } });
  };

  if (!isPremium) {
    return (
      <div className="space-y-6">
        <PageHeader title={t("payables.title")} subtitle={t("payables.subtitle")} />
        <PremiumLocked icon={<CreditCard className="h-7 w-7 text-warning" />} moduleName={t("payables.title")} description={t("premium.upgradeDesc.payables")} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("payables.title")} subtitle={t("payables.subtitle")} actions={<Button size="sm" className="gap-1.5 shadow-sm" onClick={() => openModal()}><Plus className="h-4 w-4" /> {t("action.addPayable")}</Button>} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <FinanceCard icon={<CreditCard className="h-5 w-5 text-warning" />} iconBg="bg-warning/10" label={t("module.totalPayable")} value={fmt(totalPayable)} />
        <FinanceCard icon={<AlertTriangle className="h-5 w-5 text-negative" />} iconBg="bg-negative/10" label={t("module.overdue")} value={fmt(overdueAmt)} />
        <FinanceCard icon={<CheckCircle2 className="h-5 w-5 text-positive" />} iconBg="bg-positive/10" label={t("module.paidThisMonth")} value={fmt(paidThisMonth)} />
        <FinanceCard icon={<Clock className="h-5 w-5 text-primary" />} iconBg="bg-primary/10" label={t("module.openCount")} value={String(openCount)} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px] max-w-xs"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder={t("action.search") + "..."} value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" /></div>
        <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">{t("module.allStatus")}</SelectItem><SelectItem value="open">{t("status.open")}</SelectItem><SelectItem value="partial">{t("status.partial")}</SelectItem><SelectItem value="paid">{t("status.paid")}</SelectItem><SelectItem value="overdue">{t("status.overdue")}</SelectItem></SelectContent></Select>
        {(search || statusFilter !== "all") && <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={() => { setSearch(""); setStatusFilter("all"); }}><RotateCcw className="h-3 w-3" /> {t("action.reset")}</Button>}
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<CreditCard className="h-7 w-7 text-muted-foreground" />} title={t("module.noPayables")} description={t("module.noPayablesDesc")} action={<Button size="sm" onClick={() => openModal()}><Plus className="h-4 w-4 mr-1" /> {t("action.addPayable")}</Button>} />
      ) : (
        <Card className="finance-card-static overflow-hidden">
          <Table>
            <TableHeader><TableRow>
              <TableHead className="text-xs">{t("module.personVendor")}</TableHead><TableHead className="text-xs">{t("table.reason")}</TableHead>
              <TableHead className="text-xs text-right">{t("module.total")}</TableHead><TableHead className="text-xs text-right">{t("table.paid")}</TableHead>
              <TableHead className="text-xs text-right">{t("table.remaining")}</TableHead><TableHead className="text-xs">{t("table.dueDate")}</TableHead>
              <TableHead className="text-xs">{t("table.status")}</TableHead><TableHead className="text-xs text-right">{t("table.actions")}</TableHead>
            </TableRow></TableHeader>
            <TableBody>{filtered.map(p => {
              const remaining = Number(p.total_amount) - Number(p.paid_amount);
              return (<TableRow key={p.id} className="group">
                <TableCell className="text-xs font-medium">{p.person_name}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{p.reason || "—"}</TableCell>
                <TableCell className="text-xs text-right font-semibold">{fmt(Number(p.total_amount))}</TableCell>
                <TableCell className="text-xs text-right text-positive">{fmt(Number(p.paid_amount))}</TableCell>
                <TableCell className="text-xs text-right">{fmt(remaining)}</TableCell>
                <TableCell className="text-xs">{p.due_date ? fmtDate(p.due_date) : "—"}</TableCell>
                <TableCell><Badge variant="secondary" className={`text-[10px] capitalize ${statusColors[p.status] || ""}`}>{p.status}</Badge></TableCell>
                <TableCell className="text-right"><div className="flex items-center justify-end gap-1">
                  {p.status !== "paid" && <Button variant="ghost" size="icon" className="h-7 w-7" title={t("module.recordPayment")} onClick={() => { setPayModal(p); setPayAmt(""); setPayAcct(p.linked_account_id || ""); }}><DollarSign className="h-3.5 w-3.5" /></Button>}
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openModal(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-negative" onClick={() => setDeleteId(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div></TableCell>
              </TableRow>);
            })}</TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={modal} onOpenChange={setModal}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>{editing ? t("module.editPayable") : t("module.addPayable")}</DialogTitle></DialogHeader>
        <div className="space-y-3 py-1">
          <div><Label className="text-xs">{t("module.personVendor")} *</Label><Input value={form.person_name} onChange={e => setForm(f => ({ ...f, person_name: e.target.value }))} className="mt-1 h-9 text-sm" /></div>
          <div><Label className="text-xs">{t("table.reason")}</Label><Input value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} className="mt-1 h-9 text-sm" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">{t("module.totalAmount")} *</Label><Input type="number" min="0" value={form.total_amount} onChange={e => setForm(f => ({ ...f, total_amount: e.target.value }))} className="mt-1 h-9 text-sm" /></div>
            <div><Label className="text-xs">{t("module.paidAmount")}</Label><Input type="number" min="0" value={form.paid_amount} onChange={e => setForm(f => ({ ...f, paid_amount: e.target.value }))} className="mt-1 h-9 text-sm" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">{t("table.dueDate")}</Label><Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} className="mt-1 h-9 text-sm" /></div>
            <div><Label className="text-xs">{t("module.linkedAccount")}</Label><Select value={form.linked_account_id} onValueChange={v => setForm(f => ({ ...f, linked_account_id: v }))}><SelectTrigger className="mt-1 h-9 text-sm"><SelectValue placeholder="—" /></SelectTrigger><SelectContent>{accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div><Label className="text-xs">{t("table.note")}</Label><Textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} className="mt-1 text-sm" rows={2} /></div>
        </div>
        <DialogFooter><Button variant="outline" size="sm" onClick={() => setModal(false)}>{t("action.cancel")}</Button><Button size="sm" onClick={handleSave} disabled={!form.person_name || !form.total_amount || createMut.isPending || updateMut.isPending}>{createMut.isPending || updateMut.isPending ? t("common.saving") : t("action.save")}</Button></DialogFooter>
      </DialogContent></Dialog>

      <Dialog open={!!payModal} onOpenChange={() => setPayModal(null)}><DialogContent className="sm:max-w-sm"><DialogHeader><DialogTitle>{t("module.recordPayment")}</DialogTitle></DialogHeader>
        <div className="space-y-3 py-1">
          <p className="text-xs text-muted-foreground">{t("module.remaining")}: {payModal && fmt(Number(payModal.total_amount) - Number(payModal.paid_amount))}</p>
          <div><Label className="text-xs">{t("module.paymentAmount")} *</Label><Input type="number" min="0" value={payAmt} onChange={e => setPayAmt(e.target.value)} className="mt-1 h-9 text-sm" /></div>
          <div><Label className="text-xs">{t("module.debitFromAccount")}</Label><Select value={payAcct} onValueChange={setPayAcct}><SelectTrigger className="mt-1 h-9 text-sm"><SelectValue placeholder="—" /></SelectTrigger><SelectContent>{accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent></Select></div>
        </div>
        <DialogFooter><Button variant="outline" size="sm" onClick={() => setPayModal(null)}>{t("action.cancel")}</Button><Button size="sm" onClick={handlePay} disabled={!payAmt || payMut.isPending}>{payMut.isPending ? t("module.recording") : t("module.record")}</Button></DialogFooter>
      </DialogContent></Dialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title={t("confirm.deletePayable")} description={t("confirm.deleteDesc")} onConfirm={() => { if (deleteId) deleteMut.mutate(deleteId); setDeleteId(null); }} />
    </div>
  );
}
