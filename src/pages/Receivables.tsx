import { useState, useMemo } from "react";
import { Plus, HandCoins, AlertTriangle, CheckCircle2, Clock, Search, RotateCcw, Trash2, Pencil, DollarSign } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { FinanceCard } from "@/components/shared/FinanceCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useReceivables, useCreateReceivable, useUpdateReceivable, useDeleteReceivable, useRecordCollection, ReceivableInsert } from "@/hooks/use-receivables";
import { useAccounts } from "@/hooks/use-accounts";
import { useAppContext } from "@/contexts/AppContext";
import { format, parseISO, isAfter, startOfMonth, endOfMonth } from "date-fns";

const statusColors: Record<string, string> = {
  open: "bg-primary/10 text-primary",
  partial: "bg-warning/10 text-warning",
  collected: "bg-positive/10 text-positive",
  overdue: "bg-negative/10 text-negative",
};

export default function Receivables() {
  const { currency, isPremium } = useAppContext();
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

  const fmt = (n: number) => `${currency.symbol}${n.toLocaleString()}`;

  const now = new Date();
  const mStart = startOfMonth(now);
  const mEnd = endOfMonth(now);

  // Auto-detect overdue
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
        <PageHeader title="Receivables" subtitle="Track money you are expected to receive" />
        <Card className="finance-card-static">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 mb-4"><HandCoins className="h-7 w-7 text-primary" /></div>
            <h3 className="text-base font-semibold">Premium Module</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">Upgrade to Premium to track receivables and collections.</p>
            <Button className="mt-4" onClick={() => window.location.href = "/subscription"}>Upgrade Now</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Receivables" subtitle="Track money you are expected to receive" actions={<Button size="sm" className="gap-1.5 shadow-sm" onClick={() => openModal()}><Plus className="h-4 w-4" /> Add Receivable</Button>} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <FinanceCard icon={<HandCoins className="h-5 w-5 text-primary" />} iconBg="bg-primary/10" label="Total Receivable" value={fmt(totalReceivable)} />
        <FinanceCard icon={<AlertTriangle className="h-5 w-5 text-negative" />} iconBg="bg-negative/10" label="Overdue" value={fmt(overdueAmt)} />
        <FinanceCard icon={<CheckCircle2 className="h-5 w-5 text-positive" />} iconBg="bg-positive/10" label="Collected This Month" value={fmt(collectedThisMonth)} />
        <FinanceCard icon={<Clock className="h-5 w-5 text-warning" />} iconBg="bg-warning/10" label="Open Count" value={String(openCount)} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="collected">Collected</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        {(search || statusFilter !== "all") && <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={() => { setSearch(""); setStatusFilter("all"); }}><RotateCcw className="h-3 w-3" /> Reset</Button>}
      </div>

      {isLoading ? (
        <Card className="finance-card-static"><CardContent className="py-12 text-center text-sm text-muted-foreground">Loading...</CardContent></Card>
      ) : filtered.length === 0 ? (
        <EmptyState icon="HandCoins" title="No receivables" description="Add your first receivable to start tracking." action={<Button size="sm" onClick={() => openModal()}><Plus className="h-4 w-4 mr-1" /> Add Receivable</Button>} />
      ) : (
        <Card className="finance-card-static overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Person</TableHead>
                <TableHead className="text-xs">Reason</TableHead>
                <TableHead className="text-xs text-right">Total</TableHead>
                <TableHead className="text-xs text-right">Received</TableHead>
                <TableHead className="text-xs text-right">Remaining</TableHead>
                <TableHead className="text-xs">Due Date</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(r => {
                const remaining = Number(r.total_amount) - Number(r.received_amount);
                return (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs font-medium">{r.person_name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.reason || "—"}</TableCell>
                    <TableCell className="text-xs text-right font-semibold">{fmt(Number(r.total_amount))}</TableCell>
                    <TableCell className="text-xs text-right text-positive">{fmt(Number(r.received_amount))}</TableCell>
                    <TableCell className="text-xs text-right">{fmt(remaining)}</TableCell>
                    <TableCell className="text-xs">{r.due_date ? format(parseISO(r.due_date), "dd MMM yyyy") : "—"}</TableCell>
                    <TableCell><Badge variant="secondary" className={`text-[10px] capitalize ${statusColors[r.status] || ""}`}>{r.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {r.status !== "collected" && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setCollectModal(r); setCollectAmt(""); setCollectAcct(r.linked_account_id || ""); }}><DollarSign className="h-3.5 w-3.5" /></Button>}
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
          <DialogHeader><DialogTitle>{editing ? "Edit Receivable" : "Add Receivable"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Person Name *</Label><Input value={form.person_name} onChange={e => setForm(f => ({ ...f, person_name: e.target.value }))} className="mt-1" /></div>
            <div><Label className="text-xs">Reason</Label><Input value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Total Amount *</Label><Input type="number" value={form.total_amount} onChange={e => setForm(f => ({ ...f, total_amount: e.target.value }))} className="mt-1" /></div>
              <div><Label className="text-xs">Received Amount</Label><Input type="number" value={form.received_amount} onChange={e => setForm(f => ({ ...f, received_amount: e.target.value }))} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Due Date</Label><Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} className="mt-1" /></div>
              <div>
                <Label className="text-xs">Linked Account</Label>
                <Select value={form.linked_account_id} onValueChange={v => setForm(f => ({ ...f, linked_account_id: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>{accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label className="text-xs">Note</Label><Textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} className="mt-1" rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.person_name || !form.total_amount || createMut.isPending || updateMut.isPending}>{createMut.isPending || updateMut.isPending ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Collection Modal */}
      <Dialog open={!!collectModal} onOpenChange={() => setCollectModal(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Record Collection</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Remaining: {collectModal && fmt(Number(collectModal.total_amount) - Number(collectModal.received_amount))}</p>
            <div><Label className="text-xs">Collection Amount *</Label><Input type="number" value={collectAmt} onChange={e => setCollectAmt(e.target.value)} className="mt-1" /></div>
            <div>
              <Label className="text-xs">Credit to Account</Label>
              <Select value={collectAcct} onValueChange={setCollectAcct}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>{accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCollectModal(null)}>Cancel</Button>
            <Button onClick={handleCollect} disabled={!collectAmt || collectMut.isPending}>{collectMut.isPending ? "Recording..." : "Record"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Receivable?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => { if (deleteId) deleteMut.mutate(deleteId); setDeleteId(null); }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
