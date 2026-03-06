import { useState } from "react";
import { Plus, Search, LayoutGrid, List, Wallet2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { AccountSummary } from "@/components/accounts/AccountSummary";
import { AccountCards } from "@/components/accounts/AccountCards";
import { AddAccountModal } from "@/components/accounts/AddAccountModal";
import { AccountDetails } from "@/components/accounts/AccountDetails";
import { EmptyState } from "@/components/shared/EmptyState";
import { BulkActionBar } from "@/components/shared/BulkActionBar";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAccounts, type DbAccount } from "@/hooks/use-accounts";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/i18n/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function Accounts() {
  const [addOpen, setAddOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<DbAccount | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<DbAccount | null>(null);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const { t } = useTranslation();
  const qc = useQueryClient();

  const { data: accounts = [], isLoading } = useAccounts();

  const filtered = accounts
    .filter(a => tab === "all" || a.type === tab)
    .filter(a => !search || a.name.toLowerCase().includes(search.toLowerCase()));

  const handleViewDetails = (account: DbAccount) => {
    setSelectedAccount(account);
    setDetailsOpen(true);
  };

  const handleEdit = (account: DbAccount) => {
    setEditAccount(account);
    setAddOpen(true);
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(a => a.id)));
  };
  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };
  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    try {
      for (const id of selected) { await supabase.from("accounts").delete().eq("id", id); }
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast.success(t("bulk.deleteSuccess").replace("{count}", String(selected.size)));
      setSelected(new Set());
      setBulkDeleteOpen(false);
    } finally { setBulkDeleting(false); }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("accounts.title")}
        subtitle={t("accounts.subtitle")}
        actions={
          <Button size="sm" className="gap-1.5 h-9" onClick={() => { setEditAccount(null); setAddOpen(true); }}>
            <Plus className="h-4 w-4" /> {t("action.addAccount")}
          </Button>
        }
      />

      <AccountSummary accounts={accounts} />

      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <TabsList className="bg-muted/60 p-1 h-auto gap-1 overflow-x-auto">
            <TabsTrigger value="all" className="text-xs px-3 py-1.5 rounded-lg data-[state=active]:shadow-sm">{t("accounts.all")}</TabsTrigger>
            <TabsTrigger value="cash" className="text-xs px-3 py-1.5 rounded-lg data-[state=active]:shadow-sm">{t("accounts.cash")}</TabsTrigger>
            <TabsTrigger value="bank" className="text-xs px-3 py-1.5 rounded-lg data-[state=active]:shadow-sm">{t("accounts.bank")}</TabsTrigger>
            <TabsTrigger value="mobile_wallet" className="text-xs px-3 py-1.5 rounded-lg data-[state=active]:shadow-sm">{t("accounts.mobileWallet")}</TabsTrigger>
            <TabsTrigger value="card" className="text-xs px-3 py-1.5 rounded-lg data-[state=active]:shadow-sm">{t("accounts.card")}</TabsTrigger>
            <TabsTrigger value="savings" className="text-xs px-3 py-1.5 rounded-lg data-[state=active]:shadow-sm">{t("accounts.savingsType")}</TabsTrigger>
            <TabsTrigger value="business" className="text-xs px-3 py-1.5 rounded-lg data-[state=active]:shadow-sm">{t("accounts.business")}</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <div className="relative w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder={t("accounts.searchAccounts")} className="pl-8 h-8 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select>
              <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder={t("common.sortBy")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">{t("common.latest")}</SelectItem>
                <SelectItem value="balance">Highest Balance</SelectItem>
                <SelectItem value="name">{t("common.name")}</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center border rounded-lg overflow-hidden">
              <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" className="h-8 w-8 rounded-none" onClick={() => setViewMode("grid")}>
                <LayoutGrid className="h-3.5 w-3.5" />
              </Button>
              <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="icon" className="h-8 w-8 rounded-none" onClick={() => setViewMode("list")}>
                <List className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        <BulkActionBar selectedCount={selected.size} onDelete={() => setBulkDeleteOpen(true)} onClear={() => setSelected(new Set())} deleting={bulkDeleting} />

        <TabsContent value={tab} className="mt-4">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
            </div>
          ) : filtered.length > 0 ? (
            <AccountCards accounts={filtered} onViewDetails={handleViewDetails} onEdit={handleEdit} viewMode={viewMode} selected={selected} onToggleSelect={toggleOne} onToggleAll={toggleAll} />
          ) : (
            <EmptyState
              title={t("accounts.noFound")}
              description={t("accounts.addFirst")}
              icon={<Wallet2 className="h-7 w-7 text-muted-foreground" />}
              action={<Button size="sm" onClick={() => { setEditAccount(null); setAddOpen(true); }}>{t("action.addAccount")}</Button>}
            />
          )}
        </TabsContent>
      </Tabs>

      <AddAccountModal open={addOpen} onOpenChange={setAddOpen} editAccount={editAccount} />
      <AccountDetails account={selectedAccount} open={detailsOpen} onOpenChange={setDetailsOpen} onEdit={handleEdit} />
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