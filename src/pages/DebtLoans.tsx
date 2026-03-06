import { useState, useMemo } from "react";
import { Plus, Scale, AlertTriangle, CheckCircle2, Clock, Search, RotateCcw, Trash2, Pencil, DollarSign } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { FinanceCard } from "@/components/shared/FinanceCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useLoans, useCreateLoan, useUpdateLoan, useDeleteLoan, useRecordRepayment, LoanInsert } from "@/hooks/use-loans";
import { useAccounts } from "@/hooks/use-accounts";
import { useAppContext } from "@/contexts/AppContext";
import { format, parseISO, isAfter, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

const LOAN_TYPES = ["borrowed", "personal_loan", "business_loan", "installment", "informal_debt"];
const statusColors: Record<string, string> = { active: "bg-primary/10 text-primary", partial: "bg-warning/10 text-warning", paid_off: "bg-positive/10 text-positive", overdue: "bg-negative/10 text-negative" };

export default function DebtLoans() {
  const { currency, isPremium } = useAppContext();
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
  const fmt = (n: number) => `${currency.symbol}${n.toLocaleString()}`;
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
        <PageHeader title="Debt & Loans" subtitle="Track obligations, due dates, and repayment progress" />
        <Card className="finance-card-static"><CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-negative/10 mb-4"><Scale className="h-7 w-7 text-negative" /></div>
          <h3 className="text-base font-semibold">Premium Module</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">Upgrade to Premium to track debt and loans.</p>
          <Button className="mt-4" onClick={() => window.location.href = "/subscription"}>Upgrade Now</Button>
        </CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Debt & Loans" subtitle="Track obligations, due dates, and repayment progress" actions={<Button size="sm" className="gap-1.5 shadow-sm" onClick={() => openModal()}><Plus className="h-4 w-4" /> Add Loan</Button>} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <FinanceCard icon={<Scale className="h-5 w-5 text-negative" />} iconBg="bg-negative/10" label="Total Outstanding" value={fmt(totalDebt)} />
        <FinanceCard icon={<Clock className="h-5 w-5 text-warning" />} iconBg="bg-warning/10" label="Due This Month" value={fmt(dueThisMonth)} />
        <FinanceCard icon={<CheckCircle2 className="h-5 w-5 text-positive" />} iconBg="bg-positive/10" label="Paid This Month" value={fmt(paidThisMonth)} />
        <FinanceCard icon={<AlertTriangle className="h-5 w-5 text-primary" />} iconBg="bg-primary/10" label="Active Loans" value={String(activeCount)} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px] max-w-xs"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" /></div>
        <Select value={typeFilter} onValueChange={setTypeFilter}><SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Types</SelectItem>{LOAN_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}</SelectContent></Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="paid_off">Paid Off</SelectItem><SelectItem value="overdue">Overdue</SelectItem></SelectContent></Select>
        {(search || statusFilter !== "all" || typeFilter !== "all") && <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={() => { setSearch(""); setStatusFilter("all"); setTypeFilter("all"); }}><RotateCcw className="h-3 w-3" /> Reset</Button>}
      </div>

      {isLoading ? <Card className="finance-card-static"><CardContent className="py-12 text-center text-sm text-muted-foreground">Loading...</CardContent></Card>
      : filtered.length === 0 ? <EmptyState icon="Scale" title="No loans" description="Add your first loan to start tracking." action={<Button size="sm" onClick={() => openModal()}><Plus className="h-4 w-4 mr-1" /> Add Loan</Button>} />
      : (
        <Card className="finance-card-static overflow-hidden">
          <Table>
            <TableHeader><TableRow>
              <TableHead className="text-xs">Lender</TableHead><TableHead className="text-xs">Type</TableHead>
              <TableHead className="text-xs text-right">Principal</TableHead><TableHead className="text-xs text-right">Paid</TableHead>
              <TableHead className="text-xs">Progress</TableHead><TableHead className="text-xs">Due Date</TableHead>
              <TableHead className="text-xs">Status</TableHead><TableHead className="text-xs text-right">Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>{filtered.map(l => {
              const remaining = Number(l.principal_amount) - Number(l.paid_amount);
              const pct = Number(l.principal_amount) > 0 ? Math.round((Number(l.paid_amount) / Number(l.principal_amount)) * 100) : 0;
              return (<TableRow key={l.id}>
                <TableCell className="text-xs font-medium">{l.lender_name}</TableCell>
                <TableCell className="text-xs text-muted-foreground capitalize">{l.loan_type.replace(/_/g, " ")}</TableCell>
                <TableCell className="text-xs text-right font-semibold">{fmt(Number(l.principal_amount))}</TableCell>
                <TableCell className="text-xs text-right text-positive">{fmt(Number(l.paid_amount))}</TableCell>
                <TableCell><div className="flex items-center gap-2 min-w-[80px]"><Progress value={pct} className="h-1.5 flex-1" /><span className="text-[10px] text-muted-foreground">{pct}%</span></div></TableCell>
                <TableCell className="text-xs">{l.due_date ? format(parseISO(l.due_date), "dd MMM yyyy") : "—"}</TableCell>
                <TableCell><Badge variant="secondary" className={`text-[10px] capitalize ${statusColors[l.status] || ""}`}>{l.status.replace(/_/g, " ")}</Badge></TableCell>
                <TableCell className="text-right"><div className="flex items-center justify-end gap-1">
                  {l.status !== "paid_off" && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setRepayModal(l); setRepayAmt(""); setRepayAcct(l.linked_account_id || ""); }}><DollarSign className="h-3.5 w-3.5" /></Button>}
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openModal(l)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-negative" onClick={() => setDeleteId(l.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div></TableCell>
              </TableRow>);
            })}</TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={modal} onOpenChange={setModal}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>{editing ? "Edit Loan" : "Add Loan"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label className="text-xs">Lender Name *</Label><Input value={form.lender_name} onChange={e => setForm(f => ({ ...f, lender_name: e.target.value }))} className="mt-1" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Loan Type</Label><Select value={form.loan_type} onValueChange={v => setForm(f => ({ ...f, loan_type: v }))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{LOAN_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className="text-xs">Due Date</Label><Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} className="mt-1" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Principal Amount *</Label><Input type="number" value={form.principal_amount} onChange={e => setForm(f => ({ ...f, principal_amount: e.target.value }))} className="mt-1" /></div>
            <div><Label className="text-xs">Paid Amount</Label><Input type="number" value={form.paid_amount} onChange={e => setForm(f => ({ ...f, paid_amount: e.target.value }))} className="mt-1" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Installment Amount</Label><Input type="number" value={form.installment_amount} onChange={e => setForm(f => ({ ...f, installment_amount: e.target.value }))} className="mt-1" /></div>
            <div><Label className="text-xs">Interest Rate %</Label><Input type="number" value={form.interest_rate} onChange={e => setForm(f => ({ ...f, interest_rate: e.target.value }))} className="mt-1" /></div>
          </div>
          <div><Label className="text-xs">Linked Account</Label><Select value={form.linked_account_id} onValueChange={v => setForm(f => ({ ...f, linked_account_id: v }))}><SelectTrigger className="mt-1"><SelectValue placeholder="None" /></SelectTrigger><SelectContent>{accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent></Select></div>
          <div><Label className="text-xs">Note</Label><Textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} className="mt-1" rows={2} /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => setModal(false)}>Cancel</Button><Button onClick={handleSave} disabled={!form.lender_name || !form.principal_amount || createMut.isPending || updateMut.isPending}>{createMut.isPending || updateMut.isPending ? "Saving..." : "Save"}</Button></DialogFooter>
      </DialogContent></Dialog>

      <Dialog open={!!repayModal} onOpenChange={() => setRepayModal(null)}><DialogContent className="sm:max-w-sm"><DialogHeader><DialogTitle>Record Repayment</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Remaining: {repayModal && fmt(Number(repayModal.principal_amount) - Number(repayModal.paid_amount))}</p>
          <div><Label className="text-xs">Repayment Amount *</Label><Input type="number" value={repayAmt} onChange={e => setRepayAmt(e.target.value)} className="mt-1" /></div>
          <div><Label className="text-xs">Debit from Account</Label><Select value={repayAcct} onValueChange={setRepayAcct}><SelectTrigger className="mt-1"><SelectValue placeholder="None" /></SelectTrigger><SelectContent>{accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent></Select></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => setRepayModal(null)}>Cancel</Button><Button onClick={handleRepay} disabled={!repayAmt || repayMut.isPending}>{repayMut.isPending ? "Recording..." : "Record"}</Button></DialogFooter>
      </DialogContent></Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Loan?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => { if (deleteId) deleteMut.mutate(deleteId); setDeleteId(null); }}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
}
