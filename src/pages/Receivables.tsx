import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, HandCoins, AlertTriangle, CheckCircle2, Clock, Search, RotateCcw, Trash2, Pencil, BookOpen, MoreHorizontal, FileText, ArrowRightLeft, Upload } from "lucide-react";
import { ImportLedgerModal } from "@/components/shared/ImportLedgerModal";
import { PageHeader } from "@/components/shared/PageHeader";
import { FeatureIO } from "@/components/shared/FeatureIO";
import { FinanceCard } from "@/components/shared/FinanceCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PremiumLocked } from "@/components/shared/PremiumLocked";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { BulkActionBar } from "@/components/shared/BulkActionBar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useReceivableBooks, useCreateReceivableBook, useUpdateReceivableBook, useDeleteReceivableBook, ReceivableBookInsert } from "@/hooks/use-receivable-books";
import { MoveBookModal } from "@/components/shared/MoveBookModal";
import { useAllReceivableEntries } from "@/hooks/use-receivable-entries";
import { useAppContext } from "@/contexts/AppContext";
import { useTranslation } from "@/i18n/useTranslation";
import { formatAmount, formatAppDate } from "@/lib/formatters";
import { parseISO, isAfter, startOfMonth, endOfMonth } from "date-fns";

const statusColors: Record<string, string> = {
  active: "bg-primary/10 text-primary",
  closed: "bg-muted text-muted-foreground",
};

