import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, HeartHandshake, Pencil, Trash2, MoreHorizontal, CheckCircle2, AlertTriangle, Calendar, Download, Printer } from "lucide-react";
import { PrintStatementHeader, PrintStatementFooter } from "@/components/shared/PrintStatementHeader";
import { PageHeader } from "@/components/shared/PageHeader";
import { FinanceCard } from "@/components/shared/FinanceCard";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EntryAttachments } from "@/components/ledger/EntryAttachments";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useMohoranaRecord, useDeleteMohoranaRecord } from "@/hooks/use-mohorana";
import { useMohoranaPayments, useDeleteMohoranaPayment, MohoranaPayment } from "@/hooks/use-mohorana-payments";
import { useAccounts } from "@/hooks/use-accounts";
import { AddMohoranaModal } from "@/components/mohorana/AddMohoranaModal";
import { AddPaymentModal } from "@/components/mohorana/AddPaymentModal";
import { useAppContext, CURRENCIES } from "@/contexts/AppContext";
import { useTranslation } from "@/i18n/useTranslation";
import { formatAmount, formatAppDate } from "@/lib/formatters";

const statusBadge: Record<string, string> = {
  active: "bg-primary/10 text-primary",
  completed: "bg-positive/10 text-positive",
  archived: "bg-muted text-muted-foreground",
};

