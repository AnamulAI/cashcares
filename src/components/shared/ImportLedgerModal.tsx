import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ImportLedgerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "payable" | "receivable";
}

interface Row {
  person_name: string;
  phone?: string;
  description?: string;
  amount?: number;
  due_date?: string;
}

export function ImportLedgerModal({ open, onOpenChange, type }: ImportLedgerModalProps) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const reset = () => {
    setFile(null); setRows(null); setError(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const normalizeKey = (k: string) =>
    k.toLowerCase().replace(/[^a-z0-9]/g, "");

  const mapRow = (raw: any): Row | null => {
    const out: any = {};
    for (const key of Object.keys(raw)) {
      const nk = normalizeKey(key);
      if (nk.includes("name") || nk === "person") out.person_name = String(raw[key] ?? "").trim();
      else if (nk.includes("phone") || nk.includes("mobile")) out.phone = String(raw[key] ?? "").trim();
      else if (nk.includes("desc") || nk.includes("note") || nk.includes("reason")) out.description = String(raw[key] ?? "").trim();
      else if (nk.includes("amount") || nk.includes("balance")) out.amount = Number(raw[key]) || 0;
      else if (nk.includes("due") || nk.includes("date")) {
        const v = raw[key];
        if (v instanceof Date) out.due_date = v.toISOString().split("T")[0];
        else if (v) {
          const d = new Date(v);
          out.due_date = isNaN(d.getTime()) ? undefined : d.toISOString().split("T")[0];
        }
      }
    }
    if (!out.person_name) return null;
    return out as Row;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null); setRows(null);
    const f = e.target.files?.[0];
    if (!f) return;
    const isCsv = f.name.toLowerCase().endsWith(".csv");
    const isXlsx = f.name.toLowerCase().endsWith(".xlsx") || f.name.toLowerCase().endsWith(".xls");
    if (!isCsv && !isXlsx) {
      setError("Please upload a .csv or .xlsx file");
      return;
    }
    try {
      let parsed: any[] = [];
      if (isCsv) {
        const text = await f.text();
        const result = Papa.parse(text, { header: true, skipEmptyLines: true });
        parsed = result.data as any[];
      } else {
        const buf = await f.arrayBuffer();
        const wb = XLSX.read(buf, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        parsed = XLSX.utils.sheet_to_json(sheet);
      }
      const mapped = parsed.map(mapRow).filter(Boolean) as Row[];
      if (mapped.length === 0) {
        setError("No valid rows found. Required column: Person Name.");
        return;
      }
      setFile(f);
      setRows(mapped);
    } catch (err: any) {
      setError(err.message || "Failed to parse file");
    }
  };

  const handleImport = async () => {
    if (!rows) return;
    setImporting(true);
    let imported = 0;
    try {
      const bookTable = type === "payable" ? "payable_books" : "receivable_books";
      const entryTable = type === "payable" ? "payable_entries" : "receivable_entries";
      for (const r of rows) {
        const { data: book, error: bErr } = await supabase
          .from(bookTable)
          .insert({
            person_name: r.person_name,
            phone: r.phone || null,
            description: r.description || null,
            opening_balance: 0,
            status: "active",
          } as any)
          .select()
          .single();
        if (bErr || !book) continue;
        if (r.amount && r.amount > 0) {
          const entryPayload: any = {
            book_id: book.id,
            date: new Date().toISOString().split("T")[0],
            description: r.description || "Imported opening entry",
            amount: r.amount,
            due_date: r.due_date || null,
            status: "open",
          };
          if (type === "payable") entryPayload.paid_amount = 0;
          else entryPayload.collected_amount = 0;
          await supabase.from(entryTable).insert(entryPayload);
        }
        imported++;
      }
      qc.invalidateQueries();
      toast.success(`Imported ${imported} ${type} ${imported === 1 ? "book" : "books"}`);
      reset();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csv = "Person Name,Phone,Description,Amount,Due Date\nJohn Doe,01700000000,Sample entry,1000,2025-12-31\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${type}-import-template.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" /> Import {type === "payable" ? "Payables" : "Receivables"}
          </DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file. Required column: <b>Person Name</b>. Optional: Phone, Description, Amount, Due Date.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div
            className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/40 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <FileSpreadsheet className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-medium">{file ? file.name : "Choose CSV or Excel file"}</p>
            <p className="text-xs text-muted-foreground mt-1">.csv, .xlsx, .xls</p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          <Button variant="ghost" size="sm" className="w-full text-xs gap-1.5" onClick={downloadTemplate}>
            <Download className="h-3.5 w-3.5" /> Download CSV template
          </Button>

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          {rows && (
            <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5 max-h-48 overflow-auto">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Preview ({rows.length} rows)</p>
              {rows.slice(0, 5).map((r, i) => (
                <div key={i} className="text-xs flex justify-between gap-2">
                  <span className="truncate">{r.person_name}</span>
                  <span className="text-muted-foreground shrink-0">{r.amount ? r.amount : "—"}</span>
                </div>
              ))}
              {rows.length > 5 && <p className="text-[11px] text-muted-foreground">…and {rows.length - 5} more</p>}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => { reset(); onOpenChange(false); }}>Cancel</Button>
          <Button size="sm" onClick={handleImport} disabled={!rows || importing} className="gap-1.5">
            {importing ? "Importing..." : <><CheckCircle2 className="h-3.5 w-3.5" /> Import {rows ? `${rows.length}` : ""}</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
