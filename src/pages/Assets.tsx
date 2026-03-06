import { useState, useMemo } from "react";
import { Plus, Building2, TrendingUp, TrendingDown, Hash, Search, RotateCcw, Trash2, Pencil } from "lucide-react";
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
import { useAssets, useCreateAsset, useUpdateAsset, useDeleteAsset, AssetInsert } from "@/hooks/use-assets";
import { useAccounts } from "@/hooks/use-accounts";
import { useAppContext } from "@/contexts/AppContext";
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

const ASSET_TYPES = ["cash_reserve", "property", "land", "vehicle", "equipment", "business_asset", "digital_asset", "other"];
const statusColors: Record<string, string> = { active: "bg-positive/10 text-positive", sold: "bg-warning/10 text-warning", archived: "bg-muted text-muted-foreground" };

export default function Assets() {
  const { currency, isPremium } = useAppContext();
  const { data: items = [], isLoading } = useAssets();
  const { data: accounts = [] } = useAccounts();
  const createMut = useCreateAsset();
  const updateMut = useUpdateAsset();
  const deleteMut = useDeleteAsset();

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [form, setForm] = useState({ asset_name: "", asset_type: "other", purchase_value: "", current_value: "", acquisition_date: "", linked_account_id: "", note: "", status: "active" });
  const fmt = (n: number) => `${currency.symbol}${n.toLocaleString()}`;
  const now = new Date();
  const mStart = startOfMonth(now);
  const mEnd = endOfMonth(now);

  const filtered = useMemo(() => items.filter(a => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (typeFilter !== "all" && a.asset_type !== typeFilter) return false;
    if (search && !a.asset_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [items, statusFilter, typeFilter, search]);

  const activeItems = items.filter(a => a.status === "active");
  const totalValue = activeItems.reduce((s, a) => s + Number(a.current_value), 0);
  const highestValue = activeItems.length ? Math.max(...activeItems.map(a => Number(a.current_value))) : 0;
  const updatedThisMonth = items.filter(a => a.updated_at && isWithinInterval(parseISO(a.updated_at), { start: mStart, end: mEnd })).length;

  const openModal = (item?: any) => {
    if (item) {
      setEditing(item);
      setForm({ asset_name: item.asset_name, asset_type: item.asset_type, purchase_value: String(item.purchase_value), current_value: String(item.current_value), acquisition_date: item.acquisition_date || "", linked_account_id: item.linked_account_id || "", note: item.note || "", status: item.status });
    } else {
      setEditing(null);
      setForm({ asset_name: "", asset_type: "other", purchase_value: "", current_value: "", acquisition_date: "", linked_account_id: "", note: "", status: "active" });
    }
    setModal(true);
  };

  const handleSave = () => {
    const payload: AssetInsert = { asset_name: form.asset_name, asset_type: form.asset_type, purchase_value: Number(form.purchase_value), current_value: Number(form.current_value || form.purchase_value), acquisition_date: form.acquisition_date || null, linked_account_id: form.linked_account_id || null, note: form.note || null, status: form.status };
    if (editing) updateMut.mutate({ id: editing.id, ...payload }, { onSuccess: () => setModal(false) });
    else createMut.mutate(payload, { onSuccess: () => setModal(false) });
  };

  if (!isPremium) {
    return (
      <div className="space-y-6">
        <PageHeader title="Assets" subtitle="Track owned assets and net worth contributors" />
        <Card className="finance-card-static"><CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted mb-4"><Building2 className="h-7 w-7 text-muted-foreground" /></div>
          <h3 className="text-base font-semibold">Premium Module</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">Upgrade to Premium to track assets.</p>
          <Button className="mt-4" onClick={() => window.location.href = "/subscription"}>Upgrade Now</Button>
        </CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Assets" subtitle="Track owned assets and net worth contributors" actions={<Button size="sm" className="gap-1.5 shadow-sm" onClick={() => openModal()}><Plus className="h-4 w-4" /> Add Asset</Button>} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <FinanceCard icon={<Building2 className="h-5 w-5 text-primary" />} iconBg="bg-primary/10" label="Total Asset Value" value={fmt(totalValue)} />
        <FinanceCard icon={<Hash className="h-5 w-5 text-muted-foreground" />} iconBg="bg-muted" label="Asset Count" value={String(activeItems.length)} />
        <FinanceCard icon={<TrendingUp className="h-5 w-5 text-positive" />} iconBg="bg-positive/10" label="Highest Value" value={fmt(highestValue)} />
        <FinanceCard icon={<TrendingDown className="h-5 w-5 text-warning" />} iconBg="bg-warning/10" label="Updated This Month" value={String(updatedThisMonth)} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px] max-w-xs"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" /></div>
        <Select value={typeFilter} onValueChange={setTypeFilter}><SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Types</SelectItem>{ASSET_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}</SelectContent></Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="sold">Sold</SelectItem><SelectItem value="archived">Archived</SelectItem></SelectContent></Select>
        {(search || typeFilter !== "all" || statusFilter !== "all") && <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={() => { setSearch(""); setTypeFilter("all"); setStatusFilter("all"); }}><RotateCcw className="h-3 w-3" /> Reset</Button>}
      </div>

      {isLoading ? <Card className="finance-card-static"><CardContent className="py-12 text-center text-sm text-muted-foreground">Loading...</CardContent></Card>
      : filtered.length === 0 ? <EmptyState icon="Building2" title="No assets" description="Add your first asset to start tracking." action={<Button size="sm" onClick={() => openModal()}><Plus className="h-4 w-4 mr-1" /> Add Asset</Button>} />
      : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(a => {
            const appreciation = Number(a.current_value) - Number(a.purchase_value);
            const pct = Number(a.purchase_value) > 0 ? ((appreciation / Number(a.purchase_value)) * 100).toFixed(1) : "0";
            return (
              <Card key={a.id} className="finance-card-static">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold">{a.asset_name}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">{a.asset_type.replace(/_/g, " ")}</p>
                    </div>
                    <Badge variant="secondary" className={`text-[10px] capitalize ${statusColors[a.status] || ""}`}>{a.status}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><p className="text-muted-foreground">Purchase</p><p className="font-semibold">{fmt(Number(a.purchase_value))}</p></div>
                    <div><p className="text-muted-foreground">Current</p><p className="font-semibold">{fmt(Number(a.current_value))}</p></div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className={appreciation >= 0 ? "text-positive" : "text-negative"}>{appreciation >= 0 ? "+" : ""}{pct}% {appreciation >= 0 ? "↑" : "↓"}</span>
                    {a.acquisition_date && <span className="text-muted-foreground">{format(parseISO(a.acquisition_date), "dd MMM yyyy")}</span>}
                  </div>
                  <div className="flex items-center gap-1 pt-1 border-t border-border/50">
                    <Button variant="ghost" size="sm" className="h-7 text-xs flex-1" onClick={() => openModal(a)}><Pencil className="h-3 w-3 mr-1" /> Edit</Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-negative" onClick={() => setDeleteId(a.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={modal} onOpenChange={setModal}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>{editing ? "Edit Asset" : "Add Asset"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label className="text-xs">Asset Name *</Label><Input value={form.asset_name} onChange={e => setForm(f => ({ ...f, asset_name: e.target.value }))} className="mt-1" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Asset Type</Label><Select value={form.asset_type} onValueChange={v => setForm(f => ({ ...f, asset_type: v }))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{ASSET_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className="text-xs">Status</Label><Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="sold">Sold</SelectItem><SelectItem value="archived">Archived</SelectItem></SelectContent></Select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Purchase Value *</Label><Input type="number" value={form.purchase_value} onChange={e => setForm(f => ({ ...f, purchase_value: e.target.value }))} className="mt-1" /></div>
            <div><Label className="text-xs">Current Value</Label><Input type="number" value={form.current_value} onChange={e => setForm(f => ({ ...f, current_value: e.target.value }))} className="mt-1" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Acquisition Date</Label><Input type="date" value={form.acquisition_date} onChange={e => setForm(f => ({ ...f, acquisition_date: e.target.value }))} className="mt-1" /></div>
            <div><Label className="text-xs">Linked Account</Label><Select value={form.linked_account_id} onValueChange={v => setForm(f => ({ ...f, linked_account_id: v }))}><SelectTrigger className="mt-1"><SelectValue placeholder="None" /></SelectTrigger><SelectContent>{accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div><Label className="text-xs">Note</Label><Textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} className="mt-1" rows={2} /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => setModal(false)}>Cancel</Button><Button onClick={handleSave} disabled={!form.asset_name || !form.purchase_value || createMut.isPending || updateMut.isPending}>{createMut.isPending || updateMut.isPending ? "Saving..." : "Save"}</Button></DialogFooter>
      </DialogContent></Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Asset?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => { if (deleteId) deleteMut.mutate(deleteId); setDeleteId(null); }}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
}
