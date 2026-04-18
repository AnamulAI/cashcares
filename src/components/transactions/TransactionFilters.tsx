import { useState, useEffect } from "react";
import { Search, X, CalendarIcon, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCategories } from "@/hooks/use-categories";
import { useAccounts } from "@/hooks/use-accounts";
import { Badge } from "@/components/ui/badge";
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  subMonths,
  subYears,
} from "date-fns";
import { cn } from "@/lib/utils";

export interface TransactionFilterValues {
  search: string;
  type: string;
  categoryId: string;
  accountId: string;
  status: string;
  dateFrom: string; // ISO yyyy-MM-dd
  dateTo: string;   // ISO yyyy-MM-dd
}

const emptyFilters: TransactionFilterValues = {
  search: "",
  type: "all",
  categoryId: "all",
  accountId: "all",
  status: "all",
  dateFrom: "",
  dateTo: "",
};

interface TransactionFiltersProps {
  filters: TransactionFilterValues;
  onChange: (filters: TransactionFilterValues) => void;
}

type PresetKey =
  | "all"
  | "today"
  | "yesterday"
  | "thisWeek"
  | "thisMonth"
  | "lastMonth"
  | "thisYear"
  | "lastYear"
  | "custom";

const PRESET_LABELS: Record<PresetKey, string> = {
  all: "All Time",
  today: "Today",
  yesterday: "Yesterday",
  thisWeek: "This Week",
  thisMonth: "This Month",
  lastMonth: "Last Month",
  thisYear: "This Year",
  lastYear: "Last Year",
  custom: "Custom",
};

const fmt = (d: Date) => format(d, "yyyy-MM-dd");

function rangeForPreset(preset: PresetKey): { from: string; to: string } {
  const now = new Date();
  switch (preset) {
    case "today":
      return { from: fmt(startOfDay(now)), to: fmt(endOfDay(now)) };
    case "yesterday": {
      const y = subDays(now, 1);
      return { from: fmt(startOfDay(y)), to: fmt(endOfDay(y)) };
    }
    case "thisWeek":
      return { from: fmt(startOfWeek(now, { weekStartsOn: 1 })), to: fmt(endOfWeek(now, { weekStartsOn: 1 })) };
    case "thisMonth":
      return { from: fmt(startOfMonth(now)), to: fmt(endOfMonth(now)) };
    case "lastMonth": {
      const lm = subMonths(now, 1);
      return { from: fmt(startOfMonth(lm)), to: fmt(endOfMonth(lm)) };
    }
    case "thisYear":
      return { from: fmt(startOfYear(now)), to: fmt(endOfYear(now)) };
    case "lastYear": {
      const ly = subYears(now, 1);
      return { from: fmt(startOfYear(ly)), to: fmt(endOfYear(ly)) };
    }
    default:
      return { from: "", to: "" };
  }
}

function detectPreset(from: string, to: string): PresetKey {
  if (!from && !to) return "all";
  const presets: PresetKey[] = ["today", "yesterday", "thisWeek", "thisMonth", "lastMonth", "thisYear", "lastYear"];
  for (const p of presets) {
    const r = rangeForPreset(p);
    if (r.from === from && r.to === to) return p;
  }
  return "custom";
}

export function TransactionFilters({ filters, onChange }: TransactionFiltersProps) {
  const { data: categories = [] } = useCategories();
  const { data: accounts = [] } = useAccounts();
  const [customOpen, setCustomOpen] = useState(false);

  const preset = detectPreset(filters.dateFrom, filters.dateTo);

  const activeCount = [
    filters.search,
    filters.type !== "all" ? filters.type : "",
    filters.categoryId !== "all" ? filters.categoryId : "",
    filters.accountId !== "all" ? filters.accountId : "",
    filters.status !== "all" ? filters.status : "",
    filters.dateFrom,
    filters.dateTo,
  ].filter(Boolean).length;

  const set = (patch: Partial<TransactionFilterValues>) => onChange({ ...filters, ...patch });

  const handlePreset = (p: PresetKey) => {
    if (p === "custom") {
      setCustomOpen(true);
      return;
    }
    const r = rangeForPreset(p);
    set({ dateFrom: r.from, dateTo: r.to });
  };

  const triggerLabel =
    preset === "custom"
      ? `${filters.dateFrom ? format(new Date(filters.dateFrom), "MMM d") : "…"} – ${filters.dateTo ? format(new Date(filters.dateTo), "MMM d") : "…"}`
      : PRESET_LABELS[preset];

  const isActive = preset !== "all";

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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-8 text-xs gap-1.5 bg-background border-border/60",
                isActive && "border-primary/40 text-primary",
              )}
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              {triggerLabel}
              <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            {(["all", "today", "yesterday", "thisWeek", "thisMonth", "lastMonth", "thisYear", "lastYear"] as PresetKey[]).map((p) => (
              <DropdownMenuItem
                key={p}
                onClick={() => handlePreset(p)}
                className={cn("text-xs cursor-pointer", preset === p && "bg-accent text-accent-foreground font-medium")}
              >
                {PRESET_LABELS[p]}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handlePreset("custom")}
              className={cn("text-xs cursor-pointer", preset === "custom" && "bg-accent text-accent-foreground font-medium")}
            >
              Custom…
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Popover open={customOpen} onOpenChange={setCustomOpen}>
          <PopoverTrigger asChild>
            <span className="sr-only" aria-hidden />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={{
                from: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
                to: filters.dateTo ? new Date(filters.dateTo) : undefined,
              }}
              onSelect={(range: any) => {
                set({
                  dateFrom: range?.from ? format(range.from, "yyyy-MM-dd") : "",
                  dateTo: range?.to ? format(range.to, "yyyy-MM-dd") : "",
                });
              }}
              numberOfMonths={2}
              className={cn("p-3 pointer-events-auto")}
            />
            <div className="flex justify-between p-2 border-t">
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => set({ dateFrom: "", dateTo: "" })}>
                Clear
              </Button>
              <Button size="sm" className="h-7 text-xs" onClick={() => setCustomOpen(false)}>
                Done
              </Button>
            </div>
          </PopoverContent>
        </Popover>

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
