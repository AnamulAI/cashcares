import { ArrowRightLeft, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMoveBook } from "@/hooks/use-move-book";

interface MoveBookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookId: string;
  personName: string;
  direction: "receivable-to-payable" | "payable-to-receivable";
  entryCount: number;
}

export function MoveBookModal({ open, onOpenChange, bookId, personName, direction, entryCount }: MoveBookModalProps) {
  const moveMut = useMoveBook();
  const from = direction === "receivable-to-payable" ? "Receivables" : "Payables";
  const to = direction === "receivable-to-payable" ? "Payables" : "Receivables";

  const handleConfirm = () => {
    moveMut.mutate({ bookId, direction }, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-primary" />
            Move to {to}
          </DialogTitle>
          <DialogDescription>This action will transfer the book and all related data.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Person</span>
              <span className="font-semibold">{personName}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">From</span>
              <span className="font-medium text-destructive">{from}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">To</span>
              <span className="font-medium text-positive">{to}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Entries</span>
              <span>{entryCount} entries will be moved</span>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-3">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              All entries and settlement history will be preserved and transferred. This action cannot be undone.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={moveMut.isPending}>Cancel</Button>
          <Button size="sm" onClick={handleConfirm} disabled={moveMut.isPending}>
            {moveMut.isPending ? "Moving..." : "Confirm Move"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
