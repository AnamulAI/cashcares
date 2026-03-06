import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories } from "@/hooks/use-categories";
import { useAccounts } from "@/hooks/use-accounts";
import { Badge } from "@/components/ui/badge";

export interface TransactionFilterValues {
  search: string;
  type: string;
  categoryId: string;
  accountId: string;
  status: string;
}

const emptyFilters: TransactionFilterValues = {
  search: "",
  type: "all",
  categoryId: "all",
  accountId: "all",
  status: "all",
};

interface TransactionFiltersProps {
  filters: TransactionFilterValues;
  onChange: (filters: TransactionFilterValues) => void;
}

export function TransactionFilters({ filters, onChange }: TransactionFiltersProps) {
  const { data: categories = [] } = useCategories();
  const { data: accounts = [] } = useAccounts();

  const activeCount = [
    filters.search,
    filters.type !== "all" ? filters.type : "",
    filters.categoryId !== "all" ? filters.categoryId : "",
    filters.accountId !== "all" ? filters.accountId : "",
    filters.status !== "all" ? filters.status : "",
  ].filter(Boolean).length;

  const set = (patch: Partial<TransactionFilterValues>) => onChange({ ...filters, ...patch });

  return (
    <div className="finance-card-static p-3 sticky top-0 z-10">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-52">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            className="pl-8 h-8 text-xs bg-background border-border/60"
            value={filters.search}
            onChange={(e) => set({ search: e.target.value })}
          />
        </div>
        <Select value={filters.type} onValueChange={(v) => set({ type: v })}>
          <SelectTrigger className="w-[120px] h-8 text-xs bg-background border-border/60"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
            <SelectItem value="transfer">Transfer</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.categoryId} onValueChange={(v) => set({ categoryId: v })}>
          <SelectTrigger className="w-[140px] h-8 text-xs bg-background border-border/60"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filters.accountId} onValueChange={(v) => set({ accountId: v })}>
          <SelectTrigger className="w-[140px] h-8 text-xs bg-background border-border/60 hidden sm:flex"><SelectValue placeholder="Account" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Accounts</SelectItem>
            {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filters.status} onValueChange={(v) => set({ status: v })}>
          <SelectTrigger className="w-[110px] h-8 text-xs bg-background border-border/60 hidden md:flex"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground ml-auto"
          onClick={() => onChange(emptyFilters)}
        >
          <X className="h-3 w-3" /> Reset
          {activeCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-4 min-w-4 px-1 text-[10px] rounded-full">
              {activeCount}
            </Badge>
          )}
        </Button>
      </div>
    </div>
  );
}

export { emptyFilters };
