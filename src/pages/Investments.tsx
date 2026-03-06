import { useState, useMemo } from "react";
import { Plus, TrendingUp, TrendingDown, Hash, Search, RotateCcw, Trash2, Pencil, DollarSign } from "lucide-react";
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
import { useInvestments, useCreateInvestment, useUpdateInvestment, useDeleteInvestment, InvestmentInsert } from "@/hooks/use-investments";
import { useAccounts } from "@/hooks/use-accounts";
import { useAppContext } from "@/contexts/AppContext";
import { format, parseISO } from "date-fns";

const INVESTMENT_TYPES = ["stocks", "mutual_funds", "dps_fdr", "crypto", "business_investment", "private_investment", "other"];
const statusColors: Record<string, string> = { active: "bg-positive/10 text-positive", closed: "bg-muted text-muted-foreground", on_hold: "bg-warning/10 text-warning" };

export default function Investments() {
  const { currency, isPremium } = useAppContext();
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
  const fmt = (n: number) => `${currency.symbol}${n.toLocaleString()}`;

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
        <PageHeader title="Investments" subtitle="Track allocated capital and growth over time" />
        <Card className="finance-card-static"><CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 mb-4"><TrendingUp className="h-7 w-7 text-primary" /></div>
          <h3 className="text-base font-semibold">Premium Module</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">Upgrade to Premium to track investments.</p>
          <Button className="mt-4" onClick={() => window.location.href = "/subscription"}>Upgrade Now</Button>
        </CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Investments" subtitle="Track allocated capital and growth over time" actions={<Button size="sm" className="gap-1.5 shadow-sm" onClick={() => openModal()}><Plus className="h-4 w-4" /> Add Investment</Button>} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <FinanceCard icon={<DollarSign className="h-5 w-5 text-primary" />} iconBg="bg-primary/10" label="Total Invested" value={fmt(totalInvested)} />
        <FinanceCard icon={<TrendingUp className="h-5 w-5 text-positive" />} iconBg="bg-positive/10" label="Current Value" value={fmt(totalCurrentValue)} />
        <FinanceCard icon={totalPL >= 0 ? <TrendingUp className="h-5 w-5 text-positive" /> : <TrendingDown className="h-5 w-5 text-negative" />} iconBg={totalPL >= 0 ? "bg-positive/10" : "bg-negative/10"} label="Profit / Loss" value={`${totalPL >= 0 ? "+" : ""}${fmt(totalPL)}`} />
        <FinanceCard icon={<Hash className="h-5 w-5 text-muted-foreground" />} iconBg="bg-muted" label="Active Count" value={String(activeCount)} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px] max-w-xs"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" /></div>
        <Select value={typeFilter} onValueChange={setTypeFilter}><SelectTrigger className="w-[150px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Types</SelectItem>{INVESTMENT_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}</SelectContent></Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="closed">Closed</SelectItem><SelectItem value="on_hold">On Hold</SelectItem></SelectContent></Select>
        {(search || typeFilter !== "all" || statusFilter !== "all") && <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={() => { setSearch(""); setTypeFilter("all"); setStatusFilter("all"); }}><RotateCcw className="h-3 w-3" /> Reset</Button>}
      </div>

      {isLoading ? <Card className="finance-card-static"><CardContent className="py-12 text-center text-sm text-muted-foreground">Loading...</CardContent></Card>
      : filtered.length === 0 ? <EmptyState icon="TrendingUp" title="No investments" description="Add your first investment to start tracking." action={<Button size="sm" onClick={() => openModal()}><Plus className="h-4 w-4 mr-1" /> Add Investment</Button>} />
      : (
        <Card className="finance-card-static overflow-hidden">
          <Table>
            <TableHeader><TableRow>
              <TableHead className="text-xs">Name</TableHead><TableHead className="text-xs">Type</TableHead>
              <TableHead className="text-xs text-right">Invested</TableHead><TableHead className="text-xs text-right">Current</TableHead>
              <TableHead className="text-xs text-right">P/L</TableHead><TableHead className="text-xs text-right">ROI</TableHead>
              <TableHead className="text-xs">Start Date</TableHead><TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs text-right">Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>{filtered.map(inv => {
              const pl = Number(inv.current_value) - Number(inv.invested_amount);
              const roi = Number(inv.invested_amount) > 0 ? ((pl / Number(inv.invested_amount)) * 100).toFixed(1) : "0";
              return (<TableRow key={inv.id}>
                <TableCell className="text-xs font-medium">{inv.investment_name}</TableCell>
                <TableCell className="text-xs text-muted-foreground capitalize">{inv.investment_type.replace(/_/g, " ")}</TableCell>
                <TableCell className="text-xs text-right">{fmt(Number(inv.invested_amount))}</TableCell>
                <TableCell className="text-xs text-right font-semibold">{fmt(Number(inv.current_value))}</TableCell>
                <TableCell className={`text-xs text-right font-semibold ${pl >= 0 ? "text-positive" : "text-negative"}`}>{pl >= 0 ? "+" : ""}{fmt(pl)}</TableCell>
                <TableCell className={`text-xs text-right ${Number(roi) >= 0 ? "text-positive" : "text-negative"}`}>{roi}%</TableCell>
                <TableCell className="text-xs">{inv.start_date ? format(parseISO(inv.start_date), "dd MMM yyyy") : "—"}</TableCell>
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

      <Dialog open={modal} onOpenChange={setModal}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>{editing ? "Edit Investment" : "Add Investment"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label className="text-xs">Investment Name *</Label><Input value={form.investment_name} onChange={e => setForm(f => ({ ...f, investment_name: e.target.value }))} className="mt-1" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Type</Label><Select value={form.investment_type} onValueChange={v => setForm(f => ({ ...f, investment_type: v }))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{INVESTMENT_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className="text-xs">Status</Label><Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="closed">Closed</SelectItem><SelectItem value="on_hold">On Hold</SelectItem></SelectContent></Select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Invested Amount *</Label><Input type="number" value={form.invested_amount} onChange={e => setForm(f => ({ ...f, invested_amount: e.target.value }))} className="mt-1" /></div>
            <div><Label className="text-xs">Current Value</Label><Input type="number" value={form.current_value} onChange={e => setForm(f => ({ ...f, current_value: e.target.value }))} className="mt-1" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Start Date</Label><Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className="mt-1" /></div>
            <div><Label className="text-xs">Linked Account</Label><Select value={form.linked_account_id} onValueChange={v => setForm(f => ({ ...f, linked_account_id: v }))}><SelectTrigger className="mt-1"><SelectValue placeholder="None" /></SelectTrigger><SelectContent>{accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div><Label className="text-xs">Note</Label><Textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} className="mt-1" rows={2} /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => setModal(false)}>Cancel</Button><Button onClick={handleSave} disabled={!form.investment_name || !form.invested_amount || createMut.isPending || updateMut.isPending}>{createMut.isPending || updateMut.isPending ? "Saving..." : "Save"}</Button></DialogFooter>
      </DialogContent></Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Investment?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => { if (deleteId) deleteMut.mutate(deleteId); setDeleteId(null); }}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
}
