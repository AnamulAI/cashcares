import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Printer, Download, Pencil, Trash2, Copy, MoreHorizontal, Users, DollarSign, TrendingDown, PiggyBank, RotateCcw, Eye, Landmark, Briefcase } from "lucide-react";
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
import { EntryAttachments } from "@/components/ledger/EntryAttachments";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { usePartnership, usePartnershipEntries, useCreatePartnershipEntry, useUpdatePartnershipEntry, useDeletePartnershipEntry, DbPartnershipEntry } from "@/hooks/use-partnerships";
import { useAppContext } from "@/contexts/AppContext";
import { useTranslation } from "@/i18n/useTranslation";
import { formatAmount, formatAppDate } from "@/lib/formatters";
import { format } from "date-fns";
import { usePendingEntryIds } from "@/hooks/use-pending-sync";
import { PendingSyncIndicator, pendingRowTint } from "@/components/shared/PendingSyncIndicator";
import { cn } from "@/lib/utils";

const ENTRY_TYPES = [
  { value: "initial_invest", label: "Initial Invest", color: "bg-primary/10 text-primary" },
  { value: "new_invest", label: "New Invest", color: "bg-feature-income/10 text-feature-income" },
  { value: "withdraw", label: "Withdraw", color: "bg-negative/10 text-negative" },
  { value: "profit_distribution", label: "Profit Distribution", color: "bg-warning/10 text-warning" },
  { value: "reinvest", label: "Reinvest", color: "bg-positive/10 text-positive" },
  { value: "working_contribution", label: "Working Contribution", color: "bg-feature-partnerships/10 text-feature-partnerships" },
];

const entryTypeLabel = (t: string) => ENTRY_TYPES.find(e => e.value === t)?.label || t;
const entryTypeColor = (t: string) => ENTRY_TYPES.find(e => e.value === t)?.color || "";

const ROLE_LABELS: Record<string, string> = {
  capital_partner: "Capital Partner",
  working_partner: "Working Partner",
  mixed_partner: "Mixed Partner",
};
const NATURE_LABELS: Record<string, string> = {
  cash: "Cash",
  skill_work: "Skill/Work",
  mixed: "Mixed",
};

function getDirection(entryType: string): string {
  if (entryType === "initial_invest" || entryType === "new_invest" || entryType === "reinvest") return "IN";
  if (entryType === "withdraw" || entryType === "profit_distribution") return "OUT";
  if (entryType === "working_contribution") return "WORK";
  return "—";
}

