import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, MoreHorizontal, Eye, Pencil, Copy, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency } from "@/config/app";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { Transaction } from "@/types/finance";

const typeIcons = { income: ArrowDownLeft, expense: ArrowUpRight, transfer: ArrowLeftRight };

interface TransactionTableProps {
  transactions: Transaction[];
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs">Date</TableHead>
            <TableHead className="text-xs">Type</TableHead>
            <TableHead className="text-xs">Category</TableHead>
            <TableHead className="text-xs hidden md:table-cell">Account</TableHead>
            <TableHead className="text-xs hidden lg:table-cell">Note</TableHead>
            <TableHead className="text-xs text-right">Amount</TableHead>
            <TableHead className="text-xs">Status</TableHead>
            <TableHead className="text-xs w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((t) => {
            const Icon = typeIcons[t.type];
            return (
              <TableRow key={t.id}>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{t.date}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Icon className={cn("h-3.5 w-3.5", t.type === "income" ? "text-positive" : t.type === "expense" ? "text-negative" : "text-primary")} />
                    <span className="text-xs capitalize">{t.type}</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs font-medium">{t.categoryName}</TableCell>
                <TableCell className="text-xs text-muted-foreground hidden md:table-cell">{t.accountName}</TableCell>
                <TableCell className="text-xs text-muted-foreground hidden lg:table-cell max-w-[200px] truncate">{t.note}</TableCell>
                <TableCell className={cn("text-xs text-right font-semibold", t.type === "income" ? "text-positive" : t.type === "expense" ? "text-negative" : "")}>
                  {t.type === "income" ? "+" : t.type === "expense" ? "-" : ""}{formatCurrency(t.amount)}
                </TableCell>
                <TableCell><StatusBadge status={t.status} /></TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem><Eye className="h-3.5 w-3.5 mr-2" /> View</DropdownMenuItem>
                      <DropdownMenuItem><Pencil className="h-3.5 w-3.5 mr-2" /> Edit</DropdownMenuItem>
                      <DropdownMenuItem><Copy className="h-3.5 w-3.5 mr-2" /> Duplicate</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive"><Trash2 className="h-3.5 w-3.5 mr-2" /> Delete</DropdownMenuItem>
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
