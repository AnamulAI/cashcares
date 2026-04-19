import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { EntryAttachments } from "@/components/ledger/EntryAttachments";
import { formatAmount, formatAppDate } from "@/lib/formatters";
import { useAppContext } from "@/contexts/AppContext";
import { useTranslation } from "@/i18n/useTranslation";
import { useAccounts } from "@/hooks/use-accounts";
import type { SavingsInstallment } from "@/hooks/use-savings";

interface Props {
  installment: SavingsInstallment | null;
  index: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusColors: Record<string, string> = {
  paid: "bg-positive/10 text-positive",
  pending: "bg-muted text-muted-foreground",
  overdue: "bg-negative/10 text-negative",
};

export function SavingsInstallmentDetailModal({ installment, index, open, onOpenChange }: Props) {
  const { currency, settings } = useAppContext();
  const { lang } = useTranslation();
  const { data: accounts = [] } = useAccounts();

  if (!installment) return null;

  const fmt = (n: number) => formatAmount(n, currency, lang);
  const fmtDate = (d: string | null | undefined) =>
    d ? formatAppDate(d, settings.dateFormat, settings.timezone, lang) : "—";
  const accountName = installment.linked_account_id
    ? (accounts.find(a => a.id === installment.linked_account_id)?.name || "—")
    : "—";

  const balance = Number(installment.amount) - Number(installment.paid_amount);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Installment #{index + 1}</DialogTitle>
          <DialogDescription>
            Due {fmtDate(installment.due_date)}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div><span className="text-muted-foreground">Due Date:</span> <span className="font-medium">{fmtDate(installment.due_date)}</span></div>
          <div>
            <span className="text-muted-foreground">Status:</span>{" "}
            <Badge variant="secondary" className={`text-[10px] capitalize ml-1 ${statusColors[installment.status] || ""}`}>
              {installment.status}
            </Badge>
          </div>
          <div><span className="text-muted-foreground">Scheduled:</span> <span className="font-semibold">{fmt(Number(installment.amount))}</span></div>
          <div><span className="text-muted-foreground">Paid:</span> <span className="font-semibold text-positive">{fmt(Number(installment.paid_amount))}</span></div>
          <div><span className="text-muted-foreground">Balance:</span> <span className="font-semibold">{fmt(balance > 0 ? balance : 0)}</span></div>
          <div><span className="text-muted-foreground">Paid Date:</span> <span>{fmtDate(installment.paid_date)}</span></div>
          <div className="col-span-2"><span className="text-muted-foreground">Account:</span> <span>{accountName}</span></div>
          {installment.note && (
            <div className="col-span-2"><span className="text-muted-foreground">Note:</span> <span>{installment.note}</span></div>
          )}
        </div>

        <div className="mt-4">
          <EntryAttachments entryId={installment.id} entryType="savings_installment" readOnly />
        </div>
      </DialogContent>
    </Dialog>
  );
}
