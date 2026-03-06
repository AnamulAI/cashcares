import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { useCollectionHistory } from "@/hooks/use-payment-history";
import { History } from "lucide-react";

interface Props {
  entry: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formatAmount: (n: number) => string;
  formatDate: (d: string) => string;
}

const statusColors: Record<string, string> = {
  open: "bg-primary/10 text-primary",
  partial: "bg-warning/10 text-warning",
  collected: "bg-positive/10 text-positive",
  overdue: "bg-negative/10 text-negative",
};

export function ReceivableEntryDetailModal({ entry, open, onOpenChange, formatAmount, formatDate }: Props) {
  const { data: history = [], isLoading } = useCollectionHistory(open ? entry?.id : undefined);
  if (!entry) return null;

  const balance = Number(entry.amount) - Number(entry.collected_amount);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Entry Details</DialogTitle>
          <DialogDescription>{entry.description || "Receivable entry"}</DialogDescription>
        </DialogHeader>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div><span className="text-muted-foreground">Date:</span> <span className="font-medium">{formatDate(entry.date)}</span></div>
          <div><span className="text-muted-foreground">Due:</span> <span className="font-medium">{entry.due_date ? formatDate(entry.due_date) : "—"}</span></div>
          <div><span className="text-muted-foreground">Amount:</span> <span className="font-semibold">{formatAmount(Number(entry.amount))}</span></div>
          <div><span className="text-muted-foreground">Collected:</span> <span className="font-semibold text-positive">{formatAmount(Number(entry.collected_amount))}</span></div>
          <div><span className="text-muted-foreground">Balance:</span> <span className="font-semibold">{formatAmount(balance)}</span></div>
          <div><span className="text-muted-foreground">Status:</span> <Badge variant="secondary" className={`text-[10px] capitalize ml-1 ${statusColors[entry.status] || ""}`}>{entry.status}</Badge></div>
          {entry.category && <div><span className="text-muted-foreground">Category:</span> <span>{entry.category}</span></div>}
          {entry.linked_account?.name && <div><span className="text-muted-foreground">Account:</span> <span>{entry.linked_account.name}</span></div>}
          {entry.note && <div className="col-span-2"><span className="text-muted-foreground">Note:</span> <span>{entry.note}</span></div>}
        </div>

        {/* Collection History */}
        <div className="mt-4">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
            <History className="h-4 w-4 text-muted-foreground" /> Collection History
          </h4>
          {isLoading ? (
            <div className="space-y-2"><Skeleton className="h-8" /><Skeleton className="h-8" /></div>
          ) : history.length === 0 ? (
            <EmptyState title="No collection history yet" className="py-6" />
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs text-right">Amount</TableHead>
                    <TableHead className="text-xs">Account</TableHead>
                    <TableHead className="text-xs">Note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map(h => (
                    <TableRow key={h.id}>
                      <TableCell className="text-xs">{formatDate(h.date)}</TableCell>
                      <TableCell className="text-xs text-right font-medium text-positive">{formatAmount(Number(h.amount))}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{h.account?.name || "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{h.note || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {history.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1.5">{history.length} collection{history.length > 1 ? "s" : ""} recorded</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
