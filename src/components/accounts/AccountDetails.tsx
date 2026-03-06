import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/config/app";
import type { Account } from "@/types/finance";
import { mockTransactions } from "@/data/mock-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Pencil, TrendingUp, TrendingDown, ArrowRightLeft, BarChart3 } from "lucide-react";

interface AccountDetailsProps {
  account: Account | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountDetails({ account, open, onOpenChange }: AccountDetailsProps) {
  if (!account) return null;
  const transactions = mockTransactions.filter(t => t.accountId === account.id);
  const transfers = mockTransactions.filter(t => t.type === "transfer" && (t.accountId === account.id || t.toAccountId === account.id));
  const totalInflow = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalOutflow = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-2">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-display text-lg">{account.name}</SheetTitle>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
              <Pencil className="h-3 w-3" /> Edit
            </Button>
          </div>
        </SheetHeader>

        {/* Balance hero */}
        <div className="rounded-xl bg-accent/60 p-5 mt-2">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Current Balance</p>
          <p className="text-3xl font-bold font-display mt-1 tracking-tight tabular-nums">{formatCurrency(account.balance)}</p>
          <div className="flex gap-2 mt-3">
            {account.isPrimary && <Badge className="bg-primary/10 text-primary border-0 text-xs">Primary</Badge>}
            <Badge variant="secondary" className={cn("text-xs", account.isActive ? "bg-positive/10 text-positive border-0" : "")}>{account.isActive ? "Active" : "Inactive"}</Badge>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="rounded-lg bg-positive/5 p-3 text-center">
            <TrendingUp className="h-4 w-4 text-positive mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Inflow</p>
            <p className="text-sm font-bold font-display text-positive tabular-nums">{formatCurrency(totalInflow)}</p>
          </div>
          <div className="rounded-lg bg-negative/5 p-3 text-center">
            <TrendingDown className="h-4 w-4 text-negative mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Outflow</p>
            <p className="text-sm font-bold font-display text-negative tabular-nums">{formatCurrency(totalOutflow)}</p>
          </div>
          <div className="rounded-lg bg-primary/5 p-3 text-center">
            <ArrowRightLeft className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Net</p>
            <p className="text-sm font-bold font-display tabular-nums">{formatCurrency(totalInflow - totalOutflow)}</p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="mt-5">
          <TabsList className="w-full bg-muted/60 p-1 h-auto">
            <TabsTrigger value="overview" className="flex-1 text-xs py-1.5">Overview</TabsTrigger>
            <TabsTrigger value="transactions" className="flex-1 text-xs py-1.5">Transactions</TabsTrigger>
            <TabsTrigger value="transfers" className="flex-1 text-xs py-1.5">Transfers</TabsTrigger>
            <TabsTrigger value="analytics" className="flex-1 text-xs py-1.5">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-3">
            <DetailRow label="Account Type" value={account.type.replace('_', ' ')} />
            <DetailRow label="Currency" value={account.currency} />
            <DetailRow label="Last Updated" value={account.lastUpdated} />
            <DetailRow label="Total Transactions" value={String(transactions.length)} />
            {account.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Notes</p>
                  <p className="text-sm">{account.notes}</p>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="transactions" className="mt-4">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-[11px] uppercase tracking-wider font-semibold h-8">Date</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-semibold h-8">Category</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-semibold h-8 text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.slice(0, 8).map(t => (
                  <TableRow key={t.id} className="border-border/40">
                    <TableCell className="text-xs py-2.5">{t.date}</TableCell>
                    <TableCell className="text-xs py-2.5">{t.categoryName}</TableCell>
                    <TableCell className={cn("text-xs text-right font-semibold tabular-nums py-2.5", t.type === "income" ? "text-positive" : t.type === "expense" ? "text-negative" : "")}>
                      {t.type === "income" ? "+" : "−"}{formatCurrency(t.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="transfers" className="mt-4">
            {transfers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold h-8">Date</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold h-8">Details</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold h-8 text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.map(t => (
                    <TableRow key={t.id} className="border-border/40">
                      <TableCell className="text-xs py-2.5">{t.date}</TableCell>
                      <TableCell className="text-xs py-2.5">{t.accountName} → {t.toAccountName}</TableCell>
                      <TableCell className="text-xs text-right font-semibold tabular-nums py-2.5">{formatCurrency(t.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No transfers for this account.</p>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="mt-4">
            <div className="rounded-lg border-2 border-dashed border-border/50 p-8 text-center">
              <BarChart3 className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Account analytics coming soon</p>
              <p className="text-xs text-muted-foreground mt-1">Inflow/outflow charts and top categories</p>
            </div>
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