export default function PartnershipLedger() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currency, settings } = useAppContext();
  const { t, lang } = useTranslation();
  const { data: partnership, isLoading: partnershipLoading } = usePartnership(id);
  const { data: entries = [], isLoading: entriesLoading } = usePartnershipEntries(id);
  const createMut = useCreatePartnershipEntry();
  const updateMut = useUpdatePartnershipEntry();
  const deleteMut = useDeletePartnershipEntry();

  const [entryModal, setEntryModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DbPartnershipEntry | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const [partnerFilter, setPartnerFilter] = useState("all");
  const [detailEntry, setDetailEntry] = useState<DbPartnershipEntry | null>(null);

  const [form, setForm] = useState({
    entry_type: "initial_invest", contributor: "", date: format(new Date(), "yyyy-MM-dd"),
    amount: "", estimated_value: "", description: "", note: ""
  });

  const isWorkingContribution = form.entry_type === "working_contribution";

  const fmt = (n: number) => formatAmount(n, currency, lang);
  const fmtDate = (d: string) => formatAppDate(d, settings.dateFormat, settings.timezone, lang);

  const p1Name = partnership?.partner_1_name || "Partner 1";
  const p2Name = partnership?.partner_2_name || partnership?.partner_name || "Partner 2";

  const filtered = useMemo(() => entries.filter(e => {
    if (typeFilter !== "all" && e.entry_type !== typeFilter) return false;
    if (partnerFilter !== "all" && e.contributor !== partnerFilter) return false;
    return true;
  }), [entries, typeFilter, partnerFilter]);

  // Partner-wise breakdown
  const breakdown = useMemo(() => {
    const p1 = { initialInvest: 0, newInvest: 0, withdraw: 0, profitReceived: 0, reinvest: 0, workingContribCount: 0, workingContribValue: 0 };
    const p2 = { initialInvest: 0, newInvest: 0, withdraw: 0, profitReceived: 0, reinvest: 0, workingContribCount: 0, workingContribValue: 0 };
    entries.forEach(e => {
      const isP1 = e.contributor === p1Name;
      const target = isP1 ? p1 : p2;
      const amt = Number(e.amount);
      if (e.entry_type === "initial_invest") target.initialInvest += amt;
      else if (e.entry_type === "new_invest") target.newInvest += amt;
      else if (e.entry_type === "withdraw") target.withdraw += amt;
      else if (e.entry_type === "profit_distribution") target.profitReceived += amt;
      else if (e.entry_type === "reinvest") target.reinvest += amt;
      else if (e.entry_type === "working_contribution") {
        target.workingContribCount += 1;
        target.workingContribValue += Number(e.estimated_value || 0);
      }
    });
    const p1Net = p1.initialInvest + p1.newInvest + p1.reinvest - p1.withdraw - p1.profitReceived;
    const p2Net = p2.initialInvest + p2.newInvest + p2.reinvest - p2.withdraw - p2.profitReceived;
    return { p1, p2, p1Net, p2Net };
  }, [entries, p1Name]);

  const openEntryModal = (entry?: DbPartnershipEntry) => {
    if (entry) {
      setEditingEntry(entry);
      setForm({
        entry_type: entry.entry_type, contributor: entry.contributor || p1Name, date: entry.date,
        amount: String(entry.amount), estimated_value: entry.estimated_value ? String(entry.estimated_value) : "",
        description: entry.description || "", note: entry.note || ""
      });
    } else {
      setEditingEntry(null);
      setForm({
        entry_type: "initial_invest", contributor: p1Name, date: format(new Date(), "yyyy-MM-dd"),
        amount: "", estimated_value: "", description: "", note: ""
      });
    }
    setEntryModal(true);
  };

  const handleSaveEntry = () => {
    if (!id) return;
    // For working contribution, amount is not required (estimated_value is optional)
    if (!isWorkingContribution && !form.amount) return;

    const payload: any = {
      entry_type: form.entry_type,
      contributor: form.contributor,
      date: form.date,
      amount: isWorkingContribution ? 0 : Number(form.amount),
      estimated_value: form.estimated_value ? Number(form.estimated_value) : null,
      description: form.description || null,
      note: form.note || null,
      linked_account_id: null,
    };
    if (editingEntry) {
      updateMut.mutate({
        entryId: editingEntry.id,
        partnershipId: id,
        updates: payload,
      }, { onSuccess: () => { setEntryModal(false); setEditingEntry(null); } });
    } else {
      createMut.mutate({
        partnershipId: id,
        entry: { ...payload, partnership_id: id },
      }, { onSuccess: () => setEntryModal(false) });
    }
  };

  const handleDuplicate = (entry: DbPartnershipEntry) => {
    if (!id) return;
    createMut.mutate({
      partnershipId: id,
      entry: {
        partnership_id: id,
        entry_type: entry.entry_type,
        contributor: entry.contributor,
        date: format(new Date(), "yyyy-MM-dd"),
        amount: Number(entry.amount),
        estimated_value: entry.estimated_value,
        description: entry.description,
        note: entry.note,
        linked_account_id: null,
      },
    });
  };

  const handlePrint = () => window.print();
  const handleCSV = () => {
    const headers = ["Date", "Entry Type", "Partner", "Description", "Amount", "Estimated Value", "Direction"];
    const rows = entries.map(e => [
      e.date, entryTypeLabel(e.entry_type), e.contributor || "", e.description || "",
      e.entry_type === "working_contribution" ? "" : e.amount,
      e.estimated_value || "", getDirection(e.entry_type)
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `partnership-${partnership?.partnership_name || "ledger"}-${format(new Date(), "yyyy-MM-dd")}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  if (partnershipLoading) return <div className="space-y-4 p-6"><Skeleton className="h-8 w-64" /><Skeleton className="h-20" /></div>;
  if (!partnership) return <div className="p-6"><p className="text-muted-foreground">Partnership not found.</p><Button variant="link" onClick={() => navigate("/partnerships")}>← Back</Button></div>;

  const totalCapital = Number(partnership.total_capital);
  const p1Contrib = Number(partnership.your_contribution);
  const p2Contrib = Number(partnership.partner_contribution);
  const totalWithdrawn = Number(partnership.total_withdrawn);
  const profitDist = Number(partnership.total_profit_distributed);
  const reinvested = Number(partnership.total_reinvested);

  return (
    <div className="space-y-6">
      <PrintStatementHeader
        documentTitle="Partnership Ledger Statement"
        subjectId={partnership.id}
        subjectIdLabel="Partnership ID"
        periodStart={partnership.start_date || undefined}
        detailsTitle="Partnership Details"
        scheduleTitle="Ledger Entries"
        details={[
          { label: "Business", value: partnership.partnership_name },
          { label: "Status", value: partnership.status },
          { label: p1Name, value: `${partnership.partner_1_share}% · ${ROLE_LABELS[partnership.partner_1_role] || partnership.partner_1_role} · ${NATURE_LABELS[partnership.partner_1_contribution_nature] || partnership.partner_1_contribution_nature}` },
          { label: p2Name, value: `${partnership.partner_2_share}% · ${ROLE_LABELS[partnership.partner_2_role] || partnership.partner_2_role} · ${NATURE_LABELS[partnership.partner_2_contribution_nature] || partnership.partner_2_contribution_nature}` },
          ...(partnership.start_date ? [{ label: "Started", value: fmtDate(partnership.start_date) }] : []),
          { label: "Total Entries", value: String(entries.length) },
          ...(partnership.note ? [{ label: "Note", value: partnership.note, fullWidth: true }] : []),
        ]}
        summary={[
          { label: "Total Capital", value: fmt(totalCapital) },
          { label: `${p1Name} Contrib.`, value: fmt(p1Contrib) },
          { label: `${p2Name} Contrib.`, value: fmt(p2Contrib) },
          { label: "Withdrawn", value: fmt(totalWithdrawn) },
          { label: "Profit Dist.", value: fmt(profitDist) },
          { label: "Reinvested", value: fmt(reinvested) },
        ]}
      />


      <div className="flex items-center gap-2 no-print">
        <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate("/partnerships")}><ArrowLeft className="h-4 w-4" /> Back</Button>
      </div>

      <div className="no-print">
        <PageHeader
          title={partnership.partnership_name}
          subtitle={`${p1Name} (${ROLE_LABELS[partnership.partner_1_role] || partnership.partner_1_role}, ${partnership.partner_1_share}%) · ${p2Name} (${ROLE_LABELS[partnership.partner_2_role] || partnership.partner_2_role}, ${partnership.partner_2_share}%)${partnership.note ? " — " + partnership.note : ""}`}
          actions={
            <div className="flex items-center gap-2">
              <Button size="sm" className="gap-1" onClick={() => openEntryModal()}><Plus className="h-4 w-4" /> Add Entry</Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button size="sm" variant="outline"><Download className="h-4 w-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handlePrint}><Printer className="h-3.5 w-3.5 mr-2" /> Print</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.print()}><Download className="h-3.5 w-3.5 mr-2" /> PDF (Print)</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCSV}><Download className="h-3.5 w-3.5 mr-2" /> CSV</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          }
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 no-print">
        <FinanceCard icon={<Landmark className="h-5 w-5 text-primary" />} iconBg="bg-primary/10" label="Total Capital" value={fmt(totalCapital)} />
        <FinanceCard icon={<DollarSign className="h-5 w-5 text-feature-income" />} iconBg="bg-feature-income/10" label={`${p1Name}'s Contrib.`} value={fmt(p1Contrib)} />
        <FinanceCard icon={<DollarSign className="h-5 w-5 text-feature-partnerships" />} iconBg="bg-feature-partnerships/10" label={`${p2Name}'s Contrib.`} value={fmt(p2Contrib)} />
        <FinanceCard icon={<TrendingDown className="h-5 w-5 text-negative" />} iconBg="bg-negative/10" label="Total Withdrawn" value={fmt(totalWithdrawn)} />
        <FinanceCard icon={<PiggyBank className="h-5 w-5 text-warning" />} iconBg="bg-warning/10" label="Profit Distributed" value={fmt(profitDist)} />
        <FinanceCard icon={<RotateCcw className="h-5 w-5 text-positive" />} iconBg="bg-positive/10" label="Reinvested" value={fmt(reinvested)} />
      </div>

      {/* Partner Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 no-print">
        {[
          { name: p1Name, data: breakdown.p1, net: breakdown.p1Net, share: partnership.partner_1_share, role: partnership.partner_1_role, nature: partnership.partner_1_contribution_nature },
          { name: p2Name, data: breakdown.p2, net: breakdown.p2Net, share: partnership.partner_2_share, role: partnership.partner_2_role, nature: partnership.partner_2_contribution_nature }
        ].map(partner => (
          <Card key={partner.name} className="finance-card-static p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-feature-partnerships/10">
                <Users className="h-4 w-4 text-feature-partnerships" />
              </div>
              <div>
                <h4 className="text-sm font-semibold">{partner.name}</h4>
                <p className="text-[11px] text-muted-foreground">
                  {partner.share}% · {ROLE_LABELS[partner.role] || partner.role} · {NATURE_LABELS[partner.nature] || partner.nature}
                </p>
              </div>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Initial Invest</span><span>{fmt(partner.data.initialInvest)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">New Invest</span><span>{fmt(partner.data.newInvest)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Withdraw</span><span className="text-negative">{fmt(partner.data.withdraw)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Profit Received</span><span className="text-warning">{fmt(partner.data.profitReceived)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Reinvest</span><span className="text-positive">{fmt(partner.data.reinvest)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Working Contribution</span>
                <span className="text-feature-partnerships">
                  {partner.data.workingContribCount > 0
                    ? partner.data.workingContribValue > 0
                      ? `${partner.data.workingContribCount} entries · ${fmt(partner.data.workingContribValue)}`
                      : `${partner.data.workingContribCount} entries`
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between border-t pt-1.5 font-semibold"><span>Net Position</span><span className={partner.net >= 0 ? "text-positive" : "text-negative"}>{fmt(partner.net)}</span></div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 no-print">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {ENTRY_TYPES.map(et => <SelectItem key={et.value} value={et.value}>{et.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={partnerFilter} onValueChange={setPartnerFilter}>
          <SelectTrigger className="w-[150px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Partners</SelectItem>
            <SelectItem value={p1Name}>{p1Name}</SelectItem>
            <SelectItem value={p2Name}>{p2Name}</SelectItem>
          </SelectContent>
        </Select>
        {(typeFilter !== "all" || partnerFilter !== "all") && (
          <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={() => { setTypeFilter("all"); setPartnerFilter("all"); }}>
            <RotateCcw className="h-3 w-3" /> Reset
          </Button>
        )}
      </div>

      {/* Ledger Table */}
      {entriesLoading ? (
        <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
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
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs">Entry Type</TableHead>
                <TableHead className="text-xs">Partner</TableHead>
                <TableHead className="text-xs">Description</TableHead>
                <TableHead className="text-xs text-right">Amount</TableHead>
                <TableHead className="text-xs">Direction</TableHead>
                <TableHead className="text-xs text-right no-print">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(e => {
                const dir = getDirection(e.entry_type);
                const isWork = e.entry_type === "working_contribution";
                return (
                  <TableRow key={e.id}>
                    <TableCell className="text-xs">{fmtDate(e.date)}</TableCell>
                    <TableCell><Badge variant="secondary" className={`text-[10px] ${entryTypeColor(e.entry_type)}`}>{entryTypeLabel(e.entry_type)}</Badge></TableCell>
                    <TableCell className="text-xs">{e.contributor || "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{e.description || "—"}</TableCell>
                    <TableCell className="text-xs text-right font-semibold">
                      {isWork
                        ? (e.estimated_value ? <span className="text-muted-foreground">~{fmt(Number(e.estimated_value))}</span> : <span className="text-muted-foreground">—</span>)
                        : fmt(Number(e.amount))
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`text-[10px] ${dir === "IN" ? "bg-positive/10 text-positive" : dir === "OUT" ? "bg-negative/10 text-negative" : dir === "WORK" ? "bg-feature-partnerships/10 text-feature-partnerships" : ""}`}>
                        {dir}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right no-print">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-3.5 w-3.5" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setDetailEntry(e)}><Eye className="h-3.5 w-3.5 mr-2" /> View</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEntryModal(e)}><Pencil className="h-3.5 w-3.5 mr-2" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(e)}><Copy className="h-3.5 w-3.5 mr-2" /> Duplicate</DropdownMenuItem>
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
      <Dialog open={entryModal} onOpenChange={(open) => { setEntryModal(open); if (!open) setEditingEntry(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingEntry ? "Edit Entry" : "Add Entry"}</DialogTitle>
            <DialogDescription>{editingEntry ? "Update this entry" : `Record a transaction for ${partnership.partnership_name}`}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Entry Type *</Label>
                <Select value={form.entry_type} onValueChange={v => setForm(f => ({ ...f, entry_type: v }))}>
                  <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ENTRY_TYPES.map(et => <SelectItem key={et.value} value={et.value}>{et.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Partner *</Label>
                <Select value={form.contributor} onValueChange={v => setForm(f => ({ ...f, contributor: v }))}>
                  <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={p1Name}>{p1Name}</SelectItem>
                    <SelectItem value={p2Name}>{p2Name}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">Date *</Label>
              <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="mt-1 h-9 text-sm" />
            </div>
            {!isWorkingContribution && (
              <div>
                <Label className="text-xs">Amount *</Label>
                <Input type="number" min="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="mt-1 h-9 text-sm" />
              </div>
            )}
            {isWorkingContribution && (
              <div>
                <Label className="text-xs">Estimated Value (Optional)</Label>
                <Input type="number" min="0" value={form.estimated_value} onChange={e => setForm(f => ({ ...f, estimated_value: e.target.value }))} className="mt-1 h-9 text-sm" placeholder="Leave empty if no monetary value" />
              </div>
            )}
            <div>
              <Label className="text-xs">Description</Label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="mt-1 h-9 text-sm" placeholder={isWorkingContribution ? "e.g. Website design, Facebook ads setup" : ""} />
            </div>
            <div>
              <Label className="text-xs">Note</Label>
              <Textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} className="mt-1 text-sm" rows={2} />
            </div>
            {editingEntry && <EntryAttachments entryId={editingEntry.id} entryType="partnership_entry" />}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { setEntryModal(false); setEditingEntry(null); }}>Cancel</Button>
            <Button size="sm" onClick={handleSaveEntry} disabled={
              (!isWorkingContribution && !form.amount) || !form.contributor || !form.date || createMut.isPending || updateMut.isPending
            }>
              {(createMut.isPending || updateMut.isPending) ? "Saving..." : editingEntry ? "Update Entry" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Detail Modal */}
      <Dialog open={!!detailEntry} onOpenChange={() => setDetailEntry(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Entry Details</DialogTitle></DialogHeader>
          {detailEntry && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span>{fmtDate(detailEntry.date)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Type</span><Badge variant="secondary" className={`text-[10px] ${entryTypeColor(detailEntry.entry_type)}`}>{entryTypeLabel(detailEntry.entry_type)}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Partner</span><span>{detailEntry.contributor || "—"}</span></div>
              {detailEntry.entry_type !== "working_contribution" && (
                <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-semibold">{fmt(Number(detailEntry.amount))}</span></div>
              )}
              {detailEntry.entry_type === "working_contribution" && detailEntry.estimated_value && (
                <div className="flex justify-between"><span className="text-muted-foreground">Estimated Value</span><span className="font-semibold">~{fmt(Number(detailEntry.estimated_value))}</span></div>
              )}
              <div className="flex justify-between"><span className="text-muted-foreground">Direction</span><span>{getDirection(detailEntry.entry_type)}</span></div>
              {detailEntry.description && <div className="flex justify-between"><span className="text-muted-foreground">Description</span><span>{detailEntry.description}</span></div>}
              {detailEntry.note && <div className="flex justify-between"><span className="text-muted-foreground">Note</span><span>{detailEntry.note}</span></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete this entry?"
        description="This will permanently delete this entry and recalculate totals."
        onConfirm={() => { if (deleteId && id) { deleteMut.mutate({ entryId: deleteId, partnershipId: id }); setDeleteId(null); } }}
      />

      <PrintStatementFooter />
    </div>
  );
}