export default function Receivables() {
  const { currency, isPremium, settings } = useAppContext();
  const { t, lang } = useTranslation();
  const navigate = useNavigate();
  const { data: books = [], isLoading } = useReceivableBooks();
  const { data: allEntries = [] } = useAllReceivableEntries();
  const createMut = useCreateReceivableBook();
  const updateMut = useUpdateReceivableBook();
  const deleteMut = useDeleteReceivableBook();

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [moveBook, setMoveBook] = useState<{ id: string; name: string; entryCount: number } | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const [form, setForm] = useState({ person_name: "", description: "", phone: "", email: "", status: "active", opening_balance: "0" });

  const fmt = (n: number) => formatAmount(n, currency, lang);
  const fmtDate = (d: string) => formatAppDate(d, settings.dateFormat, settings.timezone, lang);

  const now = new Date();
  const mStart = startOfMonth(now);
  const mEnd = endOfMonth(now);

  // Compute per-book aggregates
  const bookAggregates = useMemo(() => {
    const map: Record<string, { entryCount: number; totalAmount: number; collectedAmount: number; hasOverdue: boolean }> = {};
    allEntries.forEach(e => {
      if (!map[e.book_id]) map[e.book_id] = { entryCount: 0, totalAmount: 0, collectedAmount: 0, hasOverdue: false };
      const agg = map[e.book_id];
      agg.entryCount++;
      agg.totalAmount += Number(e.amount);
      agg.collectedAmount += Number(e.collected_amount);
      if (e.status === "open" && e.due_date && isAfter(now, parseISO(e.due_date))) agg.hasOverdue = true;
    });
    return map;
  }, [allEntries]);

  const totalReceivable = Object.values(bookAggregates).reduce((s, a) => s + (a.totalAmount - a.collectedAmount), 0);
  const overdueAmt = allEntries.filter(e => (e.status === "open" && e.due_date && isAfter(now, parseISO(e.due_date))) || e.status === "overdue").reduce((s, e) => s + (Number(e.amount) - Number(e.collected_amount)), 0);
  const collectedThisMonth = allEntries.filter(e => e.status === "collected" && e.updated_at && parseISO(e.updated_at) >= mStart && parseISO(e.updated_at) <= mEnd).reduce((s, e) => s + Number(e.collected_amount), 0);
  const openBooksCount = books.filter(b => b.status === "active").length;

  const filtered = useMemo(() => books.filter(b => {
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (search && !b.person_name.toLowerCase().includes(search.toLowerCase()) && !(b.description || "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [books, statusFilter, search]);

  const openModal = (item?: any) => {
    if (item) {
      setEditing(item);
      setForm({ person_name: item.person_name, description: item.description || "", phone: item.phone || "", email: item.email || "", status: item.status, opening_balance: String(item.opening_balance) });
    } else {
      setEditing(null);
      setForm({ person_name: "", description: "", phone: "", email: "", status: "active", opening_balance: "0" });
    }
    setModal(true);
  };

  const handleSave = () => {
    const payload: ReceivableBookInsert = {
      person_name: form.person_name,
      description: form.description || null,
      phone: form.phone || null,
      email: form.email || null,
      status: form.status,
      opening_balance: Number(form.opening_balance || 0),
    };
    if (editing) {
      updateMut.mutate({ id: editing.id, ...payload }, { onSuccess: () => setModal(false) });
    } else {
      createMut.mutate(payload, { onSuccess: () => setModal(false) });
    }
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(r => r.id)));
  };
  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };
  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    try {
      for (const id of selected) { await (await import("@/integrations/supabase/client")).supabase.from("receivable_books" as any).delete().eq("id", id); }
      const { useQueryClient } = await import("@tanstack/react-query");
      // just invalidate via deleteMut pattern
      window.location.reload();
    } finally { setBulkDeleting(false); }
  };

  if (!isPremium) {
    return (
      <div className="space-y-6">
        <PageHeader title={t("receivables.title")} subtitle={t("receivables.subtitle")} />
        <PremiumLocked icon={<HandCoins className="h-7 w-7 text-feature-receivables" />} moduleName={t("receivables.title")} description={t("premium.upgradeDesc.receivables")} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("receivables.title")}
        subtitle="Track money expected from people or entities"
        actions={
          <div className="flex items-center gap-2">
            <FeatureIO feature="receivables" tables={[{ table: "receivable_books" }, { table: "receivable_entries" }, { table: "receivable_collection_history" }]} />
            <Button size="sm" variant="outline" className="gap-1.5 h-9 text-xs" onClick={() => setImportOpen(true)}>
              <Upload className="h-3.5 w-3.5" /> Import
            </Button>
            <Button size="sm" className="gap-1.5 shadow-sm" onClick={() => openModal()}><Plus className="h-4 w-4" /> Add Person</Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <FinanceCard icon={<HandCoins className="h-5 w-5 text-feature-receivables" />} iconBg="bg-feature-receivables/10" label={t("module.totalReceivable")} value={fmt(totalReceivable)} />
        <FinanceCard icon={<AlertTriangle className="h-5 w-5 text-negative" />} iconBg="bg-negative/10" label={t("module.overdue")} value={fmt(overdueAmt)} />
        <FinanceCard icon={<CheckCircle2 className="h-5 w-5 text-positive" />} iconBg="bg-positive/10" label={t("module.collectedThisMonth")} value={fmt(collectedThisMonth)} />
        <FinanceCard icon={<Clock className="h-5 w-5 text-feature-receivables" />} iconBg="bg-feature-receivables/10" label="Open Books" value={String(openBooksCount)} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search person..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("module.allStatus")}</SelectItem>
            <SelectItem value="active">{t("status.active")}</SelectItem>
            <SelectItem value="closed">{t("status.closed")}</SelectItem>
          </SelectContent>
        </Select>
        {(search || statusFilter !== "all") && <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={() => { setSearch(""); setStatusFilter("all"); }}><RotateCcw className="h-3 w-3" /> {t("action.reset")}</Button>}
      </div>

      <BulkActionBar selectedCount={selected.size} onDelete={() => setBulkDeleteOpen(true)} onClear={() => setSelected(new Set())} deleting={bulkDeleting} />

      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<HandCoins className="h-7 w-7 text-muted-foreground" />}
          title={t("module.noReceivables")}
          description="Add your first person to start tracking receivables."
          action={<Button size="sm" onClick={() => openModal()}><Plus className="h-4 w-4 mr-1" /> Add Person</Button>}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map(book => {
            const agg = bookAggregates[book.id] || { entryCount: 0, totalAmount: 0, collectedAmount: 0, hasOverdue: false };
            const remaining = agg.totalAmount - agg.collectedAmount + Number(book.opening_balance);
            return (
              <Card key={book.id} className="finance-card-static p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/receivables/${book.id}`)}>
                <div className="flex items-center gap-3">
                  <Checkbox checked={selected.has(book.id)} onCheckedChange={() => toggleOne(book.id)} onClick={e => e.stopPropagation()} />
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-feature-receivables/10">
                    <BookOpen className="h-5 w-5 text-feature-receivables" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold truncate">{book.person_name}</h3>
                      <Badge variant="secondary" className={`text-[10px] capitalize ${statusColors[book.status] || ""}`}>{book.status}</Badge>
                      {agg.hasOverdue && <Badge variant="secondary" className="text-[10px] bg-negative/10 text-negative">Overdue</Badge>}
                    </div>
                    {book.description && <p className="text-xs text-muted-foreground truncate mt-0.5">{book.description}</p>}
                    <p className="text-[11px] text-muted-foreground mt-1">{agg.entryCount} entries · Created {fmtDate(book.created_at)}</p>
                  </div>
                  <div className="text-right shrink-0 hidden sm:block">
                    <p className="text-xs text-muted-foreground">Total: {fmt(agg.totalAmount)}</p>
                    <p className="text-xs text-positive">Collected: {fmt(agg.collectedAmount)}</p>
                    <p className="text-sm font-bold mt-0.5">Remaining: {fmt(remaining > 0 ? remaining : 0)}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={e => { e.stopPropagation(); navigate(`/receivables/${book.id}`); }}><BookOpen className="h-3.5 w-3.5 mr-2" /> Open Ledger</DropdownMenuItem>
                      <DropdownMenuItem onClick={e => { e.stopPropagation(); openModal(book); }}><Pencil className="h-3.5 w-3.5 mr-2" /> Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={e => { e.stopPropagation(); navigate(`/receivables/${book.id}`); }}><FileText className="h-3.5 w-3.5 mr-2" /> Report</DropdownMenuItem>
                      <DropdownMenuItem onClick={e => { e.stopPropagation(); setMoveBook({ id: book.id, name: book.person_name, entryCount: agg.entryCount }); }}><ArrowRightLeft className="h-3.5 w-3.5 mr-2" /> Move to Payables</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={e => { e.stopPropagation(); setDeleteId(book.id); }}><Trash2 className="h-3.5 w-3.5 mr-2" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Book Modal */}
      <Dialog open={modal} onOpenChange={setModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Person" : "Add Person"}</DialogTitle>
            <DialogDescription>Create a receivable book for a person or entity.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div><Label className="text-xs">Person Name *</Label><Input value={form.person_name} onChange={e => setForm(f => ({ ...f, person_name: e.target.value }))} className="mt-1 h-9 text-sm" /></div>
            <div><Label className="text-xs">Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="mt-1 text-sm" rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="mt-1 h-9 text-sm" /></div>
              <div><Label className="text-xs">Email</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="mt-1 h-9 text-sm" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Opening Balance</Label><Input type="number" min="0" value={form.opening_balance} onChange={e => setForm(f => ({ ...f, opening_balance: e.target.value }))} className="mt-1 h-9 text-sm" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setModal(false)}>{t("action.cancel")}</Button>
            <Button size="sm" onClick={handleSave} disabled={!form.person_name || createMut.isPending || updateMut.isPending}>
              {createMut.isPending || updateMut.isPending ? t("common.saving") : t("action.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete this receivable book?"
        description="This will permanently delete this book and all its entries."
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
      {moveBook && (
        <MoveBookModal
          open={!!moveBook}
          onOpenChange={(open) => { if (!open) setMoveBook(null); }}
          bookId={moveBook.id}
          personName={moveBook.name}
          direction="receivable-to-payable"
          entryCount={moveBook.entryCount}
        />
      )}
      <ImportLedgerModal open={importOpen} onOpenChange={setImportOpen} type="receivable" />
    </div>
  );
}
