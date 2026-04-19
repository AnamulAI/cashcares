import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, HandCoins, CreditCard } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/contexts/AppContext";
import { useTranslation } from "@/i18n/useTranslation";
import { formatAmount, formatAppDateAuto } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useTransactions } from "@/hooks/use-transactions";
import { useAllPayableEntries } from "@/hooks/use-payable-entries";
import { useAllReceivableEntries } from "@/hooks/use-receivable-entries";
import { useMemo } from "react";

interface ActivityItem {
  id: string;
  date: string;
  type: "income" | "expense" | "transfer" | "payable" | "receivable";
  label: string;
  category: string;
  account: string;
  amount: number;
  status: string;
}

export function RecentTransactions() {
  const navigate = useNavigate();
  const { data: transactions = [], isLoading } = useTransactions();
  const { data: payableEntries = [] } = useAllPayableEntries();
  const { data: receivableEntries = [] } = useAllReceivableEntries();
  const { currency, settings } = useAppContext();
  const { t, lang } = useTranslation();

  const fmt = (n: number) => formatAmount(n, currency, lang);
  const fmtDate = (d: string) => formatAppDateAuto(d, { dateFormat: settings.dateFormat, timezone: settings.timezone, lang, relative: settings.relativeTime });

  const recentActivity: ActivityItem[] = useMemo(() => {
    const items: ActivityItem[] = [];

    // Regular transactions
    (transactions as any[]).forEach(txn => {
      items.push({
        id: txn.id,
        date: txn.date,
        type: txn.type,
        label: txn.type === "transfer" ? "Transfer" : txn.type,
        category: txn.category?.name || (txn.type === "transfer" ? "Transfer" : "—"),
        account: txn.account?.name || "—",
        amount: Number(txn.amount),
        status: txn.status,
      });
    });

    // Payable entries
    (payableEntries as any[]).forEach(pe => {
      items.push({
        id: `pe-${pe.id}`,
        date: pe.date,
        type: "payable",
        label: "Payable",
        category: pe.category || pe.description || "Payable Entry",
        account: pe.linked_account?.name || "—",
        amount: Number(pe.amount),
        status: pe.status,
      });
    });

    // Receivable entries
    (receivableEntries as any[]).forEach(re => {
      items.push({
        id: `re-${re.id}`,
        date: re.date,
        type: "receivable",
        label: "Receivable",
        category: re.category || re.description || "Receivable Entry",
        account: re.linked_account?.name || "—",
        amount: Number(re.amount),
        status: re.status,
      });
    });

    // Sort by date descending
    items.sort((a, b) => b.date.localeCompare(a.date));
    return items.slice(0, 10);
  }, [transactions, payableEntries, receivableEntries]);

  const typeIcons: Record<string, any> = {
    income: ArrowDownLeft,
    expense: ArrowUpRight,
    transfer: ArrowLeftRight,
    payable: CreditCard,
    receivable: HandCoins,
  };

  const typeColors: Record<string, string> = {
    income: "text-positive",
    expense: "text-negative",
    transfer: "text-primary",
    payable: "text-feature-payables",
    receivable: "text-feature-receivables",
  };

  const amountPrefix: Record<string, string> = {
    income: "+",
    expense: "-",
    transfer: "",
    payable: "-",
    receivable: "+",
  };

  return (
    <div className="finance-card-static finance-card-hover overflow-hidden">
      <div className="p-5 pb-0">
        <SectionHeader title={t("dashboard.recentTransactions")} action={<Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground h-8" onClick={() => navigate("/transactions")}>{t("action.viewAll")} →</Button>} />
      </div>
      <div className="mt-4">
        {recentActivity.length === 0 ? (
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
              {recentActivity.map((item) => {
                const Icon = typeIcons[item.type] || ArrowUpRight;
                const color = typeColors[item.type] || "text-foreground";
                const prefix = amountPrefix[item.type] || "";
                return (
                  <TableRow key={item.id} className="group">
                    <TableCell className="text-xs text-muted-foreground py-3">{fmtDate(item.date)}</TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-1.5">
                        <Icon className={cn("h-3.5 w-3.5", color)} />
                        <span className="text-xs capitalize font-medium">{item.label}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-medium py-3">{item.category}</TableCell>
                    <TableCell className="text-xs text-muted-foreground py-3">{item.account}</TableCell>
                    <TableCell className={cn("text-xs text-right font-semibold tabular-nums py-3", color)}>
                      {prefix}{fmt(item.amount)}
                    </TableCell>
                    <TableCell className="py-3"><StatusBadge status={item.status} /></TableCell>
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
