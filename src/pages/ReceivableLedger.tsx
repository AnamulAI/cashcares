import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, DollarSign, Printer, Download, Pencil, Trash2, Copy, MoreHorizontal, HandCoins, CheckCircle2, AlertTriangle, Clock, Eye } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { FinanceCard } from "@/components/shared/FinanceCard";
import { PrintStatementHeader, PrintStatementFooter } from "@/components/shared/PrintStatementHeader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useReceivableBook } from "@/hooks/use-receivable-books";
import { useReceivableEntries, useCreateReceivableEntry, useUpdateReceivableEntry, useDeleteReceivableEntry, useRecordEntryCollection, ReceivableEntryInsert } from "@/hooks/use-receivable-entries";
import { useAccounts } from "@/hooks/use-accounts";
import { useAppContext } from "@/contexts/AppContext";
import { useTranslation } from "@/i18n/useTranslation";
import { formatAmount, formatAppDate } from "@/lib/formatters";
import { parseISO, isAfter, format } from "date-fns";
import { ReceivableEntryDetailModal } from "@/components/ledger/ReceivableEntryDetailModal";
import { CategoryCombobox } from "@/components/ledger/CategoryCombobox";
import { EntryAttachments } from "@/components/ledger/EntryAttachments";
import { useAttachmentCounts } from "@/hooks/use-attachment-counts";
import { AttachmentBadge } from "@/components/shared/AttachmentBadge";
import { usePendingEntryIds } from "@/hooks/use-pending-sync";
import { PendingSyncIndicator, pendingRowTint } from "@/components/shared/PendingSyncIndicator";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  open: "bg-primary/10 text-primary",
  partial: "bg-warning/10 text-warning",
  collected: "bg-positive/10 text-positive",
  overdue: "bg-negative/10 text-negative",
};