export default function MohoranaLedger() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { settings, currency } = useAppContext();
  const { t, lang } = useTranslation();
  const { data: record, isLoading } = useMohoranaRecord(id);
  const { data: payments = [] } = useMohoranaPayments(id);
  const { data: accounts = [] } = useAccounts();
  const deleteRecordMut = useDeleteMohoranaRecord();
  const deletePaymentMut = useDeleteMohoranaPayment();

  const [editOpen, setEditOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<MohoranaPayment | null>(null);
  const [deletePaymentId, setDeletePaymentId] = useState<string | null>(null);
  const [deleteRecordOpen, setDeleteRecordOpen] = useState(false);

  const accountMap = useMemo(() => Object.fromEntries(accounts.map(a => [a.id, a.name])), [accounts]);

  const recordCurrency = useMemo(() => {
    if (!record) return currency;
    return CURRENCIES.find(c => c.code === record.currency) || currency;
  }, [record, currency]);

  const totals = useMemo(() => {
    const paid = payments.reduce((s, p) => s + Number(p.amount), 0);
    const muajjalPaid = payments.filter(p => p.payment_type === "muajjal").reduce((s, p) => s + Number(p.amount), 0);
    const muakhkharPaid = payments.filter(p => p.payment_type === "muakhkhar").reduce((s, p) => s + Number(p.amount), 0);
    return { paid, muajjalPaid, muakhkharPaid };
  }, [payments]);

  const fmt = (n: number) => formatAmount(n, recordCurrency, lang);
  const fmtDate = (d: string) => formatAppDate(d, settings.dateFormat, settings.timezone, lang);

  if (isLoading) return <div className="space-y-4 p-6"><Skeleton className="h-8 w-64" /><Skeleton className="h-20" /></div>;
  if (!record) return (
    <div className="p-6">
      <p className="text-muted-foreground">Record not found.</p>
      <Button variant="link" onClick={() => navigate("/mohorana")}>← Back</Button>
    </div>
  );

  const total = Number(record.total_amount);
  const remaining = Math.max(0, total - totals.paid);
  const pct = total > 0 ? Math.min(100, (totals.paid / total) * 100) : 0;

  const openEditPayment = (p?: MohoranaPayment) => { setEditingPayment(p || null); setPayOpen(true); };

  const handlePrint = () => window.print();
  const handleCSV = () => {
    const headers = ["Date", "Payment Type", "Account", "Note", "Amount"];
    const rows = payments.map(p => [
      p.paid_on,
      p.payment_type,
      (p.account_id && accountMap[p.account_id]) || "",
      (p.note || "").replace(/[\r\n,]+/g, " "),
      Number(p.amount),
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mohorana-${record.spouse_name || "ledger"}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PrintStatementHeader
        documentTitle="Mohorana Ledger Statement"
        subjectId={record.id}
        subjectIdLabel="Record ID"
        detailsTitle="Mohorana Details"
        scheduleTitle="Payment History"
        details={[
          { label: "Spouse", value: record.spouse_name },
          { label: "Status", value: record.status || "active" },
          ...(record.marriage_date ? [{ label: "Marriage Date", value: fmtDate(record.marriage_date) }] : []),
          { label: "Muajjal", value: fmt(Number(record.muajjal_amount)) },
          { label: "Muakhkhar", value: fmt(Number(record.muakhkhar_amount)) },
          { label: "Total Payments", value: String(payments.length) },
          ...(record.note ? [{ label: "Note", value: record.note, fullWidth: true }] : []),
        ]}
        summary={[
          { label: "Total Mohorana", value: fmt(total) },
          { label: "Total Paid", value: fmt(totals.paid) },
          { label: "Remaining", value: fmt(remaining) },
          { label: "Progress", value: `${Math.round(pct)}%` },
        ]}
      />

      <div className="flex items-center gap-2 no-print">
        <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate("/mohorana")}>
          <ArrowLeft className="h-4 w-4" /> {t("action.back", "Back")}
        </Button>
      </div>


      <div className="no-print">
      <PageHeader
        title={record.spouse_name}
        subtitle={record.marriage_date ? `${t("mohorana.marriedOn")} ${fmtDate(record.marriage_date)}` : t("mohorana.subtitle")}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={`text-[11px] capitalize ${statusBadge[record.status] || ""}`}>
              {t(`mohorana.status${record.status.charAt(0).toUpperCase() + record.status.slice(1)}`, record.status)}
            </Badge>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" /> {t("action.edit")}
            </Button>
            <Button size="sm" className="gap-1.5 shadow-sm" onClick={() => openEditPayment()}>
              <Plus className="h-4 w-4" /> {t("mohorana.addPayment")}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button size="sm" variant="outline"><Download className="h-4 w-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handlePrint}><Printer className="h-3.5 w-3.5 mr-2" /> Print</DropdownMenuItem>
                <DropdownMenuItem onClick={handlePrint}><Download className="h-3.5 w-3.5 mr-2" /> PDF (Print)</DropdownMenuItem>
                <DropdownMenuItem onClick={handleCSV}><Download className="h-3.5 w-3.5 mr-2" /> CSV</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="outline" size="icon" className="h-9 w-9"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="text-destructive" onClick={() => setDeleteRecordOpen(true)}>
                  <Trash2 className="h-3.5 w-3.5 mr-2" /> {t("action.delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />
      </div>


      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <FinanceCard icon={<HeartHandshake className="h-5 w-5 text-feature-receivables" />} iconBg="bg-feature-receivables/10" label={t("mohorana.total")} value={fmt(total)} />
        <FinanceCard icon={<CheckCircle2 className="h-5 w-5 text-positive" />} iconBg="bg-positive/10" label={t("mohorana.paid")} value={fmt(totals.paid)} />
        <FinanceCard icon={<AlertTriangle className="h-5 w-5 text-negative" />} iconBg="bg-negative/10" label={t("mohorana.remaining")} value={fmt(remaining)} />
        <FinanceCard icon={<Calendar className="h-5 w-5 text-feature-receivables" />} iconBg="bg-feature-receivables/10" label={t("mohorana.progress")} value={`${Math.round(pct)}%`} />
      </div>

      <Card className="finance-card-static p-4">
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">{t("mohorana.progress")}</span>
              <span className="font-medium">{fmt(totals.paid)} / {fmt(total)}</span>
            </div>
            <Progress value={pct} className="h-2" />
          </div>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="rounded-lg border p-3">
              <p className="text-xs font-semibold">{t("mohorana.muajjal")}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{t("mohorana.total")}: {fmt(Number(record.muajjal_amount))}</p>
              <p className="text-[11px] text-positive">{t("mohorana.paid")}: {fmt(totals.muajjalPaid)}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs font-semibold">{t("mohorana.muakhkhar")}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{t("mohorana.total")}: {fmt(Number(record.muakhkhar_amount))}</p>
              <p className="text-[11px] text-positive">{t("mohorana.paid")}: {fmt(totals.muakhkharPaid)}</p>
            </div>
          </div>
          {record.note && (
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{t("mohorana.note")}</p>
              <p className="text-xs mt-1 whitespace-pre-wrap">{record.note}</p>
            </div>
          )}
        </div>
      </Card>

      <Card className="finance-card-static p-4">
        <h3 className="text-sm font-semibold mb-3">{t("ledger.attachments", "Attachments")}</h3>
        <EntryAttachments entryId={record.id} entryType="mohorana_record" />
      </Card>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{t("mohorana.paymentHistory")}</h3>
      </div>

      {payments.length === 0 ? (
        <Card className="finance-card-static p-8 text-center">
          <p className="text-muted-foreground text-sm">{t("mohorana.noPayments")}</p>
          <Button size="sm" className="mt-3" onClick={() => openEditPayment()}>
            <Plus className="h-4 w-4 mr-1" /> {t("mohorana.addPayment")}
          </Button>
        </Card>
      ) : (
        <Card className="finance-card-static overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">{t("table.date")}</TableHead>
                <TableHead className="text-xs">{t("mohorana.paymentType")}</TableHead>
                <TableHead className="text-xs">{t("mohorana.accountRef")}</TableHead>
                <TableHead className="text-xs">{t("mohorana.note")}</TableHead>
                <TableHead className="text-xs text-right">{t("table.amount")}</TableHead>
                <TableHead className="text-xs text-right">{t("table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map(p => (
                <TableRow key={p.id} className="hover:bg-accent/40 transition-colors">
                  <TableCell className="text-xs">{fmtDate(p.paid_on)}</TableCell>
                  <TableCell className="text-xs">
                    <Badge variant="secondary" className="text-[10px] capitalize">
                      {t(`mohorana.${p.payment_type}`, p.payment_type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{p.account_id && accountMap[p.account_id] ? accountMap[p.account_id] : "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[240px] truncate">{p.note || "—"}</TableCell>
                  <TableCell className="text-xs text-right font-semibold text-positive">{fmt(Number(p.amount))}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-3.5 w-3.5" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditPayment(p)}>
                          <Pencil className="h-3.5 w-3.5 mr-2" /> {t("action.edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => setDeletePaymentId(p.id)}>
                          <Trash2 className="h-3.5 w-3.5 mr-2" /> {t("action.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <AddMohoranaModal open={editOpen} onOpenChange={setEditOpen} editing={record} />
      <AddPaymentModal open={payOpen} onOpenChange={(o) => { setPayOpen(o); if (!o) setEditingPayment(null); }} recordId={record.id} editing={editingPayment} />

      <ConfirmDialog
        open={!!deletePaymentId}
        onOpenChange={() => setDeletePaymentId(null)}
        title={t("mohorana.deletePaymentTitle")}
        description={t("mohorana.deletePaymentDesc")}
        onConfirm={() => { if (deletePaymentId) deletePaymentMut.mutate(deletePaymentId); setDeletePaymentId(null); }}
      />
      <ConfirmDialog
        open={deleteRecordOpen}
        onOpenChange={setDeleteRecordOpen}
        title={t("mohorana.deleteTitle")}
        description={t("mohorana.deleteDesc")}
        onConfirm={() => { if (record) deleteRecordMut.mutate(record.id, { onSuccess: () => navigate("/mohorana") }); }}
      />
      <PrintStatementFooter />
    </div>
  );
}
