import { format } from "date-fns";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { useAuth } from "@/contexts/AuthContext";
import { useAppContext } from "@/contexts/AppContext";
import { formatAppDate } from "@/lib/formatters";
import { APP_CONFIG } from "@/config/app";

export interface PrintKV {
  label: string;
  value: React.ReactNode;
  fullWidth?: boolean;
}

export interface PrintSummaryColumn {
  label: string;
  value: React.ReactNode;
}

interface PrintStatementHeaderProps {
  /** Document type, e.g. "Payable Ledger Statement" */
  documentTitle: string;
  /** Subject identifier shown in holder strip, e.g. book.id */
  subjectId: string;
  /** Subject ID label (default: "Statement ID") */
  subjectIdLabel?: string;
  /** Optional reporting period start; defaults to "—" */
  periodStart?: string | null;
  /** Optional reporting period end; defaults to today */
  periodEnd?: string | null;
  /** Subject details key/value list (Plan/Book/Partnership info) */
  details: PrintKV[];
  /** Section heading for the details block (default: "Statement Details") */
  detailsTitle?: string;
  /** Financial summary columns rendered as a single-row bordered table */
  summary?: PrintSummaryColumn[];
  /** Optional caption rendered below the summary table (counts strip etc.) */
  summaryCaption?: React.ReactNode;
  /** Section heading for the table that follows in the page (default: "Transaction History") */
  scheduleTitle?: string;
}

/**
 * Industry-grade print-only statement header.
 * Used by all ledger detail pages (Savings, Payable, Receivable, Partnership)
 * to deliver a consistent bank-statement style print/PDF output.
 *
 * Layout: Brand bar → Holder strip → Details → Financial Summary → Schedule heading.
 * The page's existing on-screen table prints below this header automatically.
 */
export function PrintStatementHeader({
  documentTitle,
  subjectId,
  subjectIdLabel = "Statement ID",
  periodStart,
  periodEnd,
  details,
  detailsTitle = "Statement Details",
  summary,
  summaryCaption,
  scheduleTitle = "Transaction History",
}: PrintStatementHeaderProps) {
  const { user, profile } = useAuth();
  const { settings } = useAppContext();

  const fmtD = (d: string) => formatAppDate(d, settings.dateFormat, settings.timezone);
  const periodEndStr = periodEnd ? fmtD(periodEnd) : format(new Date(), "dd MMM, yyyy");
  const periodStartStr = periodStart ? fmtD(periodStart) : "—";

  return (
    <div className="print-only">
      {/* 1. Brand bar */}
      <div className="flex items-start justify-between pb-3 mb-4 border-b-2 border-foreground/80">
        <BrandLogo size="md" />
        <div className="text-right">
          <p className="text-[13px] font-bold tracking-wider uppercase">{documentTitle}</p>
          <p className="text-[10.5px] text-muted-foreground mt-0.5">
            Generated: {format(new Date(), "dd MMM, yyyy · HH:mm")}
          </p>
        </div>
      </div>

      {/* 2. Holder strip */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-1 mb-5 pb-3 border-b text-[11px]">
        <div className="flex gap-2">
          <span className="text-muted-foreground w-24 shrink-0">Account Holder</span>
          <span className="font-semibold">: {profile?.full_name || "—"}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-muted-foreground w-24 shrink-0">{subjectIdLabel}</span>
          <span className="font-mono">: {subjectId.slice(0, 8).toUpperCase()}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-muted-foreground w-24 shrink-0">Email</span>
          <span>: {profile?.email || user?.email || "—"}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-muted-foreground w-24 shrink-0">Period</span>
          <span>: {periodStartStr} — {periodEndStr}</span>
        </div>
        {profile?.phone && (
          <div className="flex gap-2">
            <span className="text-muted-foreground w-24 shrink-0">Phone</span>
            <span>: {profile.phone}</span>
          </div>
        )}
        {profile?.company_name && (
          <div className="flex gap-2">
            <span className="text-muted-foreground w-24 shrink-0">Organization</span>
            <span className="font-semibold">
              : {profile.company_name}
              {profile.role_title ? ` · ${profile.role_title}` : ""}
            </span>
          </div>
        )}
        {profile?.address && (
          <div className="flex gap-2 col-span-2">
            <span className="text-muted-foreground w-24 shrink-0">Address</span>
            <span>
              : {profile.address}
              {profile.state_division ? `, ${profile.state_division}` : ""}
              {profile.country ? `, ${profile.country}` : ""}
            </span>
          </div>
        )}
      </div>

      {/* 3. Subject details */}
      {details.length > 0 && (
        <div className="mb-5">
          <h3 className="print-section-title">{detailsTitle}</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-[11px]">
            {details.map((kv, i) => (
              <div
                key={i}
                className={`flex gap-2 ${kv.fullWidth ? "col-span-2" : ""}`}
              >
                <span className="text-muted-foreground w-24 shrink-0">{kv.label}</span>
                <span className="font-semibold">: {kv.value ?? "—"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Financial summary */}
      {summary && summary.length > 0 && (
        <div className="mb-5">
          <h3 className="print-section-title">Financial Summary</h3>
          <table className="w-full">
            <thead>
              <tr>
                {summary.map((col, i) => (
                  <th key={i} className="text-left">{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {summary.map((col, i) => (
                  <td key={i} className="font-semibold">{col.value}</td>
                ))}
              </tr>
            </tbody>
          </table>
          {summaryCaption && (
            <p className="mt-2 text-[11px] text-muted-foreground">{summaryCaption}</p>
          )}
        </div>
      )}

      {/* 5. Schedule heading (the page's table renders right after this component) */}
      {scheduleTitle && <h3 className="print-section-title">{scheduleTitle}</h3>}
    </div>
  );
}

/** Print-only footer with app credit and timestamp. Place at the bottom of the page. */
export function PrintStatementFooter() {
  return (
    <div className="print-only mt-6 pt-3 border-t text-center text-[10px] text-muted-foreground">
      Generated by {APP_CONFIG.name} · {APP_CONFIG.tagline} ·{" "}
      {format(new Date(), "dd MMM, yyyy HH:mm")}
    </div>
  );
}
