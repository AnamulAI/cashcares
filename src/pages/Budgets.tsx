import { useState, useMemo } from "react";
import { Plus, PieChart, TrendingDown, AlertTriangle, Search, RotateCcw, ShieldCheck, Target, Gauge } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { FinanceCard } from "@/components/shared/FinanceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCategories, type DbCategory } from "@/hooks/use-categories";
import { useAppContext } from "@/contexts/AppContext";

interface Budget {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  allocated: number;
  spent: number;
  threshold: number;
  note: string;
  isActive: boolean;
}

const MOCK_BUDGETS: Budget[] = [
  { id: "1", categoryId: "c1", categoryName: "Food & Dining", categoryIcon: "🍕", categoryColor: "hsl(25, 95%, 53%)", allocated: 15000, spent: 13200, threshold: 80, note: "", isActive: true },
  { id: "2", categoryId: "c2", categoryName: "Transportation", categoryIcon: "🚗", categoryColor: "hsl(217, 91%, 60%)", allocated: 8000, spent: 4500, threshold: 80, note: "", isActive: true },
  { id: "3", categoryId: "c3", categoryName: "Utilities", categoryIcon: "💡", categoryColor: "hsl(45, 93%, 47%)", allocated: 5000, spent: 5200, threshold: 90, note: "", isActive: true },
  { id: "4", categoryId: "c4", categoryName: "Entertainment", categoryIcon: "🎬", categoryColor: "hsl(280, 67%, 55%)", allocated: 6000, spent: 2100, threshold: 80, note: "", isActive: true },
  { id: "5", categoryId: "c5", categoryName: "Healthcare", categoryIcon: "🏥", categoryColor: "hsl(152, 69%, 36%)", allocated: 10000, spent: 3000, threshold: 80, note: "", isActive: true },
  { id: "6", categoryId: "c6", categoryName: "Shopping", categoryIcon: "🛍️", categoryColor: "hsl(340, 82%, 52%)", allocated: 12000, spent: 9800, threshold: 75, note: "", isActive: true },
];

function getStatus(spent: number, allocated: number, threshold: number) {
  const pct = (spent / allocated) * 100;
  if (pct >= 100) return { label: "Over Limit", variant: "destructive" as const, color: "text-negative" };
  if (pct >= threshold) return { label: "Warning", variant: "secondary" as const, color: "text-warning" };
  return { label: "Safe", variant: "outline" as const, color: "text-positive" };
}

