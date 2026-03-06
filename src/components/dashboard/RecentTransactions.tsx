import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Button } from "@/components/ui/button";
import { mockTransactions } from "@/data/mock-data";
import { formatCurrency } from "@/config/app";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const typeIcons = {
  income: ArrowDownLeft,
  expense: ArrowUpRight,
  transfer: ArrowLeftRight,
};

export function RecentTransactions() {
  const navigate = useNavigate();
  const recent = mockTransactions.slice(0, 7);

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="p-5 pb-0">
        <SectionHeader
          title="Recent Transactions"
          action={<Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/transactions")}>View All</Button>}
        />
      </div>
      <div className="mt-3">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Date</TableHead>
              <TableHead className="text-xs">Type</TableHead>
              <TableHead className="text-xs">Category</TableHead>
              <TableHead className="text-xs">Account</TableHead>
              <TableHead className="text-xs text-right">Amount</TableHead>
              <TableHead className="text-xs">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recent.map((t) => {
              const Icon = typeIcons[t.type];
              return (
                <TableRow key={t.id}>
                  <TableCell className="text-xs text-muted-foreground">{t.date}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Icon className={cn("h-3.5 w-3.5", t.type === "income" ? "text-positive" : t.type === "expense" ? "text-negative" : "text-primary")} />
                      <span className="text-xs capitalize">{t.type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">{t.categoryName}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{t.accountName}</TableCell>
                  <TableCell className={cn("text-xs text-right font-medium", t.type === "income" ? "text-positive" : t.type === "expense" ? "text-negative" : "")}>
                    {t.type === "income" ? "+" : t.type === "expense" ? "-" : ""}{formatCurrency(t.amount)}
                  </TableCell>
                  <TableCell><StatusBadge status={t.status} /></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
