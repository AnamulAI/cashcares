import { useState } from "react";
import { Search, X, Filter } from "lucide-react";
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
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative w-full sm:w-56">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search transactions..."
          className="pl-8 h-9"
          value={search}
          onChange={(e) => { setSearch(e.target.value); onSearch?.(e.target.value); }}
        />
      </div>
      <Select>
        <SelectTrigger className="w-32 h-9 text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="income">Income</SelectItem>
          <SelectItem value="expense">Expense</SelectItem>
          <SelectItem value="transfer">Transfer</SelectItem>
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger className="w-36 h-9 text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {mockCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger className="w-36 h-9 text-xs"><SelectValue placeholder="Account" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Accounts</SelectItem>
          {mockAccounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger className="w-28 h-9 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="recurring">Recurring</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="ghost" size="sm" className="h-9 text-xs gap-1">
        <X className="h-3 w-3" /> Reset
      </Button>
    </div>
  );
}
