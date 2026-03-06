import { useState } from "react";
import { Plus, Search, FolderOpen } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { CategoryList } from "@/components/categories/CategoryList";
import { CategoryInsights } from "@/components/categories/CategoryInsights";
import { AddCategoryModal } from "@/components/categories/AddCategoryModal";
import { EmptyState } from "@/components/shared/EmptyState";
import { BulkActionBar } from "@/components/shared/BulkActionBar";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories, type DbCategory } from "@/hooks/use-categories";
import { useTranslation } from "@/i18n/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const groupTabs: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
  { value: "savings", label: "Savings" },
  { value: "budget", label: "Budget" },
  { value: "asset", label: "Asset" },
  { value: "investment", label: "Investment" },
  { value: "receivable", label: "Receivable" },
  { value: "payable", label: "Payable" },
  { value: "debt", label: "Debt" },
  { value: "credit_card", label: "Credit Card" },
];

export default function Categories() {
  const [addOpen, setAddOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<DbCategory | null>(null);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const { t } = useTranslation();
  const qc = useQueryClient();

  const { data: categories = [], isLoading } = useCategories();

  const filtered = categories
    .filter(c => tab === "all" || c.group === tab)
    .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  const handleEdit = (cat: DbCategory) => {
    setEditCategory(cat);
    setAddOpen(true);
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };
  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    try {
      for (const id of selected) { await supabase.from("categories").delete().eq("id", id); }
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success(t("bulk.deleteSuccess").replace("{count}", String(selected.size)));
      setSelected(new Set());
      setBulkDeleteOpen(false);
    } finally { setBulkDeleting(false); }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("categories.title")}
        subtitle={t("categories.subtitle")}
        actions={
          <Button size="sm" className="gap-1.5 h-9" onClick={() => { setEditCategory(null); setAddOpen(true); }}>
            <Plus className="h-4 w-4" /> {t("action.addCategory")}
          </Button>
        }
      />

      <CategoryInsights categories={categories} />

      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="overflow-x-auto">
            <TabsList className="bg-muted/60 p-1 h-auto gap-1">
              {groupTabs.map(g => (
                <TabsTrigger key={g.value} value={g.value} className="text-xs px-3 py-1.5 rounded-lg data-[state=active]:shadow-sm">{g.label}</TabsTrigger>
              ))}
            </TabsList>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder={t("categories.searchCategories")} className="pl-8 h-8 text-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select>
              <SelectTrigger className="w-[110px] h-8 text-xs"><SelectValue placeholder={t("common.sortBy")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="name">{t("common.name")}</SelectItem>
                <SelectItem value="usage">{t("common.usage")}</SelectItem>
                <SelectItem value="latest">{t("common.latest")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <BulkActionBar selectedCount={selected.size} onDelete={() => setBulkDeleteOpen(true)} onClear={() => setSelected(new Set())} deleting={bulkDeleting} />

        <TabsContent value={tab} className="mt-4">
          {isLoading ? (
            <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
          ) : filtered.length > 0 ? (
            <CategoryList categories={filtered} onEdit={handleEdit} selected={selected} onToggleSelect={toggleOne} />
          ) : (
            <EmptyState
              title={t("categories.noFound")}
              description={t("categories.addFirst")}
              icon={<FolderOpen className="h-7 w-7 text-muted-foreground" />}
              action={<Button size="sm" onClick={() => { setEditCategory(null); setAddOpen(true); }}>{t("action.addCategory")}</Button>}
            />
          )}
        </TabsContent>
      </Tabs>

      <AddCategoryModal open={addOpen} onOpenChange={setAddOpen} editCategory={editCategory} />
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