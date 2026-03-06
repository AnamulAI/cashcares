import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/contexts/AppContext";
import { useTranslation } from "@/i18n/useTranslation";
import { formatAmount, formatAppDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useTransactions } from "@/hooks/use-transactions";

const typeIcons: Record<string, any> = { income: ArrowDownLeft, expense: ArrowUpRight, transfer: ArrowLeftRight };

export function RecentTransactions() {
  const navigate = useNavigate();
  const { data: transactions = [], isLoading } = useTransactions();
  const { currency, settings } = useAppContext();
  const { t } = useTranslation();
  const recent = transactions.slice(0, 7);

  const fmt = (n: number) => formatAmount(n, currency);
  const fmtDate = (d: string) => formatAppDate(d, settings.dateFormat, settings.timezone);

  return (
    <div className="finance-card-static overflow-hidden">
      <div className="p-5 pb-0">
        <SectionHeader title={t("dashboard.recentTransactions")} action={<Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground h-8" onClick={() => navigate("/transactions")}>{t("action.viewAll")} →</Button>} />
      </div>
      <div className="mt-4">
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">{t("transactions.noFound")}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider">{t("table.date")}</TableHead>
                <TableHead className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider">{t("table.type")}</TableHead>
                <TableHead className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider">{t("table.category")}</TableHead>
                <TableHead className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider">{t("table.account")}</TableHead>
                <TableHead className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider text-right">{t("table.amount")}</TableHead>
                <TableHead className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider">{t("table.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((txn: any) => {
                const Icon = typeIcons[txn.type] || ArrowUpRight;
                return (
                  <TableRow key={txn.id} className="group">
                    <TableCell className="text-xs text-muted-foreground py-3">{fmtDate(txn.date)}</TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-1.5">
                        <Icon className={cn("h-3.5 w-3.5", txn.type === "income" ? "text-positive" : txn.type === "expense" ? "text-negative" : "text-primary")} />
                        <span className="text-xs capitalize font-medium">{txn.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-medium py-3">{txn.category?.name || "Transfer"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground py-3">{txn.account?.name || "—"}</TableCell>
                    <TableCell className={cn("text-xs text-right font-semibold tabular-nums py-3", txn.type === "income" ? "text-positive" : txn.type === "expense" ? "text-negative" : "text-foreground")}>
                      {txn.type === "income" ? "+" : txn.type === "expense" ? "-" : ""}{fmt(txn.amount)}
                    </TableCell>
                    <TableCell className="py-3"><StatusBadge status={txn.status} /></TableCell>
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
