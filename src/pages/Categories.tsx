import { useState } from "react";
import { Plus, Search, FolderOpen } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { CategoryList } from "@/components/categories/CategoryList";
import { CategoryInsights } from "@/components/categories/CategoryInsights";
import { AddCategoryModal } from "@/components/categories/AddCategoryModal";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockCategories } from "@/data/mock-data";
import type { CategoryGroup } from "@/types/finance";

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
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = mockCategories
    .filter(c => tab === "all" || c.group === tab)
    .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        subtitle="Organize and control your financial classification system"
        actions={
          <Button size="sm" className="gap-1.5 h-9" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> Add Category
          </Button>
        }
      />

      <CategoryInsights />

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
              <Input placeholder="Search categories..." className="pl-8 h-8 text-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select>
              <SelectTrigger className="w-[110px] h-8 text-xs"><SelectValue placeholder="Sort by" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="usage">Usage</SelectItem>
                <SelectItem value="latest">Latest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value={tab} className="mt-4">
          {filtered.length > 0 ? (
            <CategoryList categories={filtered} />
          ) : (
            <EmptyState
              title="No categories found"
              description="Create custom categories to organize your transactions."
              icon={<FolderOpen className="h-7 w-7 text-muted-foreground" />}
              action={<Button size="sm" onClick={() => setAddOpen(true)}>Add Category</Button>}
            />
          )}
        </TabsContent>
      </Tabs>

      <AddCategoryModal open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
