import { useState, useMemo } from "react";
import { Plus, Users, DollarSign, Scale, ArrowRightLeft, Search, RotateCcw, Trash2, Pencil, HandCoins, Receipt, Banknote } from "lucide-react";
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
import { usePartnerships, useCreatePartnership, useUpdatePartnership, useDeletePartnership, useCreatePartnershipEntry, PartnershipInsert } from "@/hooks/use-partnerships";
import { useAppContext } from "@/contexts/AppContext";
import { useTranslation } from "@/i18n/useTranslation";
import { formatAmount } from "@/lib/formatters";

const statusColors: Record<string, string> = {
  active: "bg-positive/10 text-positive",
  settled: "bg-primary/10 text-primary",
  paused: "bg-warning/10 text-warning",
  closed: "bg-muted text-muted-foreground",
};

export default function Partnerships() {
  const { currency, isPremium } = useAppContext();
  const { t, lang } = useTranslation();
  const { data: items = [], isLoading } = usePartnerships();
  const createMut = useCreatePartnership();
  const updateMut = useUpdatePartnership();
  const deleteMut = useDeletePartnership();
  const entryMut = useCreatePartnershipEntry();

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Entry modals
  const [entryModal, setEntryModal] = useState<{ type: "contribution" | "shared_expense" | "settlement"; partnership: any } | null>(null);
  const [entryForm, setEntryForm] = useState({ contributor: "you", description: "", amount: "", date: new Date().toISOString().slice(0, 10), note: "" });

  const [form, setForm] = useState({
    partnership_name: "", partner_name: "", your_contribution: "0", partner_contribution: "0",
    shared_expense_total: "0", settlement_amount: "0", start_date: "", note: "", status: "active"
  });

  const fmt = (n: number) => formatAmount(n, currency, lang);

  const filtered = useMemo(() => items.filter(p => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (search && !p.partnership_name.toLowerCase().includes(search.toLowerCase()) && !p.partner_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [items, statusFilter, search]);

  const totalPartnerships = items.length;
  const totalYourContribution = items.reduce((s, p) => s + Number(p.your_contribution), 0);
  const totalPartnerContribution = items.reduce((s, p) => s + Number(p.partner_contribution), 0);
  const outstandingSettlement = items.reduce((s, p) => {
    const net = Number(p.your_contribution) - Number(p.partner_contribution) - Number(p.shared_expense_total) / 2 + Number(p.settlement_amount);
    return s + Math.abs(net);
  }, 0);

  const openModal = (item?: any) => {
    if (item) {
      setEditing(item);
      setForm({
        partnership_name: item.partnership_name, partner_name: item.partner_name,
        your_contribution: String(item.your_contribution), partner_contribution: String(item.partner_contribution),
        shared_expense_total: String(item.shared_expense_total), settlement_amount: String(item.settlement_amount),
        start_date: item.start_date || "", note: item.note || "", status: item.status
      });
    } else {
      setEditing(null);
      setForm({ partnership_name: "", partner_name: "", your_contribution: "0", partner_contribution: "0", shared_expense_total: "0", settlement_amount: "0", start_date: "", note: "", status: "active" });
    }
    setModal(true);
  };

  const handleSave = () => {
    const payload: PartnershipInsert = {
      partnership_name: form.partnership_name,
      partner_name: form.partner_name,
      your_contribution: Number(form.your_contribution),
      partner_contribution: Number(form.partner_contribution),
      shared_expense_total: Number(form.shared_expense_total),
      settlement_amount: Number(form.settlement_amount),
      start_date: form.start_date || null,
      note: form.note || null,
      status: form.status,
    };
    if (editing) {
      updateMut.mutate({ id: editing.id, ...payload }, { onSuccess: () => setModal(false) });
    } else {
      createMut.mutate(payload, { onSuccess: () => setModal(false) });
    }
  };

  const handleEntrySubmit = () => {
    if (!entryModal || !entryForm.amount) return;
    const p = entryModal.partnership;
    const amount = Number(entryForm.amount);
    let field: "your_contribution" | "partner_contribution" | "shared_expense_total" | "settlement_amount";
    if (entryModal.type === "contribution") {
      field = entryForm.contributor === "you" ? "your_contribution" : "partner_contribution";
    } else if (entryModal.type === "shared_expense") {
      field = "shared_expense_total";
    } else {
      field = "settlement_amount";
    }
    entryMut.mutate({
      partnershipId: p.id,
      entry: {
        partnership_id: p.id,
        entry_type: entryModal.type,
        contributor: entryForm.contributor,
        description: entryForm.description || null,
        amount,
        date: entryForm.date,
        note: entryForm.note || null,
      },
      field,
      amount,
    }, {
      onSuccess: () => {
        setEntryModal(null);
        setEntryForm({ contributor: "you", description: "", amount: "", date: new Date().toISOString().slice(0, 10), note: "" });
      }
    });
  };

  if (!isPremium) {
    return (
      <div className="space-y-6">
        <PageHeader title={t("partnerships.title", "Partnership Ledger")} subtitle={t("partnerships.subtitle", "Track shared contributions, expenses, and settlement balances")} />
        <Card className="finance-card-static">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 mb-4"><Users className="h-7 w-7 text-primary" /></div>
            <h3 className="text-base font-semibold">Premium Module</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">Upgrade to Premium to track partnerships and shared finances.</p>
            <Button className="mt-4" onClick={() => window.location.href = "/subscription"}>{t("action.upgrade")}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("partnerships.title", "Partnership Ledger")}
        subtitle={t("partnerships.subtitle", "Track shared contributions, expenses, and settlement balances")}
        actions={<Button size="sm" className="gap-1.5 shadow-sm" onClick={() => openModal()}><Plus className="h-4 w-4" /> {t("action.addPartnership", "Add Partnership")}</Button>}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <FinanceCard icon={<Users className="h-5 w-5 text-primary" />} iconBg="bg-primary/10" label="Total Partnerships" value={String(totalPartnerships)} />
        <FinanceCard icon={<DollarSign className="h-5 w-5 text-positive" />} iconBg="bg-positive/10" label="Your Contribution" value={fmt(totalYourContribution)} />
        <FinanceCard icon={<HandCoins className="h-5 w-5 text-accent-foreground" />} iconBg="bg-accent" label="Partner Contribution" value={fmt(totalPartnerContribution)} />
        <FinanceCard icon={<Scale className="h-5 w-5 text-warning" />} iconBg="bg-warning/10" label="Outstanding Settlement" value={fmt(outstandingSettlement)} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search partnerships..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="settled">Settled</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        {(search || statusFilter !== "all") && <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={() => { setSearch(""); setStatusFilter("all"); }}><RotateCcw className="h-3 w-3" /> {t("action.reset")}</Button>}
      </div>

      {isLoading ? (
        <Card className="finance-card-static"><CardContent className="py-12 text-center text-sm text-muted-foreground">{t("common.loading")}</CardContent></Card>
      ) : filtered.length === 0 ? (
        <EmptyState icon="Users" title="No partnerships" description="Add your first partnership to start tracking shared finances." action={<Button size="sm" onClick={() => openModal()}><Plus className="h-4 w-4 mr-1" /> Add Partnership</Button>} />
      ) : (
        <Card className="finance-card-static overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Partnership</TableHead>
                <TableHead className="text-xs">Partner</TableHead>
                <TableHead className="text-xs text-right">Your Contrib.</TableHead>
                <TableHead className="text-xs text-right">Partner Contrib.</TableHead>
                <TableHead className="text-xs text-right">Shared Exp.</TableHead>
                <TableHead className="text-xs text-right">Net Balance</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(p => {
                const net = Number(p.your_contribution) - Number(p.partner_contribution);
                return (
                  <TableRow key={p.id}>
                    <TableCell className="text-xs font-medium">{p.partnership_name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.partner_name}</TableCell>
                    <TableCell className="text-xs text-right">{fmt(Number(p.your_contribution))}</TableCell>
                    <TableCell className="text-xs text-right">{fmt(Number(p.partner_contribution))}</TableCell>
                    <TableCell className="text-xs text-right">{fmt(Number(p.shared_expense_total))}</TableCell>
                    <TableCell className={`text-xs text-right font-semibold ${net >= 0 ? "text-positive" : "text-negative"}`}>{net >= 0 ? "+" : ""}{fmt(net)}</TableCell>
                    <TableCell><Badge variant="secondary" className={`text-[10px] capitalize ${statusColors[p.status] || ""}`}>{p.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Record Contribution" onClick={() => { setEntryModal({ type: "contribution", partnership: p }); setEntryForm({ contributor: "you", description: "", amount: "", date: new Date().toISOString().slice(0, 10), note: "" }); }}><Banknote className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Record Shared Expense" onClick={() => { setEntryModal({ type: "shared_expense", partnership: p }); setEntryForm({ contributor: "you", description: "", amount: "", date: new Date().toISOString().slice(0, 10), note: "" }); }}><Receipt className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Record Settlement" onClick={() => { setEntryModal({ type: "settlement", partnership: p }); setEntryForm({ contributor: "you", description: "", amount: "", date: new Date().toISOString().slice(0, 10), note: "" }); }}><ArrowRightLeft className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openModal(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-negative" onClick={() => setDeleteId(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
          <DialogHeader><DialogTitle>{editing ? "Edit Partnership" : "Add Partnership"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Partnership Name *</Label><Input value={form.partnership_name} onChange={e => setForm(f => ({ ...f, partnership_name: e.target.value }))} className="mt-1" /></div>
              <div><Label className="text-xs">Partner Name *</Label><Input value={form.partner_name} onChange={e => setForm(f => ({ ...f, partner_name: e.target.value }))} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Start Date</Label><Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className="mt-1" /></div>
              <div>
                <Label className="text-xs">Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="settled">Settled</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label className="text-xs">Note</Label><Textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} className="mt-1" rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(false)}>{t("action.cancel")}</Button>
            <Button onClick={handleSave} disabled={!form.partnership_name || !form.partner_name || createMut.isPending || updateMut.isPending}>{createMut.isPending || updateMut.isPending ? t("common.saving") : t("action.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Entry Modal (Contribution / Shared Expense / Settlement) */}
      <Dialog open={!!entryModal} onOpenChange={() => setEntryModal(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {entryModal?.type === "contribution" ? "Record Contribution" : entryModal?.type === "shared_expense" ? "Record Shared Expense" : "Record Settlement"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {entryModal?.type === "contribution" && (
              <div>
                <Label className="text-xs">Contributor</Label>
                <Select value={entryForm.contributor} onValueChange={v => setEntryForm(f => ({ ...f, contributor: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="you">You</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {entryModal?.type === "shared_expense" && (
              <div><Label className="text-xs">Description</Label><Input value={entryForm.description} onChange={e => setEntryForm(f => ({ ...f, description: e.target.value }))} className="mt-1" /></div>
            )}
            <div><Label className="text-xs">Amount *</Label><Input type="number" value={entryForm.amount} onChange={e => setEntryForm(f => ({ ...f, amount: e.target.value }))} className="mt-1" /></div>
            <div><Label className="text-xs">Date</Label><Input type="date" value={entryForm.date} onChange={e => setEntryForm(f => ({ ...f, date: e.target.value }))} className="mt-1" /></div>
            <div><Label className="text-xs">Note</Label><Input value={entryForm.note} onChange={e => setEntryForm(f => ({ ...f, note: e.target.value }))} className="mt-1" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEntryModal(null)}>{t("action.cancel")}</Button>
            <Button onClick={handleEntrySubmit} disabled={!entryForm.amount || entryMut.isPending}>{entryMut.isPending ? "Recording..." : "Record"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Partnership?</AlertDialogTitle><AlertDialogDescription>This will remove the partnership and all its ledger entries. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("action.cancel")}</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => { if (deleteId) deleteMut.mutate(deleteId); setDeleteId(null); }}>{t("action.delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
