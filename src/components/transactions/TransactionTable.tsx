import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, MoreHorizontal, Eye, Pencil, Copy, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency } from "@/config/app";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useDeleteTransaction } from "@/hooks/use-transactions";

const typeIcons: Record<string, any> = { income: ArrowDownLeft, expense: ArrowUpRight, transfer: ArrowLeftRight };
const typeColors: Record<string, string> = {
  income: "text-positive bg-positive/8",
  expense: "text-negative bg-negative/8",
  transfer: "text-primary bg-primary/8",
};

interface TransactionTableProps {
  transactions: any[];
  onViewDetails?: (txn: any) => void;
}

export function TransactionTable({ transactions, onViewDetails }: TransactionTableProps) {
  const deleteTxn = useDeleteTransaction();

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
          {transactions.map((t: any) => {
            const Icon = typeIcons[t.type] || ArrowUpRight;
            return (
              <TableRow key={t.id} className="group hover:bg-accent/40 transition-colors cursor-pointer border-border/40" onClick={() => onViewDetails?.(t)}>
                <TableCell className="text-[13px] text-muted-foreground whitespace-nowrap py-3.5">{t.date}</TableCell>
                <TableCell className="py-3.5">
                  <div className="flex items-center gap-2">
                    <div className={cn("h-6 w-6 rounded-md flex items-center justify-center", typeColors[t.type] || "")}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-[13px] capitalize font-medium">{t.type}</span>
                  </div>
                </TableCell>
                <TableCell className="text-[13px] font-medium py-3.5">{t.category?.name || (t.type === "transfer" ? "Transfer" : "—")}</TableCell>
                <TableCell className="text-[13px] text-muted-foreground hidden md:table-cell py-3.5">{t.account?.name || "—"}</TableCell>
                <TableCell className="text-[13px] text-muted-foreground hidden lg:table-cell max-w-[180px] truncate py-3.5">{t.note || "—"}</TableCell>
                <TableCell className={cn("text-[13px] text-right font-semibold tabular-nums py-3.5", t.type === "income" && "text-positive", t.type === "expense" && "text-negative", t.type === "transfer" && "text-foreground")}>
                  {t.type === "income" ? "+" : t.type === "expense" ? "−" : ""}{formatCurrency(t.amount)}
                </TableCell>
                <TableCell className="py-3.5"><StatusBadge status={t.status} /></TableCell>
                <TableCell className="py-3.5" onClick={e => e.stopPropagation()}>
                  <AlertDialog>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => onViewDetails?.(t)} className="gap-2 text-[13px]"><Eye className="h-3.5 w-3.5" /> View details</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem className="text-destructive gap-2 text-[13px]"><Trash2 className="h-3.5 w-3.5" /> Delete</DropdownMenuItem>
                        </AlertDialogTrigger>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this transaction?</AlertDialogTitle>
                        <AlertDialogDescription>This will reverse the balance impact and permanently remove this transaction.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteTxn.mutate({ id: t.id, type: t.type, amount: Number(t.amount), account_id: t.account_id, to_account_id: t.to_account_id, transfer_fee: t.transfer_fee ? Number(t.transfer_fee) : null, category_id: t.category_id })} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
