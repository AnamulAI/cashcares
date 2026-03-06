import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatAmount, formatAppDate } from "@/lib/formatters";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Pencil, TrendingUp, TrendingDown, ArrowRightLeft } from "lucide-react";
import { useTransactions } from "@/hooks/use-transactions";
import { useAppContext } from "@/contexts/AppContext";
import { useTranslation } from "@/i18n/useTranslation";
import type { DbAccount } from "@/hooks/use-accounts";

interface AccountDetailsProps {
  account: DbAccount | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (account: DbAccount) => void;
}

export function AccountDetails({ account, open, onOpenChange, onEdit }: AccountDetailsProps) {
  const { data: allTxns = [] } = useTransactions();
  const { currency, settings } = useAppContext();
  const { t, lang } = useTranslation();
  const fmt = (n: number) => formatAmount(n, currency, lang);
  const fmtDate = (d: string) => formatAppDate(d, settings.dateFormat, settings.timezone, lang);

  if (!account) return null;

  const transactions = allTxns.filter((t: any) => t.account_id === account.id);
  const transfers = allTxns.filter((t: any) => t.type === "transfer" && (t.account_id === account.id || t.to_account_id === account.id));
  const totalInflow = transactions.filter((t: any) => t.type === "income").reduce((s: number, t: any) => s + Number(t.amount), 0);
  const totalOutflow = transactions.filter((t: any) => t.type === "expense").reduce((s: number, t: any) => s + Number(t.amount), 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-2">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-display text-lg">{account.name}</SheetTitle>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={() => { onEdit?.(account); onOpenChange(false); }}>
              <Pencil className="h-3 w-3" /> {t("action.edit")}
            </Button>
          </div>
        </SheetHeader>

        <div className="rounded-xl bg-accent/60 p-5 mt-2">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{t("accounts.currentBalance")}</p>
          <p className="text-3xl font-bold font-display mt-1 tracking-tight tabular-nums">{fmt(account.balance)}</p>
          <div className="flex gap-2 mt-3">
            {account.is_primary && <Badge className="bg-primary/10 text-primary border-0 text-xs">{t("accounts.primary")}</Badge>}
            <Badge variant="secondary" className={cn("text-xs", account.is_active ? "bg-positive/10 text-positive border-0" : "")}>{account.is_active ? t("status.active") : t("status.inactive")}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="rounded-lg bg-positive/5 p-3 text-center">
            <TrendingUp className="h-4 w-4 text-positive mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">{t("accounts.inflow")}</p>
            <p className="text-sm font-bold font-display text-positive tabular-nums">{fmt(totalInflow)}</p>
          </div>
          <div className="rounded-lg bg-negative/5 p-3 text-center">
            <TrendingDown className="h-4 w-4 text-negative mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">{t("accounts.outflow")}</p>
            <p className="text-sm font-bold font-display text-negative tabular-nums">{fmt(totalOutflow)}</p>
          </div>
          <div className="rounded-lg bg-primary/5 p-3 text-center">
            <ArrowRightLeft className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">{t("accounts.net")}</p>
            <p className="text-sm font-bold font-display tabular-nums">{fmt(totalInflow - totalOutflow)}</p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="mt-5">
          <TabsList className="w-full bg-muted/60 p-1 h-auto">
            <TabsTrigger value="overview" className="flex-1 text-xs py-1.5">{t("accounts.overview")}</TabsTrigger>
            <TabsTrigger value="transactions" className="flex-1 text-xs py-1.5">{t("nav.transactions")}</TabsTrigger>
            <TabsTrigger value="transfers" className="flex-1 text-xs py-1.5">{t("transactions.transfers")}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-3">
            <DetailRow label={t("accounts.accountType")} value={account.type.replace('_', ' ')} />
            <DetailRow label={t("settings.currency")} value={account.currency} />
            <DetailRow label={t("accounts.lastUpdated")} value={fmtDate(account.updated_at)} />
            <DetailRow label={t("accounts.totalTransactions")} value={String(transactions.length)} />
            {account.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">{t("table.note")}</p>
                  <p className="text-sm">{account.notes}</p>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="transactions" className="mt-4">
            {transactions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold h-8">{t("table.date")}</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold h-8">{t("table.category")}</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold h-8 text-right">{t("table.amount")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.slice(0, 10).map((t: any) => (
                    <TableRow key={t.id} className="border-border/40">
                      <TableCell className="text-xs py-2.5">{fmtDate(t.date)}</TableCell>
                      <TableCell className="text-xs py-2.5">{t.category?.name || "Transfer"}</TableCell>
                      <TableCell className={cn("text-xs text-right font-semibold tabular-nums py-2.5", t.type === "income" ? "text-positive" : t.type === "expense" ? "text-negative" : "")}>
                        {t.type === "income" ? "+" : "−"}{fmt(t.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">{t("transactions.noFound")}</p>
            )}
          </TabsContent>

          <TabsContent value="transfers" className="mt-4">
            {transfers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold h-8">{t("table.date")}</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold h-8">{t("accounts.details")}</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold h-8 text-right">{t("table.amount")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.map((t: any) => (
                    <TableRow key={t.id} className="border-border/40">
                      <TableCell className="text-xs py-2.5">{fmtDate(t.date)}</TableCell>
                      <TableCell className="text-xs py-2.5">{t.account?.name} → {t.to_account?.name}</TableCell>
                      <TableCell className="text-xs text-right font-semibold tabular-nums py-2.5">{fmt(t.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">{t("accounts.noTransfers")}</p>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <span className="text-[13px] font-medium capitalize">{value}</span>
    </div>
  );
}
