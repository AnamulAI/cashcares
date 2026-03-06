import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/config/app";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useTransactions } from "@/hooks/use-transactions";

const typeIcons: Record<string, any> = { income: ArrowDownLeft, expense: ArrowUpRight, transfer: ArrowLeftRight };

export function RecentTransactions() {
  const navigate = useNavigate();
  const { data: transactions = [], isLoading } = useTransactions();
  const recent = transactions.slice(0, 7);

  return (
    <div className="finance-card-static overflow-hidden">
      <div className="p-5 pb-0">
        <SectionHeader title="Recent Transactions" action={<Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground h-8" onClick={() => navigate("/transactions")}>View All →</Button>} />
      </div>
      <div className="mt-4">
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No transactions yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider">Date</TableHead>
                <TableHead className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider">Type</TableHead>
                <TableHead className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider">Category</TableHead>
                <TableHead className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider">Account</TableHead>
                <TableHead className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider text-right">Amount</TableHead>
                <TableHead className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((t: any) => {
                const Icon = typeIcons[t.type] || ArrowUpRight;
                return (
                  <TableRow key={t.id} className="group">
                    <TableCell className="text-xs text-muted-foreground py-3">{t.date}</TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-1.5">
                        <Icon className={cn("h-3.5 w-3.5", t.type === "income" ? "text-positive" : t.type === "expense" ? "text-negative" : "text-primary")} />
                        <span className="text-xs capitalize font-medium">{t.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-medium py-3">{t.category?.name || "Transfer"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground py-3">{t.account?.name || "—"}</TableCell>
                    <TableCell className={cn("text-xs text-right font-semibold tabular-nums py-3", t.type === "income" ? "text-positive" : t.type === "expense" ? "text-negative" : "text-foreground")}>
                      {t.type === "income" ? "+" : t.type === "expense" ? "-" : ""}{formatCurrency(t.amount)}
                    </TableCell>
                    <TableCell className="py-3"><StatusBadge status={t.status} /></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
