import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/config/app";
import type { Account } from "@/types/finance";
import { mockTransactions } from "@/data/mock-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface AccountDetailsProps {
  account: Account | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountDetails({ account, open, onOpenChange }: AccountDetailsProps) {
  if (!account) return null;
  const transactions = mockTransactions.filter(t => t.accountId === account.id).slice(0, 5);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display">{account.name}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          <div className="rounded-xl bg-accent p-4">
            <p className="text-sm text-muted-foreground">Current Balance</p>
            <p className="text-3xl font-bold font-display mt-1">{formatCurrency(account.balance)}</p>
            <div className="flex gap-2 mt-2">
              {account.isPrimary && <Badge className="bg-primary/10 text-primary border-0 text-xs">Primary</Badge>}
              <Badge variant="secondary" className="text-xs">{account.isActive ? "Active" : "Inactive"}</Badge>
            </div>
          </div>

          <Tabs defaultValue="transactions">
            <TabsList className="w-full">
              <TabsTrigger value="transactions" className="flex-1">Transactions</TabsTrigger>
              <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
              <TabsTrigger value="notes" className="flex-1">Notes</TabsTrigger>
            </TabsList>
            <TabsContent value="transactions" className="mt-3">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Category</TableHead>
                    <TableHead className="text-xs text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map(t => (
                    <TableRow key={t.id}>
                      <TableCell className="text-xs">{t.date}</TableCell>
                      <TableCell className="text-xs">{t.categoryName}</TableCell>
                      <TableCell className={cn("text-xs text-right font-medium", t.type === "income" ? "text-positive" : t.type === "expense" ? "text-negative" : "")}>
                        {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="overview" className="mt-3 text-sm text-muted-foreground">
              <div className="space-y-2">
                <div className="flex justify-between"><span>Type</span><span className="font-medium text-foreground capitalize">{account.type.replace('_', ' ')}</span></div>
                <div className="flex justify-between"><span>Currency</span><span className="font-medium text-foreground">{account.currency}</span></div>
                <div className="flex justify-between"><span>Last Updated</span><span className="font-medium text-foreground">{account.lastUpdated}</span></div>
              </div>
            </TabsContent>
            <TabsContent value="notes" className="mt-3 text-sm text-muted-foreground">
              {account.notes || "No notes added."}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
