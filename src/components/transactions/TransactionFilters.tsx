import { useState } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockCategories, mockAccounts } from "@/data/mock-data";

interface TransactionFiltersProps {
  onSearch?: (query: string) => void;
}

export function TransactionFilters({ onSearch }: TransactionFiltersProps) {
  const [search, setSearch] = useState("");

  return (
    <div className="finance-card-static p-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-52">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            className="pl-8 h-8 text-xs bg-background border-border/60"
            value={search}
            onChange={(e) => { setSearch(e.target.value); onSearch?.(e.target.value); }}
          />
        </div>
        <Select>
          <SelectTrigger className="w-[120px] h-8 text-xs bg-background border-border/60"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
            <SelectItem value="transfer">Transfer</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-[140px] h-8 text-xs bg-background border-border/60"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {mockCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-[140px] h-8 text-xs bg-background border-border/60 hidden sm:flex"><SelectValue placeholder="Account" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Accounts</SelectItem>
            {mockAccounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-[110px] h-8 text-xs bg-background border-border/60 hidden md:flex"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="recurring">Recurring</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground ml-auto">
          <X className="h-3 w-3" /> Reset
        </Button>
      </div>
    </div>
  );
}
