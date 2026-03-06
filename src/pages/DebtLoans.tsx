import { useState, useMemo } from "react";
import { Plus, Scale, AlertTriangle, CheckCircle2, Clock, Search, RotateCcw, Trash2, Pencil, DollarSign } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useLoans, useCreateLoan, useUpdateLoan, useDeleteLoan, useRecordRepayment, LoanInsert } from "@/hooks/use-loans";
import { useAccounts } from "@/hooks/use-accounts";
import { useAppContext } from "@/contexts/AppContext";
import { useTranslation } from "@/i18n/useTranslation";
import { formatAmount, formatAppDate } from "@/lib/formatters";
import { parseISO, isAfter, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

const LOAN_TYPES = ["borrowed", "personal_loan", "business_loan", "installment", "informal_debt"];
const statusColors: Record<string, string> = { active: "bg-primary/10 text-primary", partial: "bg-warning/10 text-warning", paid_off: "bg-positive/10 text-positive", overdue: "bg-negative/10 text-negative" };

export default function DebtLoans() {
  const { currency, isPremium, settings } = useAppContext();
  const { t } = useTranslation();
  const { data: items = [], isLoading } = useLoans();
  const { data: accounts = [] } = useAccounts();
  const createMut = useCreateLoan();
  const updateMut = useUpdateLoan();
  const deleteMut = useDeleteLoan();
  const repayMut = useRecordRepayment();

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [repayModal, setRepayModal] = useState<any>(null);
  const [repayAmt, setRepayAmt] = useState("");
  const [repayAcct, setRepayAcct] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [form, setForm] = useState({ lender_name: "", loan_type: "borrowed", principal_amount: "", paid_amount: "0", due_date: "", installment_amount: "", interest_rate: "", linked_account_id: "", note: "", status: "active" });
  const fmt = (n: number) => formatAmount(n, currency);
  const fmtDate = (d: string) => formatAppDate(d, settings.dateFormat, settings.timezone);
  const now = new Date();
  const mStart = startOfMonth(now);
  const mEnd = endOfMonth(now);

  const processed = useMemo(() => items.map(l => {
    if (l.status === "active" && l.due_date && isAfter(now, parseISO(l.due_date))) return { ...l, status: "overdue" };
    return l;
  }), [items]);

  const filtered = useMemo(() => processed.filter(l => {
    if (statusFilter !== "all" && l.status !== statusFilter) return false;
    if (typeFilter !== "all" && l.loan_type !== typeFilter) return false;
    if (search && !l.lender_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [processed, statusFilter, typeFilter, search]);

  const totalDebt = processed.reduce((s, l) => s + (Number(l.principal_amount) - Number(l.paid_amount)), 0);
  const dueThisMonth = processed.filter(l => l.due_date && isWithinInterval(parseISO(l.due_date), { start: mStart, end: mEnd })).reduce((s, l) => s + (Number(l.principal_amount) - Number(l.paid_amount)), 0);
  const paidThisMonth = items.filter(l => l.updated_at && parseISO(l.updated_at) >= mStart && parseISO(l.updated_at) <= mEnd && Number(l.paid_amount) > 0).reduce((s, l) => s + Number(l.paid_amount), 0);
  const activeCount = processed.filter(l => l.status !== "paid_off").length;

  const openModal = (item?: any) => {
    if (item) {
      setEditing(item);
      setForm({ lender_name: item.lender_name, loan_type: item.loan_type, principal_amount: String(item.principal_amount), paid_amount: String(item.paid_amount), due_date: item.due_date || "", installment_amount: item.installment_amount ? String(item.installment_amount) : "", interest_rate: item.interest_rate ? String(item.interest_rate) : "", linked_account_id: item.linked_account_id || "", note: item.note || "", status: item.status });
    } else {
      setEditing(null);
      setForm({ lender_name: "", loan_type: "borrowed", principal_amount: "", paid_amount: "0", due_date: "", installment_amount: "", interest_rate: "", linked_account_id: "", note: "", status: "active" });
    }
    setModal(true);
  };

  const handleSave = () => {
    const payload: LoanInsert = { lender_name: form.lender_name, loan_type: form.loan_type, principal_amount: Number(form.principal_amount), paid_amount: Number(form.paid_amount || 0), due_date: form.due_date || null, installment_amount: form.installment_amount ? Number(form.installment_amount) : null, interest_rate: form.interest_rate ? Number(form.interest_rate) : null, linked_account_id: form.linked_account_id || null, note: form.note || null, status: form.status };
    if (editing) updateMut.mutate({ id: editing.id, ...payload }, { onSuccess: () => setModal(false) });
    else createMut.mutate(payload, { onSuccess: () => setModal(false) });
  };

  const handleRepay = () => {
    if (!repayModal || !repayAmt) return;
    repayMut.mutate({ id: repayModal.id, amount: Number(repayAmt), linkedAccountId: repayAcct || repayModal.linked_account_id }, { onSuccess: () => { setRepayModal(null); setRepayAmt(""); setRepayAcct(""); } });
  };

  if (!isPremium) {
    return (
      <div className="space-y-6">
        <PageHeader title={t("debtLoans.title")} subtitle={t("debtLoans.subtitle")} />
        <PremiumLocked icon={<Scale className="h-7 w-7 text-negative" />} moduleName={t("debtLoans.title")} description={t("premium.upgradeDesc.debtLoans")} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("debtLoans.title")} subtitle={t("debtLoans.subtitle")} actions={<Button size="sm" className="gap-1.5 shadow-sm" onClick={() => openModal()}><Plus className="h-4 w-4" /> {t("action.addLoan")}</Button>} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <FinanceCard icon={<Scale className="h-5 w-5 text-negative" />} iconBg="bg-negative/10" label={t("module.totalOutstanding")} value={fmt(totalDebt)} />
        <FinanceCard icon={<Clock className="h-5 w-5 text-warning" />} iconBg="bg-warning/10" label={t("module.dueThisMonth")} value={fmt(dueThisMonth)} />
        <FinanceCard icon={<CheckCircle2 className="h-5 w-5 text-positive" />} iconBg="bg-positive/10" label={t("module.paidThisMonth")} value={fmt(paidThisMonth)} />
        <FinanceCard icon={<AlertTriangle className="h-5 w-5 text-primary" />} iconBg="bg-primary/10" label={t("module.activeLoans")} value={String(activeCount)} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px] max-w-xs"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder={t("action.search") + "..."} value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" /></div>
        <Select value={typeFilter} onValueChange={setTypeFilter}><SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">{t("module.allTypes")}</SelectItem>{LOAN_TYPES.map(lt => <SelectItem key={lt} value={lt}>{lt.replace(/_/g, " ")}</SelectItem>)}</SelectContent></Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">{t("module.allStatus")}</SelectItem><SelectItem value="active">{t("status.active")}</SelectItem><SelectItem value="partial">{t("status.partial")}</SelectItem><SelectItem value="paid_off">{t("status.paidOff")}</SelectItem><SelectItem value="overdue">{t("status.overdue")}</SelectItem></SelectContent></Select>
        {(search || statusFilter !== "all" || typeFilter !== "all") && <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={() => { setSearch(""); setStatusFilter("all"); setTypeFilter("all"); }}><RotateCcw className="h-3 w-3" /> {t("action.reset")}</Button>}
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Scale className="h-7 w-7 text-muted-foreground" />} title={t("module.noLoans")} description={t("module.noLoansDesc")} action={<Button size="sm" onClick={() => openModal()}><Plus className="h-4 w-4 mr-1" /> {t("action.addLoan")}</Button>} />
      ) : (
        <Card className="finance-card-static overflow-hidden">
          <Table>
            <TableHeader><TableRow>
              <TableHead className="text-xs">{t("module.lender")}</TableHead><TableHead className="text-xs">{t("module.loanType")}</TableHead>
              <TableHead className="text-xs text-right">{t("module.principal")}</TableHead><TableHead className="text-xs text-right">{t("table.paid")}</TableHead>
              <TableHead className="text-xs">{t("module.progress")}</TableHead><TableHead className="text-xs">{t("table.dueDate")}</TableHead>
              <TableHead className="text-xs">{t("table.status")}</TableHead><TableHead className="text-xs text-right">{t("table.actions")}</TableHead>
            </TableRow></TableHeader>
            <TableBody>{filtered.map(l => {
              const pct = Number(l.principal_amount) > 0 ? Math.round((Number(l.paid_amount) / Number(l.principal_amount)) * 100) : 0;
              return (<TableRow key={l.id} className="group">
                <TableCell className="text-xs font-medium">{l.lender_name}</TableCell>
                <TableCell className="text-xs text-muted-foreground capitalize">{l.loan_type.replace(/_/g, " ")}</TableCell>
                <TableCell className="text-xs text-right font-semibold">{fmt(Number(l.principal_amount))}</TableCell>
                <TableCell className="text-xs text-right text-positive">{fmt(Number(l.paid_amount))}</TableCell>
                <TableCell><div className="flex items-center gap-2 min-w-[80px]"><Progress value={pct} className="h-1.5 flex-1" /><span className="text-[10px] text-muted-foreground">{pct}%</span></div></TableCell>
                <TableCell className="text-xs">{l.due_date ? fmtDate(l.due_date) : "—"}</TableCell>
                <TableCell><Badge variant="secondary" className={`text-[10px] capitalize ${statusColors[l.status] || ""}`}>{l.status.replace(/_/g, " ")}</Badge></TableCell>
                <TableCell className="text-right"><div className="flex items-center justify-end gap-1">
                  {l.status !== "paid_off" && <Button variant="ghost" size="icon" className="h-7 w-7" title={t("module.recordRepayment")} onClick={() => { setRepayModal(l); setRepayAmt(""); setRepayAcct(l.linked_account_id || ""); }}><DollarSign className="h-3.5 w-3.5" /></Button>}
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openModal(l)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-negative" onClick={() => setDeleteId(l.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div></TableCell>
              </TableRow>);
            })}</TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={modal} onOpenChange={setModal}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>{editing ? t("module.editLoan") : t("module.addLoan")}</DialogTitle></DialogHeader>
        <div className="space-y-3 py-1">
          <div><Label className="text-xs">{t("module.lenderName")} *</Label><Input value={form.lender_name} onChange={e => setForm(f => ({ ...f, lender_name: e.target.value }))} className="mt-1 h-9 text-sm" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">{t("module.loanType")}</Label><Select value={form.loan_type} onValueChange={v => setForm(f => ({ ...f, loan_type: v }))}><SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger><SelectContent>{LOAN_TYPES.map(lt => <SelectItem key={lt} value={lt}>{lt.replace(/_/g, " ")}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className="text-xs">{t("table.dueDate")}</Label><Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} className="mt-1 h-9 text-sm" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">{t("module.principalAmount")} *</Label><Input type="number" min="0" value={form.principal_amount} onChange={e => setForm(f => ({ ...f, principal_amount: e.target.value }))} className="mt-1 h-9 text-sm" /></div>
            <div><Label className="text-xs">{t("module.paidAmount")}</Label><Input type="number" min="0" value={form.paid_amount} onChange={e => setForm(f => ({ ...f, paid_amount: e.target.value }))} className="mt-1 h-9 text-sm" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">{t("module.installmentAmount")}</Label><Input type="number" min="0" value={form.installment_amount} onChange={e => setForm(f => ({ ...f, installment_amount: e.target.value }))} className="mt-1 h-9 text-sm" /></div>
            <div><Label className="text-xs">{t("module.interestRate")} %</Label><Input type="number" min="0" value={form.interest_rate} onChange={e => setForm(f => ({ ...f, interest_rate: e.target.value }))} className="mt-1 h-9 text-sm" /></div>
          </div>
          <div><Label className="text-xs">{t("module.linkedAccount")}</Label><Select value={form.linked_account_id} onValueChange={v => setForm(f => ({ ...f, linked_account_id: v }))}><SelectTrigger className="mt-1 h-9 text-sm"><SelectValue placeholder="—" /></SelectTrigger><SelectContent>{accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent></Select></div>
          <div><Label className="text-xs">{t("table.note")}</Label><Textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} className="mt-1 text-sm" rows={2} /></div>
        </div>
        <DialogFooter><Button variant="outline" size="sm" onClick={() => setModal(false)}>{t("action.cancel")}</Button><Button size="sm" onClick={handleSave} disabled={!form.lender_name || !form.principal_amount || createMut.isPending || updateMut.isPending}>{createMut.isPending || updateMut.isPending ? t("common.saving") : t("action.save")}</Button></DialogFooter>
      </DialogContent></Dialog>

      <Dialog open={!!repayModal} onOpenChange={() => setRepayModal(null)}><DialogContent className="sm:max-w-sm"><DialogHeader><DialogTitle>{t("module.recordRepayment")}</DialogTitle></DialogHeader>
        <div className="space-y-3 py-1">
          <p className="text-xs text-muted-foreground">{t("module.remaining")}: {repayModal && fmt(Number(repayModal.principal_amount) - Number(repayModal.paid_amount))}</p>
          <div><Label className="text-xs">{t("module.repaymentAmount")} *</Label><Input type="number" min="0" value={repayAmt} onChange={e => setRepayAmt(e.target.value)} className="mt-1 h-9 text-sm" /></div>
          <div><Label className="text-xs">{t("module.debitFromAccount")}</Label><Select value={repayAcct} onValueChange={setRepayAcct}><SelectTrigger className="mt-1 h-9 text-sm"><SelectValue placeholder="—" /></SelectTrigger><SelectContent>{accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent></Select></div>
        </div>
        <DialogFooter><Button variant="outline" size="sm" onClick={() => setRepayModal(null)}>{t("action.cancel")}</Button><Button size="sm" onClick={handleRepay} disabled={!repayAmt || repayMut.isPending}>{repayMut.isPending ? t("module.recording") : t("module.record")}</Button></DialogFooter>
      </DialogContent></Dialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title={t("confirm.deleteLoan")} description={t("confirm.deleteDesc")} onConfirm={() => { if (deleteId) deleteMut.mutate(deleteId); setDeleteId(null); }} />
    </div>
  );
}
