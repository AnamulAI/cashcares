import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Users, DollarSign, TrendingDown, PiggyBank, Search, RotateCcw, Trash2, Pencil, BookOpen, MoreHorizontal, FileText, Percent, ArrowDownCircle, Landmark } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { FinanceCard } from "@/components/shared/FinanceCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { BulkActionBar } from "@/components/shared/BulkActionBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { usePartnerships, useCreatePartnership, useUpdatePartnership, useDeletePartnership, PartnershipInsert } from "@/hooks/use-partnerships";
import { useAppContext } from "@/contexts/AppContext";
import { useTranslation } from "@/i18n/useTranslation";
import { formatAmount, formatAppDate } from "@/lib/formatters";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  active: "bg-positive/10 text-positive",
  settled: "bg-primary/10 text-primary",
  paused: "bg-warning/10 text-warning",
  closed: "bg-muted text-muted-foreground",
};

export default function Partnerships() {
  const { currency, isPremium, settings } = useAppContext();
  const { t, lang } = useTranslation();
  const navigate = useNavigate();
  const { data: items = [], isLoading } = usePartnerships();
  const createMut = useCreatePartnership();
  const updateMut = useUpdatePartnership();
  const deleteMut = useDeletePartnership();
  const qc = useQueryClient();

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const [form, setForm] = useState({
    partnership_name: "", partner_1_name: "", partner_2_name: "",
    partner_1_share: "50", partner_2_share: "50",
    start_date: "", note: "", status: "active"
  });

  const fmt = (n: number) => formatAmount(n, currency, lang);
  const fmtDate = (d: string) => formatAppDate(d, settings.dateFormat, settings.timezone, lang);

  const shareError = useMemo(() => {
    const s1 = Number(form.partner_1_share || 0);
    const s2 = Number(form.partner_2_share || 0);
    if (s1 + s2 !== 100) return `Share total is ${s1 + s2}% — must be 100%`;
    return null;
  }, [form.partner_1_share, form.partner_2_share]);

  const filtered = useMemo(() => {
    let list = items.filter(p => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!p.partnership_name.toLowerCase().includes(q) && !(p.partner_1_name || "").toLowerCase().includes(q) && !(p.partner_2_name || "").toLowerCase().includes(q)) return false;
      }
      return true;
    });
    if (sortBy === "capital") list = [...list].sort((a, b) => Number(b.total_capital) - Number(a.total_capital));
    else if (sortBy === "active") list = list.filter(p => p.status === "active");
    return list;
  }, [items, statusFilter, search, sortBy]);

  const totalPartnerships = items.length;
  const totalCapital = items.reduce((s, p) => s + Number(p.total_capital), 0);
  const totalP1 = items.reduce((s, p) => s + Number(p.your_contribution), 0);
  const totalP2 = items.reduce((s, p) => s + Number(p.partner_contribution), 0);
  const totalWithdrawn = items.reduce((s, p) => s + Number(p.total_withdrawn), 0);
  const totalProfitDist = items.reduce((s, p) => s + Number(p.total_profit_distributed), 0);

  const openModal = (item?: any) => {
    if (item) {
      setEditing(item);
      setForm({
        partnership_name: item.partnership_name,
        partner_1_name: item.partner_1_name || "",
        partner_2_name: item.partner_2_name || item.partner_name || "",
        partner_1_share: String(item.partner_1_share || 50),
        partner_2_share: String(item.partner_2_share || 50),
        start_date: item.start_date || "", note: item.note || "", status: item.status
      });
    } else {
      setEditing(null);
      setForm({ partnership_name: "", partner_1_name: "", partner_2_name: "", partner_1_share: "50", partner_2_share: "50", start_date: "", note: "", status: "active" });
    }
    setModal(true);
  };

  const handleSave = () => {
    if (shareError) { toast.error(shareError); return; }
    const payload: PartnershipInsert = {
      partnership_name: form.partnership_name,
      partner_name: form.partner_2_name, // backward compat
      partner_1_name: form.partner_1_name,
      partner_2_name: form.partner_2_name,
      partner_1_share: Number(form.partner_1_share),
      partner_2_share: Number(form.partner_2_share),
      start_date: form.start_date || null,
      note: form.note || null,
      status: form.status,
    };
    if (editing) updateMut.mutate({ id: editing.id, ...payload }, { onSuccess: () => setModal(false) });
    else createMut.mutate(payload, { onSuccess: () => setModal(false) });
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
      for (const id of selected) {
        await (supabase as any).from("partnership_entries").delete().eq("partnership_id", id);
        await (supabase as any).from("partnerships").delete().eq("id", id);
      }
      qc.invalidateQueries({ queryKey: ["partnerships"] });
      toast.success(`${selected.size} partnerships deleted`);
      setSelected(new Set());
      setBulkDeleteOpen(false);
    } finally { setBulkDeleting(false); }
  };

  if (!isPremium) {
    return (
      <div className="space-y-6">
        <PageHeader title="Partnerships" subtitle="Manage shared business capital, withdrawals, profit distribution, and reinvestment" />
        <Card className="finance-card-static">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-feature-partnerships/10 mb-4"><Users className="h-7 w-7 text-feature-partnerships" /></div>
            <h3 className="text-base font-semibold">Premium Module</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">Upgrade to Premium to track partnerships and shared finances.</p>
            <Button className="mt-4" onClick={() => navigate("/subscription")}>{t("action.upgrade")}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Partnerships"
        subtitle="Manage shared business capital, withdrawals, profit distribution, and reinvestment"
        actions={<Button size="sm" className="gap-1.5 shadow-sm" onClick={() => openModal()}><Plus className="h-4 w-4" /> Add Partnership</Button>}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <FinanceCard icon={<Users className="h-5 w-5 text-feature-partnerships" />} iconBg="bg-feature-partnerships/10" label="Total Partnerships" value={String(totalPartnerships)} />
        <FinanceCard icon={<Landmark className="h-5 w-5 text-primary" />} iconBg="bg-primary/10" label="Total Capital" value={fmt(totalCapital)} />
        <FinanceCard icon={<DollarSign className="h-5 w-5 text-feature-income" />} iconBg="bg-feature-income/10" label="Your Contribution" value={fmt(totalP1)} />
        <FinanceCard icon={<DollarSign className="h-5 w-5 text-feature-partnerships" />} iconBg="bg-feature-partnerships/10" label="Partner Contribution" value={fmt(totalP2)} />
        <FinanceCard icon={<TrendingDown className="h-5 w-5 text-negative" />} iconBg="bg-negative/10" label="Total Withdrawn" value={fmt(totalWithdrawn)} />
        <FinanceCard icon={<PiggyBank className="h-5 w-5 text-warning" />} iconBg="bg-warning/10" label="Profit Distributed" value={fmt(totalProfitDist)} />
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
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Latest</SelectItem>
            <SelectItem value="capital">Highest Capital</SelectItem>
            <SelectItem value="active">Active Only</SelectItem>
          </SelectContent>
        </Select>
        {(search || statusFilter !== "all") && <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={() => { setSearch(""); setStatusFilter("all"); setSortBy("latest"); }}><RotateCcw className="h-3 w-3" /> Reset</Button>}
      </div>

      <BulkActionBar selectedCount={selected.size} onDelete={() => setBulkDeleteOpen(true)} onClear={() => setSelected(new Set())} deleting={bulkDeleting} />

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="h-7 w-7 text-muted-foreground" />}
          title="No partnerships"
          description="Add your first partnership business to start tracking shared capital."
          action={<Button size="sm" onClick={() => openModal()}><Plus className="h-4 w-4 mr-1" /> Add Partnership</Button>}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map(p => {
            const p1 = p.partner_1_name || "Partner 1";
            const p2 = p.partner_2_name || p.partner_name || "Partner 2";
            const netPosition = Number(p.total_capital);
            return (
              <Card key={p.id} className="finance-card-static p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/partnerships/${p.id}`)}>
                <div className="flex items-center gap-3">
                  <Checkbox checked={selected.has(p.id)} onCheckedChange={() => toggleOne(p.id)} onClick={e => e.stopPropagation()} />
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-feature-partnerships/10">
                    <Users className="h-5 w-5 text-feature-partnerships" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold truncate">{p.partnership_name}</h3>
                      <Badge variant="secondary" className={`text-[10px] capitalize ${statusColors[p.status] || ""}`}>{p.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{p1} ({p.partner_1_share}%) · {p2} ({p.partner_2_share}%)</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Created {fmtDate(p.created_at)}</p>
                  </div>
                  <div className="text-right shrink-0 hidden sm:block">
                    <p className="text-xs text-muted-foreground">Capital: {fmt(netPosition)}</p>
                    <p className="text-xs text-muted-foreground">Withdrawn: {fmt(Number(p.total_withdrawn))}</p>
                    <p className="text-sm font-bold mt-0.5">Net: {fmt(netPosition)}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={e => { e.stopPropagation(); navigate(`/partnerships/${p.id}`); }}><BookOpen className="h-3.5 w-3.5 mr-2" /> Open Book</DropdownMenuItem>
                      <DropdownMenuItem onClick={e => { e.stopPropagation(); openModal(p); }}><Pencil className="h-3.5 w-3.5 mr-2" /> Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={e => { e.stopPropagation(); navigate(`/partnerships/${p.id}`); }}><FileText className="h-3.5 w-3.5 mr-2" /> Report</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={e => { e.stopPropagation(); setDeleteId(p.id); }}><Trash2 className="h-3.5 w-3.5 mr-2" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Partnership Modal */}
      <Dialog open={modal} onOpenChange={setModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Partnership" : "Add Partnership"}</DialogTitle>
            <DialogDescription>Define a partnership business with 2 partners and custom share ratio.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div>
              <Label className="text-xs">Partnership Business Name *</Label>
              <Input value={form.partnership_name} onChange={e => setForm(f => ({ ...f, partnership_name: e.target.value }))} className="mt-1 h-9 text-sm" placeholder="e.g. ARP Online" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Your Name (Partner 1) *</Label>
                <Input value={form.partner_1_name} onChange={e => setForm(f => ({ ...f, partner_1_name: e.target.value }))} className="mt-1 h-9 text-sm" />
              </div>
              <div>
                <Label className="text-xs">Partner Name (Partner 2) *</Label>
                <Input value={form.partner_2_name} onChange={e => setForm(f => ({ ...f, partner_2_name: e.target.value }))} className="mt-1 h-9 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs flex items-center gap-1"><Percent className="h-3 w-3" /> Your Share % *</Label>
                <Input type="number" min="0" max="100" value={form.partner_1_share} onChange={e => {
                  const v = e.target.value;
                  setForm(f => ({ ...f, partner_1_share: v, partner_2_share: String(100 - Number(v)) }));
                }} className="mt-1 h-9 text-sm" />
              </div>
              <div>
                <Label className="text-xs flex items-center gap-1"><Percent className="h-3 w-3" /> Partner Share % *</Label>
                <Input type="number" min="0" max="100" value={form.partner_2_share} onChange={e => {
                  const v = e.target.value;
                  setForm(f => ({ ...f, partner_2_share: v, partner_1_share: String(100 - Number(v)) }));
                }} className="mt-1 h-9 text-sm" />
              </div>
            </div>
            {shareError && <p className="text-xs text-destructive">{shareError}</p>}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Start Date</Label>
                <Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className="mt-1 h-9 text-sm" />
              </div>
              <div>
                <Label className="text-xs">Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="settled">Settled</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">Description / Note</Label>
              <Textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} className="mt-1 text-sm" rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setModal(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSave} disabled={!form.partnership_name || !form.partner_1_name || !form.partner_2_name || !!shareError || createMut.isPending || updateMut.isPending}>
              {createMut.isPending || updateMut.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete this partnership?"
        description="This will permanently delete this partnership business and all its entries."
        onConfirm={() => { if (deleteId) deleteMut.mutate(deleteId); setDeleteId(null); }}
      />
      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title="Delete selected partnerships?"
        description={`This will permanently delete ${selected.size} partnership(s) and their entries.`}
        onConfirm={handleBulkDelete}
        loading={bulkDeleting}
        confirmLabel={`Delete ${selected.size}`}
      />
    </div>
  );
}
