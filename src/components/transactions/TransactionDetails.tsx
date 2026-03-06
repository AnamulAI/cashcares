import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency } from "@/config/app";
import { cn } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Pencil, Paperclip, Tag } from "lucide-react";

const typeIcons: Record<string, any> = { income: ArrowDownLeft, expense: ArrowUpRight, transfer: ArrowLeftRight };
const typeColors: Record<string, string> = {
  income: "text-positive bg-positive/10",
  expense: "text-negative bg-negative/10",
  transfer: "text-primary bg-primary/10",
};

interface TransactionDetailsProps {
  transaction: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactionDetails({ transaction, open, onOpenChange }: TransactionDetailsProps) {
  if (!transaction) return null;
  const Icon = typeIcons[transaction.type] || ArrowUpRight;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-display text-lg">Transaction Details</SheetTitle>
          </div>
        </SheetHeader>

        <div className="rounded-xl bg-accent/60 p-5 text-center">
          <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center mx-auto mb-3", typeColors[transaction.type] || "")}>
            <Icon className="h-5 w-5" />
          </div>
          <p className={cn("text-3xl font-bold font-display tracking-tight", transaction.type === "income" && "text-positive", transaction.type === "expense" && "text-negative")}>
            {transaction.type === "income" ? "+" : transaction.type === "expense" ? "−" : ""}{formatCurrency(transaction.amount)}
          </p>
          <p className="text-sm text-muted-foreground mt-1 capitalize">{transaction.type}</p>
        </div>

        <div className="mt-5 space-y-4">
          <div className="space-y-3">
            <DetailRow label="Date" value={transaction.date} />
            <DetailRow label="Category" value={transaction.category?.name || "—"} />
            <DetailRow label="Account" value={transaction.account?.name || "—"} />
            {transaction.to_account?.name && <DetailRow label="To Account" value={transaction.to_account.name} />}
            <DetailRow label="Status"><StatusBadge status={transaction.status} /></DetailRow>
          </div>

          {transaction.note && (
            <>
              <Separator />
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">Note</p>
                <p className="text-sm text-foreground">{transaction.note}</p>
              </div>
            </>
          )}

          {transaction.tags && transaction.tags.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {transaction.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs gap-1"><Tag className="h-3 w-3" /> {tag}</Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Attachments</p>
            <div className="rounded-lg border-2 border-dashed border-border/60 p-6 text-center">
              <Paperclip className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No attachments yet</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DetailRow({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      {children || <span className="text-[13px] font-medium text-foreground">{value}</span>}
    </div>
  );
}
