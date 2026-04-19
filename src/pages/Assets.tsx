import { useState, useMemo } from "react";
import { Plus, Building2, TrendingUp, TrendingDown, Hash, Search, RotateCcw, Trash2, Pencil } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { FinanceCard } from "@/components/shared/FinanceCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PremiumLocked } from "@/components/shared/PremiumLocked";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { BulkActionBar } from "@/components/shared/BulkActionBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssets, useCreateAsset, useUpdateAsset, useDeleteAsset, AssetInsert } from "@/hooks/use-assets";
import { useAccounts } from "@/hooks/use-accounts";
import { useAppContext } from "@/contexts/AppContext";
import { useTranslation } from "@/i18n/useTranslation";
import { formatAmount, formatAppDate } from "@/lib/formatters";
import { parseISO, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const ASSET_TYPES = ["cash_reserve", "property", "land", "vehicle", "equipment", "business_asset", "digital_asset", "other"];
const statusColors: Record<string, string> = { active: "bg-positive/10 text-positive", sold: "bg-warning/10 text-warning", archived: "bg-muted text-muted-foreground" };

export default function Assets() {
  const { currency, isPremium, settings } = useAppContext();
  const { t, lang } = useTranslation();
  const { data: items = [], isLoading } = useAssets();
  const { data: accounts = [] } = useAccounts();
  const createMut = useCreateAsset();
  const updateMut = useUpdateAsset();
  const deleteMut = useDeleteAsset();
  const qc = useQueryClient();

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const [form, setForm] = useState({ asset_name: "", asset_type: "other", purchase_value: "", current_value: "", acquisition_date: "", linked_account_id: "", note: "", status: "active" });
  const fmt = (n: number) => formatAmount(n, currency, lang);
  const fmtDate = (d: string) => formatAppDate(d, settings.dateFormat, settings.timezone, lang);
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
      for (const id of selected) { await (supabase as any).from("assets").delete().eq("id", id); }
      qc.invalidateQueries({ queryKey: ["assets"] });
      toast.success(t("bulk.deleteSuccess").replace("{count}", String(selected.size)));
      setSelected(new Set());
      setBulkDeleteOpen(false);
    } finally { setBulkDeleting(false); }
  };

  if (!isPremium) {
    return (
      <div className="space-y-6">
        <PageHeader title={t("assets.title")} subtitle={t("assets.subtitle")} />
        <PremiumLocked icon={<Building2 className="h-7 w-7 text-feature-assets" />} moduleName={t("assets.title")} description={t("premium.upgradeDesc.assets")} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("assets.title")} subtitle={t("assets.subtitle")} actions={<Button size="sm" className="gap-1.5 shadow-sm" onClick={() => openModal()}><Plus className="h-4 w-4" /> {t("action.addAsset")}</Button>} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <FinanceCard icon={<Building2 className="h-5 w-5 text-feature-assets" />} iconBg="bg-feature-assets/10" label={t("module.totalAssetValue")} value={fmt(totalValue)} />
        <FinanceCard icon={<Hash className="h-5 w-5 text-feature-assets" />} iconBg="bg-feature-assets/10" label={t("module.assetCount")} value={String(activeItems.length)} />
        <FinanceCard icon={<TrendingUp className="h-5 w-5 text-positive" />} iconBg="bg-positive/10" label={t("module.highestValue")} value={fmt(highestValue)} />
        <FinanceCard icon={<TrendingDown className="h-5 w-5 text-warning" />} iconBg="bg-warning/10" label={t("module.updatedThisMonth")} value={String(updatedThisMonth)} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px] max-w-xs"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder={t("action.search") + "..."} value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" /></div>
        <Select value={typeFilter} onValueChange={setTypeFilter}><SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">{t("module.allTypes")}</SelectItem>{ASSET_TYPES.map(at => <SelectItem key={at} value={at}>{at.replace(/_/g, " ")}</SelectItem>)}</SelectContent></Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">{t("module.allStatus")}</SelectItem><SelectItem value="active">{t("status.active")}</SelectItem><SelectItem value="sold">{t("status.sold")}</SelectItem><SelectItem value="archived">{t("status.archived")}</SelectItem></SelectContent></Select>
        {(search || typeFilter !== "all" || statusFilter !== "all") && <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={() => { setSearch(""); setTypeFilter("all"); setStatusFilter("all"); }}><RotateCcw className="h-3 w-3" /> {t("action.reset")}</Button>}
      </div>

      <BulkActionBar selectedCount={selected.size} onDelete={() => setBulkDeleteOpen(true)} onClear={() => setSelected(new Set())} deleting={bulkDeleting} />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{[1,2,3].map(i => <Skeleton key={i} className="h-44 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Building2 className="h-7 w-7 text-muted-foreground" />} title={t("module.noAssets")} description={t("module.noAssetsDesc")} action={<Button size="sm" onClick={() => openModal()}><Plus className="h-4 w-4 mr-1" /> {t("action.addAsset")}</Button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(a => {
            const appreciation = Number(a.current_value) - Number(a.purchase_value);
            const pct = Number(a.purchase_value) > 0 ? ((appreciation / Number(a.purchase_value)) * 100).toFixed(1) : "0";
            const isSelected = selected.has(a.id);
            return (
              <Card key={a.id} className={`finance-card group ${isSelected ? "ring-2 ring-primary/40" : ""}`}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox checked={isSelected} onCheckedChange={() => toggleOne(a.id)} />
                      <div>
                        <p className="text-sm font-semibold">{a.asset_name}</p>
                        <p className="text-[10px] text-muted-foreground capitalize">{a.asset_type.replace(/_/g, " ")}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className={`text-[10px] capitalize ${statusColors[a.status] || ""}`}>{a.status}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><p className="text-muted-foreground">{t("module.purchase")}</p><p className="font-semibold">{fmt(Number(a.purchase_value))}</p></div>
                    <div><p className="text-muted-foreground">{t("module.current")}</p><p className="font-semibold">{fmt(Number(a.current_value))}</p></div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className={appreciation >= 0 ? "text-positive" : "text-negative"}>{appreciation >= 0 ? "+" : ""}{pct}% {appreciation >= 0 ? "↑" : "↓"}</span>
                    {a.acquisition_date && <span className="text-muted-foreground">{fmtDate(a.acquisition_date)}</span>}
                  </div>
                  <div className="flex items-center gap-1 pt-1 border-t border-border/50">
                    <Button variant="ghost" size="sm" className="h-7 text-xs flex-1" onClick={() => openModal(a)}><Pencil className="h-3 w-3 mr-1" /> {t("action.edit")}</Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-negative" onClick={() => setDeleteId(a.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={modal} onOpenChange={setModal}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>{editing ? t("module.editAsset") : t("module.addAsset")}</DialogTitle></DialogHeader>
        <div className="space-y-3 py-1">
          <div><Label className="text-xs">{t("module.assetName")} *</Label><Input value={form.asset_name} onChange={e => setForm(f => ({ ...f, asset_name: e.target.value }))} className="mt-1 h-9 text-sm" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">{t("module.assetType")}</Label><Select value={form.asset_type} onValueChange={v => setForm(f => ({ ...f, asset_type: v }))}><SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger><SelectContent>{ASSET_TYPES.map(at => <SelectItem key={at} value={at}>{at.replace(/_/g, " ")}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className="text-xs">{t("table.status")}</Label><Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}><SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">{t("status.active")}</SelectItem><SelectItem value="sold">{t("status.sold")}</SelectItem><SelectItem value="archived">{t("status.archived")}</SelectItem></SelectContent></Select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">{t("module.purchaseValue")} *</Label><Input type="number" min="0" value={form.purchase_value} onChange={e => setForm(f => ({ ...f, purchase_value: e.target.value }))} className="mt-1 h-9 text-sm" /></div>
            <div><Label className="text-xs">{t("module.currentValue")}</Label><Input type="number" min="0" value={form.current_value} onChange={e => setForm(f => ({ ...f, current_value: e.target.value }))} className="mt-1 h-9 text-sm" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">{t("module.acquisitionDate")}</Label><Input type="date" value={form.acquisition_date} onChange={e => setForm(f => ({ ...f, acquisition_date: e.target.value }))} className="mt-1 h-9 text-sm" /></div>
            <div><Label className="text-xs">{t("module.linkedAccount")}</Label><Select value={form.linked_account_id} onValueChange={v => setForm(f => ({ ...f, linked_account_id: v }))}><SelectTrigger className="mt-1 h-9 text-sm"><SelectValue placeholder="—" /></SelectTrigger><SelectContent>{accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div><Label className="text-xs">{t("table.note")}</Label><Textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} className="mt-1 text-sm" rows={2} /></div>
          {editing && <EntryAttachments entryId={editing.id} entryType="asset" />}
        </div>
        <DialogFooter><Button variant="outline" size="sm" onClick={() => setModal(false)}>{t("action.cancel")}</Button><Button size="sm" onClick={handleSave} disabled={!form.asset_name || !form.purchase_value || createMut.isPending || updateMut.isPending}>{createMut.isPending || updateMut.isPending ? t("common.saving") : t("action.save")}</Button></DialogFooter>
      </DialogContent></Dialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title={t("confirm.deleteAsset")} description={t("confirm.deleteDesc")} onConfirm={() => { if (deleteId) deleteMut.mutate(deleteId); setDeleteId(null); }} />
      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title={t("bulk.deleteTitle")}
        description={t("bulk.deleteDesc").replace("{count}", String(selected.size))}
        onConfirm={handleBulkDelete}
        loading={bulkDeleting}
        confirmLabel={t("bulk.confirmDelete").replace("{count}", String(selected.size))}
      />
    </div>
  );
}