export default function ReceivableLedger() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currency, settings } = useAppContext();
  const { t, lang } = useTranslation();
  const { data: book, isLoading: bookLoading } = useReceivableBook(id);
  const { data: entries = [], isLoading: entriesLoading } = useReceivableEntries(id);
  const { data: accounts = [] } = useAccounts();
  const createMut = useCreateReceivableEntry();
  const updateMut = useUpdateReceivableEntry();
  const deleteMut = useDeleteReceivableEntry();
  const collectMut = useRecordEntryCollection();

  const [entryModal, setEntryModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [collectModal, setCollectModal] = useState<any>(null);
  const [collectAmt, setCollectAmt] = useState("");
  const [collectAcct, setCollectAcct] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [detailEntry, setDetailEntry] = useState<any>(null);

  const [form, setForm] = useState({ date: format(new Date(), "yyyy-MM-dd"), description: "", category: "", linked_account_id: "", amount: "", collected_amount: "0", due_date: "", note: "", status: "open" });

  const fmt = (n: number) => formatAmount(n, currency, lang);
  const fmtDate = (d: string) => formatAppDate(d, settings.dateFormat, settings.timezone, lang);
  const now = new Date();

  const processed = useMemo(() => entries.map(e => {
    if (e.status === "open" && e.due_date && isAfter(now, parseISO(e.due_date))) return { ...e, status: "overdue" };
    return e;
  }), [entries]);

  const filtered = useMemo(() => processed.filter(e => {
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    return true;
  }), [processed, statusFilter]);

  const { data: attachmentCounts = {} } = useAttachmentCounts(filtered.map(e => e.id), "receivable");
  const pendingIds = usePendingEntryIds();

  const totalAmount = processed.reduce((s, e) => s + Number(e.amount), 0);
  const totalCollected = processed.reduce((s, e) => s + Number(e.collected_amount), 0);
  const remaining = totalAmount - totalCollected + Number(book?.opening_balance || 0);
  const overdueCount = processed.filter(e => e.status === "overdue").length;

  const openEntryModal = (item?: any) => {
    if (item) {
      setEditing(item);
      setForm({ date: item.date, description: item.description || "", category: item.category || "", linked_account_id: item.linked_account_id || "", amount: String(item.amount), collected_amount: String(item.collected_amount), due_date: item.due_date || "", note: item.note || "", status: item.status });
    } else {
      setEditing(null);
      setForm({ date: format(new Date(), "yyyy-MM-dd"), description: "", category: "", linked_account_id: "", amount: "", collected_amount: "0", due_date: "", note: "", status: "open" });
    }
    setEntryModal(true);
  };

  const handleSaveEntry = () => {
    if (!id) return;
    const payload: ReceivableEntryInsert = {
      book_id: id,
      date: form.date,
      description: form.description || null,
      category: form.category || null,
      linked_account_id: form.linked_account_id || null,
      amount: Number(form.amount),
      collected_amount: Number(form.collected_amount || 0),
      due_date: form.due_date || null,
      note: form.note || null,
      status: form.status,
    };
    if (editing) {
      updateMut.mutate({ id: editing.id, ...payload }, { onSuccess: () => setEntryModal(false) });
    } else {
      createMut.mutate(payload, { onSuccess: () => setEntryModal(false) });
    }
  };

  const handleCollect = () => {
    if (!collectAmt) return;
    const targetEntry = collectModal?.bookLevel
      ? processed.find(e => e.status !== "collected")
      : collectModal;
    if (!targetEntry?.id) return;
    collectMut.mutate({ id: targetEntry.id, amount: Number(collectAmt), linkedAccountId: collectAcct || targetEntry.linked_account_id }, {
      onSuccess: () => { setCollectModal(null); setCollectAmt(""); setCollectAcct(""); }
    });
  };

  const handleDuplicate = (entry: any) => {
    if (!id) return;
    createMut.mutate({
      book_id: id,
      date: format(new Date(), "yyyy-MM-dd"),
      description: entry.description,
      category: entry.category,
      linked_account_id: entry.linked_account_id,
      amount: Number(entry.amount),
      collected_amount: 0,
      due_date: null,
      note: entry.note,
      status: "open",
    });
  };

  const handlePrint = () => window.print();

  const handleCSV = () => {
    const headers = ["Date", "Description", "Category", "Account", "Amount", "Collected", "Balance", "Status"];
    const rows = processed.map(e => [
      e.date, e.description || "", e.category || "", e.linked_account?.name || "", e.amount, e.collected_amount, Number(e.amount) - Number(e.collected_amount), e.status
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `receivable-${book?.person_name || "ledger"}-${format(new Date(), "yyyy-MM-dd")}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const handlePDF = () => window.print(); // Browser print-to-PDF

  if (bookLoading) return <div className="space-y-4 p-6"><Skeleton className="h-8 w-64" /><Skeleton className="h-20" /></div>;

  if (!book) return <div className="p-6"><p className="text-muted-foreground">Book not found.</p><Button variant="link" onClick={() => navigate("/receivables")}>← Back</Button></div>;

  return (
    <div className="space-y-6">
      <PrintStatementHeader
        documentTitle="Receivable Ledger Statement"
        subjectId={book.id}
        subjectIdLabel="Book ID"
        detailsTitle="Receivable Details"
        scheduleTitle="Receivable Entries"
        details={[
          { label: "Person", value: book.person_name },
          { label: "Status", value: book.status || "active" },
          ...(book.phone ? [{ label: "Phone", value: book.phone }] : []),
          ...(book.email ? [{ label: "Email", value: book.email }] : []),
          { label: "Opening Bal.", value: fmt(Number(book.opening_balance || 0)) },
          { label: "Total Entries", value: String(processed.length) },
          ...(book.description ? [{ label: "Description", value: book.description, fullWidth: true }] : []),
        ]}
        summary={[
          { label: "Total Receivable", value: fmt(totalAmount) },
          { label: "Total Collected", value: fmt(totalCollected) },
          { label: "Remaining", value: fmt(remaining > 0 ? remaining : 0) },
          { label: "Overdue", value: String(overdueCount) },
        ]}
      />


      <div className="flex items-center gap-2 no-print">
        <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate("/receivables")}><ArrowLeft className="h-4 w-4" /> Back</Button>
      </div>

      <div className="no-print">
        <PageHeader
          title={book.person_name}
          subtitle={book.description || "Receivable ledger"}
          actions={
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="gap-1" onClick={() => { const entry = processed.find(e => e.status !== "collected"); if (entry) { setCollectModal({ ...entry, bookLevel: true }); setCollectAmt(""); setCollectAcct(entry.linked_account_id || ""); } }}><DollarSign className="h-4 w-4" /> Record Collection</Button>
              <Button size="sm" className="gap-1" onClick={() => openEntryModal()}><Plus className="h-4 w-4" /> Add Entry</Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button size="sm" variant="outline"><Download className="h-4 w-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handlePrint}><Printer className="h-3.5 w-3.5 mr-2" /> Print</DropdownMenuItem>
                  <DropdownMenuItem onClick={handlePDF}><Download className="h-3.5 w-3.5 mr-2" /> PDF (Print)</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCSV}><Download className="h-3.5 w-3.5 mr-2" /> CSV</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 no-print">
        <FinanceCard icon={<HandCoins className="h-5 w-5 text-feature-receivables" />} iconBg="bg-feature-receivables/10" label={t("module.totalReceivable")} value={fmt(totalAmount)} />
        <FinanceCard icon={<CheckCircle2 className="h-5 w-5 text-positive" />} iconBg="bg-positive/10" label="Total Collected" value={fmt(totalCollected)} />
        <FinanceCard icon={<AlertTriangle className="h-5 w-5 text-negative" />} iconBg="bg-negative/10" label="Remaining" value={fmt(remaining > 0 ? remaining : 0)} />
        <FinanceCard icon={<Clock className="h-5 w-5 text-warning" />} iconBg="bg-warning/10" label="Overdue Entries" value={String(overdueCount)} />
      </div>

      <div className="flex flex-wrap items-center gap-2 no-print">
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
      </div>

      {entriesLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <Card className="finance-card-static p-8 text-center">
          <p className="text-muted-foreground text-sm">No entries yet.</p>
          <Button size="sm" className="mt-3" onClick={() => openEntryModal()}><Plus className="h-4 w-4 mr-1" /> Add Entry</Button>
        </Card>
      ) : (
        <Card className="finance-card-static overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">{t("table.date")}</TableHead>
                <TableHead className="text-xs">Description</TableHead>
                <TableHead className="text-xs">Category</TableHead>
                <TableHead className="text-xs">Account</TableHead>
                <TableHead className="text-xs text-right">{t("table.amount")}</TableHead>
                <TableHead className="text-xs text-right">{t("table.collected")}</TableHead>
                <TableHead className="text-xs text-right">Balance</TableHead>
                <TableHead className="text-xs">{t("table.status")}</TableHead>
                <TableHead className="text-xs text-right no-print">{t("table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(e => {
                const balance = Number(e.amount) - Number(e.collected_amount);
                return (
                  <TableRow key={e.id}>
                    <TableCell className="text-xs">{fmtDate(e.date)}</TableCell>
                    <TableCell className="text-xs">
                      <span className="inline-flex items-center gap-1.5">
                        {e.description || "—"}
                        <AttachmentBadge count={attachmentCounts[e.id] || 0} />
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{e.category || "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{e.linked_account?.name || "—"}</TableCell>
                    <TableCell className="text-xs text-right font-semibold">{fmt(Number(e.amount))}</TableCell>
                    <TableCell className="text-xs text-right text-positive">{fmt(Number(e.collected_amount))}</TableCell>
                    <TableCell className="text-xs text-right">{fmt(balance)}</TableCell>
                    <TableCell><Badge variant="secondary" className={`text-[10px] capitalize ${statusColors[e.status] || ""}`}>{e.status}</Badge></TableCell>
                    <TableCell className="text-right no-print">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-3.5 w-3.5" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {e.status !== "collected" && <DropdownMenuItem onClick={() => { setCollectModal(e); setCollectAmt(""); setCollectAcct(e.linked_account_id || ""); }}><DollarSign className="h-3.5 w-3.5 mr-2" /> Record Collection</DropdownMenuItem>}
                          <DropdownMenuItem onClick={() => setDetailEntry(e)}><Eye className="h-3.5 w-3.5 mr-2" /> View Details</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(e)}><Copy className="h-3.5 w-3.5 mr-2" /> Duplicate</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEntryModal(e)}><Pencil className="h-3.5 w-3.5 mr-2" /> Edit</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(e.id)}><Trash2 className="h-3.5 w-3.5 mr-2" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Add/Edit Entry Modal */}
      <Dialog open={entryModal} onOpenChange={setEntryModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Entry" : "Add Entry"}</DialogTitle>
            <DialogDescription>Add a receivable entry for {book.person_name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">{t("table.date")} *</Label><Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="mt-1 h-9 text-sm" /></div>
              <div><Label className="text-xs">Due Date</Label><Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} className="mt-1 h-9 text-sm" /></div>
            </div>
            <div><Label className="text-xs">Description</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="mt-1 h-9 text-sm" /></div>
            <div className="grid grid-cols-2 gap-3">
              <CategoryCombobox value={form.category} onChange={v => setForm(f => ({ ...f, category: v }))} entries={entries} group="receivable" />
              <div>
                <Label className="text-xs">Account</Label>
                <Select value={form.linked_account_id} onValueChange={v => setForm(f => ({ ...f, linked_account_id: v }))}>
                  <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>{accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name} — {fmt(Number(a.balance))}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">{t("table.amount")} *</Label><Input type="number" min="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="mt-1 h-9 text-sm" /></div>
              <div><Label className="text-xs">Collected</Label><Input type="number" min="0" value={form.collected_amount} onChange={e => setForm(f => ({ ...f, collected_amount: e.target.value }))} className="mt-1 h-9 text-sm" /></div>
            </div>
            <div><Label className="text-xs">{t("table.note")}</Label><Textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} className="mt-1 text-sm" rows={2} /></div>
            {editing && <EntryAttachments entryId={editing.id} entryType="receivable" />}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEntryModal(false)}>{t("action.cancel")}</Button>
            <Button size="sm" onClick={handleSaveEntry} disabled={!form.amount || !form.date || createMut.isPending || updateMut.isPending}>
              {createMut.isPending || updateMut.isPending ? t("common.saving") : t("action.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Collection Modal */}
      <Dialog open={!!collectModal} onOpenChange={() => setCollectModal(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("module.recordCollection")}</DialogTitle>
            <DialogDescription>Record a collection for {book.person_name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            {collectModal && collectModal.amount != null && (
              <p className="text-xs text-muted-foreground">{t("module.remaining")}: {fmt(Number(collectModal.amount) - Number(collectModal.collected_amount))}</p>
            )}
            <div><Label className="text-xs">{t("module.collectionAmount")} *</Label><Input type="number" min="0" value={collectAmt} onChange={e => setCollectAmt(e.target.value)} className="mt-1 h-9 text-sm" /></div>
            <div>
              <Label className="text-xs">{t("module.creditToAccount")}</Label>
              <Select value={collectAcct} onValueChange={setCollectAcct}>
                <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>{accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name} — {fmt(Number(a.balance))}</SelectItem>)}</SelectContent>
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
        title="Delete this entry?"
        description={t("confirm.deleteDesc")}
        onConfirm={() => { if (deleteId) deleteMut.mutate(deleteId); setDeleteId(null); }}
      />

      <ReceivableEntryDetailModal
        entry={detailEntry}
        open={!!detailEntry}
        onOpenChange={(open) => { if (!open) setDetailEntry(null); }}
        formatAmount={fmt}
        formatDate={fmtDate}
      />

      <PrintStatementFooter />
    </div>
  );
}
