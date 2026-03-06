import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, MoreHorizontal, Eye, Pencil, Copy, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency } from "@/config/app";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { Transaction } from "@/types/finance";

const typeIcons = { income: ArrowDownLeft, expense: ArrowUpRight, transfer: ArrowLeftRight };
const typeColors = {
  income: "text-positive bg-positive/8",
  expense: "text-negative bg-negative/8",
  transfer: "text-primary bg-primary/8",
};

interface TransactionTableProps {
  transactions: Transaction[];
  onViewDetails?: (txn: Transaction) => void;
}

export function TransactionTable({ transactions, onViewDetails }: TransactionTableProps) {
  return (
    <div className="finance-card-static overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border/60">
            <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold h-10">Date</TableHead>
            <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold h-10">Type</TableHead>
            <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold h-10">Category</TableHead>
            <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold h-10 hidden md:table-cell">Account</TableHead>
            <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold h-10 hidden lg:table-cell">Note</TableHead>
            <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold h-10 text-right">Amount</TableHead>
            <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold h-10">Status</TableHead>
            <TableHead className="w-10 h-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((t) => {
            const Icon = typeIcons[t.type];
            return (
              <TableRow key={t.id} className="group hover:bg-accent/40 transition-colors cursor-pointer border-border/40" onClick={() => onViewDetails?.(t)}>
                <TableCell className="text-[13px] text-muted-foreground whitespace-nowrap py-3.5">{t.date}</TableCell>
                <TableCell className="py-3.5">
                  <div className="flex items-center gap-2">
                    <div className={cn("h-6 w-6 rounded-md flex items-center justify-center", typeColors[t.type])}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-[13px] capitalize font-medium">{t.type}</span>
                  </div>
                </TableCell>
                <TableCell className="text-[13px] font-medium py-3.5">{t.categoryName}</TableCell>
                <TableCell className="text-[13px] text-muted-foreground hidden md:table-cell py-3.5">{t.accountName}</TableCell>
                <TableCell className="text-[13px] text-muted-foreground hidden lg:table-cell max-w-[180px] truncate py-3.5">{t.note || "—"}</TableCell>
                <TableCell className={cn(
                  "text-[13px] text-right font-semibold tabular-nums py-3.5",
                  t.type === "income" && "text-positive",
                  t.type === "expense" && "text-negative",
                  t.type === "transfer" && "text-foreground"
                )}>
                  {t.type === "income" ? "+" : t.type === "expense" ? "−" : ""}{formatCurrency(t.amount)}
                </TableCell>
                <TableCell className="py-3.5"><StatusBadge status={t.status} /></TableCell>
                <TableCell className="py-3.5" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => onViewDetails?.(t)} className="gap-2 text-[13px]">
                        <Eye className="h-3.5 w-3.5" /> View details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-[13px]">
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-[13px]">
                        <Copy className="h-3.5 w-3.5" /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive gap-2 text-[13px]">
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
