import { MoreHorizontal, Pencil, Copy, Archive, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Category } from "@/types/finance";

interface CategoryListProps {
  categories: Category[];
}

const groupLabels: Record<string, string> = {
  income: "Income", expense: "Expense", savings: "Savings", budget: "Budget",
  asset: "Asset", investment: "Investment", receivable: "Receivable",
  payable: "Payable", debt: "Debt", credit_card: "Credit Card",
};

export function CategoryList({ categories }: CategoryListProps) {
  return (
    <div className="finance-card-static overflow-hidden">
      <div className="divide-y divide-border/50">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-accent/30 transition-colors group">
            <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${cat.color}12` }}>
              <div className="h-4 w-4 rounded-full" style={{ backgroundColor: cat.color }} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold truncate">{cat.name}</p>
                {cat.usableInBudgets && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-warning/10 text-warning border-0 shrink-0">Budget</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-muted-foreground capitalize">{groupLabels[cat.group] || cat.group}</span>
                <span className="text-[11px] text-muted-foreground">·</span>
                <span className="text-[11px] text-muted-foreground">{cat.usageCount} transactions</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!cat.isActive && <Badge variant="outline" className="text-[10px] px-1.5 py-0">Inactive</Badge>}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem className="gap-2 text-[13px]"><Pencil className="h-3.5 w-3.5" /> Edit</DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 text-[13px]"><Copy className="h-3.5 w-3.5" /> Duplicate</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2 text-[13px]"><Archive className="h-3.5 w-3.5" /> Archive</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive gap-2 text-[13px]"><Trash2 className="h-3.5 w-3.5" /> Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