export default function Budgets() {
  const { currency } = useAppContext();
  const { data: categories = [] } = useCategories();
  const [budgets] = useState<Budget[]>(MOCK_BUDGETS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = budgets;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(b => b.categoryName.toLowerCase().includes(q));
    }
    if (categoryFilter !== "all") {
      result = result.filter(b => b.categoryId === categoryFilter);
    }
    if (statusFilter !== "all") {
      result = result.filter(b => {
        const s = getStatus(b.spent, b.allocated, b.threshold);
        return s.label.toLowerCase().replace(" ", "_") === statusFilter;
      });
    }
    return result;
  }, [budgets, search, statusFilter, categoryFilter]);

  const totalBudget = budgets.reduce((s, b) => s + b.allocated, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const remaining = totalBudget - totalSpent;
  const overLimit = budgets.filter(b => b.spent >= b.allocated).length;

  const fmt = (n: number) => `${currency.symbol}${n.toLocaleString()}`;

  const resetFilters = () => { setSearch(""); setStatusFilter("all"); setCategoryFilter("all"); };

  const riskyBudgets = [...budgets].sort((a, b) => (b.spent / b.allocated) - (a.spent / a.allocated)).slice(0, 4);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budgets"
        subtitle="Plan spending limits and track category-wise control"
        actions={<Button size="sm" className="gap-1.5 h-9" onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> Create Budget</Button>}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <FinanceCard icon={<Target className="h-5 w-5 text-primary" />} label="Total Budget" value={fmt(totalBudget)} iconBg="bg-primary/10" />
        <FinanceCard icon={<TrendingDown className="h-5 w-5 text-negative" />} label="Total Spent" value={fmt(totalSpent)} iconBg="bg-negative/10" />
        <FinanceCard icon={<ShieldCheck className="h-5 w-5 text-positive" />} label="Remaining" value={fmt(remaining)} iconBg="bg-positive/10" />
        <FinanceCard icon={<PieChart className="h-5 w-5 text-primary" />} label="Active Budgets" value={String(budgets.filter(b => b.isActive).length)} iconBg="bg-accent" />
        <FinanceCard icon={<AlertTriangle className="h-5 w-5 text-warning" />} label="Over Limit" value={String(overLimit)} iconBg="bg-warning/10" />
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-52">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search budgets..." className="pl-8 h-8 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {budgets.map(b => <SelectItem key={b.categoryId} value={b.categoryId}>{b.categoryName}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="safe">Safe</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="over_limit">Over Limit</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={resetFilters}><RotateCcw className="h-3 w-3" /> Reset</Button>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Budget cards */}
        <div className="lg:col-span-2 space-y-3">
          {filtered.length === 0 ? (
            <EmptyState
              title="No budgets found"
              description="Create your first budget to start controlling your spending."
              icon={<PieChart className="h-7 w-7 text-muted-foreground" />}
              action={<Button size="sm" onClick={() => setCreateOpen(true)}>Create Budget</Button>}
            />
          ) : (
            filtered.map(b => {
              const pct = Math.min(Math.round((b.spent / b.allocated) * 100), 120);
              const status = getStatus(b.spent, b.allocated, b.threshold);
              const remainAmt = b.allocated - b.spent;
              return (
                <div key={b.id} className="finance-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl text-lg" style={{ backgroundColor: b.categoryColor + "18" }}>
                        {b.categoryIcon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{b.categoryName}</p>
                        <p className="text-xs text-muted-foreground">{fmt(b.spent)} of {fmt(b.allocated)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={status.variant} className="text-[10px] px-2 py-0.5">{status.label}</Badge>
                      <span className={`text-sm font-bold ${status.color}`}>{remainAmt >= 0 ? fmt(remainAmt) : `-${fmt(Math.abs(remainAmt))}`}</span>
                    </div>
                  </div>
                  <div className="mt-3 relative">
                    <Progress value={Math.min(pct, 100)} className="h-2" />
                    {/* Threshold marker */}
                    <div className="absolute top-0 h-2 w-0.5 bg-foreground/30 rounded-full" style={{ left: `${b.threshold}%` }} />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[10px] text-muted-foreground">{pct}% used</span>
                    <span className="text-[10px] text-muted-foreground">Threshold: {b.threshold}%</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          <Card className="finance-card-static">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><Gauge className="h-4 w-4 text-primary" /> Budget Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Overall Utilization</span>
                <span className="font-semibold">{totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}%</span>
              </div>
              <Progress value={totalBudget > 0 ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100) : 0} className="h-2" />
              <div className="border-t pt-3 mt-2">
                <p className="text-xs font-medium text-muted-foreground mb-2">Top Risk Categories</p>
                {riskyBudgets.map(b => {
                  const pct = Math.round((b.spent / b.allocated) * 100);
                  return (
                    <div key={b.id} className="flex items-center justify-between py-1.5">
                      <span className="text-xs truncate">{b.categoryIcon} {b.categoryName}</span>
                      <span className={`text-xs font-semibold ${pct >= 100 ? "text-negative" : pct >= 80 ? "text-warning" : "text-positive"}`}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="finance-card-static">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">💡 Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-muted-foreground leading-relaxed">• Set threshold alerts at 75–80% to catch overspending early.</p>
              <p className="text-xs text-muted-foreground leading-relaxed">• Review budgets monthly and adjust based on trends.</p>
              <p className="text-xs text-muted-foreground leading-relaxed">• Categories exceeding limits 3 months in a row need re-evaluation.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Budget Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Budget</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Category</Label>
              <Select>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.filter(c => c.group === "expense" && c.usable_in_budgets).map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                  {categories.filter(c => c.group === "expense" && c.usable_in_budgets).length === 0 && (
                    <SelectItem value="_none" disabled>No budget categories</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Allocated Amount</Label>
                <Input type="number" placeholder="0" className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Alert Threshold (%)</Label>
                <Input type="number" placeholder="80" className="h-9 text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Note</Label>
              <Textarea placeholder="Optional note..." className="text-sm resize-none" rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={() => setCreateOpen(false)}>Create Budget</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
