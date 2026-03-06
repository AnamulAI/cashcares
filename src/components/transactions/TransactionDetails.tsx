import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatAmount, formatAppDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Paperclip, Tag, Copy, Trash2, Pencil } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAppContext } from "@/contexts/AppContext";
import { useTranslation } from "@/i18n/useTranslation";
import { useDeleteTransaction, useCreateTransaction } from "@/hooks/use-transactions";
import { toast } from "sonner";

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
  const { currency, settings } = useAppContext();
  const { t, lang } = useTranslation();
  const fmt = (n: number) => formatAmount(n, currency, lang);
  const fmtDate = (d: string) => formatAppDate(d, settings.dateFormat, settings.timezone, lang);
  const deleteTxn = useDeleteTransaction();
  const createTxn = useCreateTransaction();

  if (!transaction) return null;
  const Icon = typeIcons[transaction.type] || ArrowUpRight;

  const handleDuplicate = async () => {
    await createTxn.mutateAsync({
      type: transaction.type,
      category_id: transaction.category_id || null,
      account_id: transaction.account_id,
      to_account_id: transaction.to_account_id || null,
      amount: Number(transaction.amount),
      date: new Date().toISOString().split("T")[0],
      note: transaction.note ? `${transaction.note} (copy)` : null,
      tags: transaction.tags || null,
      status: "completed",
      transfer_fee: transaction.transfer_fee ? Number(transaction.transfer_fee) : 0,
    });
    toast.success(t("transactions.duplicated"));
    onOpenChange(false);
  };

  const handleDelete = () => {
    deleteTxn.mutate({
      id: transaction.id,
      type: transaction.type,
      amount: Number(transaction.amount),
      account_id: transaction.account_id,
      to_account_id: transaction.to_account_id,
      transfer_fee: transaction.transfer_fee ? Number(transaction.transfer_fee) : null,
      category_id: transaction.category_id,
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-display text-lg">{t("transactions.details")}</SheetTitle>
          </div>
        </SheetHeader>

        <div className="rounded-xl bg-accent/60 p-5 text-center">
          <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center mx-auto mb-3", typeColors[transaction.type] || "")}>
            <Icon className="h-5 w-5" />
          </div>
          <p className={cn("text-3xl font-bold font-display tracking-tight", transaction.type === "income" && "text-positive", transaction.type === "expense" && "text-negative")}>
            {transaction.type === "income" ? "+" : transaction.type === "expense" ? "−" : ""}{fmt(transaction.amount)}
          </p>
          <p className="text-sm text-muted-foreground mt-1 capitalize">{t(`transactions.${transaction.type}`)}</p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-4">
          <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs h-8" onClick={handleDuplicate} disabled={createTxn.isPending}>
            <Copy className="h-3.5 w-3.5" /> {t("action.duplicate")}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs h-8 border-destructive/30 text-destructive hover:bg-destructive/5">
                <Trash2 className="h-3.5 w-3.5" /> {t("action.delete")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("confirm.deleteTransaction")}</AlertDialogTitle>
                <AlertDialogDescription>{t("confirm.deleteTransactionDesc")}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("action.cancel")}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t("action.delete")}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="mt-5 space-y-4">
          <div className="space-y-3">
            <DetailRow label={t("table.date")} value={fmtDate(transaction.date)} />
            <DetailRow label={t("table.category")} value={transaction.category?.name || "—"} />
            <DetailRow label={t("table.account")} value={transaction.account?.name || "—"} />
            {transaction.to_account?.name && <DetailRow label={t("accounts.toAccount")} value={transaction.to_account.name} />}
            {transaction.transfer_fee > 0 && <DetailRow label={t("transactions.transferFee")} value={fmt(transaction.transfer_fee)} />}
            <DetailRow label={t("table.status")}><StatusBadge status={transaction.status} /></DetailRow>
          </div>

          {transaction.note && (
            <>
              <Separator />
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">{t("table.note")}</p>
                <p className="text-sm text-foreground">{transaction.note}</p>
              </div>
            </>
          )}

          {transaction.tags && transaction.tags.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">{t("transactions.tags")}</p>
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
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">{t("transactions.attachments")}</p>
            <div className="rounded-lg border-2 border-dashed border-border/60 p-6 text-center">
              <Paperclip className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">{t("transactions.noAttachments")}</p>
            </div>
          </div>

          <Separator />
          <div className="text-[11px] text-muted-foreground space-y-1">
            <p>{t("transactions.createdAt")}: {fmtDate(transaction.created_at)}</p>
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
