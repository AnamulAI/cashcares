import { useRef, useState } from "react";
import { Download, Upload, ChevronDown, Loader2, FileJson, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";

export interface FeatureIOTable {
  table: string;
  invalidateKeys?: string[];
}

interface FeatureIOProps {
  feature: string;
  tables: FeatureIOTable[];
  size?: "sm" | "default";
}

const STRIP_FIELDS = ["user_id", "created_at", "updated_at"] as const;

// --- CSV helpers ---
function toCsv(rows: any[]): string {
  if (!rows.length) return "";
  const headers: string[] = Array.from(rows.reduce((s: Set<string>, r) => { Object.keys(r || {}).forEach(k => s.add(k)); return s; }, new Set<string>()));
  const esc = (v: any) => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(","), ...rows.map(r => headers.map(h => esc(r[h])).join(","))].join("\n");
}

function parseCsv(text: string): any[] {
  const lines: string[][] = [];
  let cur: string[] = [], field = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQ = false;
      else field += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ",") { cur.push(field); field = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        cur.push(field); lines.push(cur); cur = []; field = "";
      } else field += c;
    }
  }
  if (field.length || cur.length) { cur.push(field); lines.push(cur); }
  if (!lines.length) return [];
  const headers = lines.shift()!;
  return lines.filter(r => r.some(v => v !== "")).map(r => {
    const o: any = {};
    headers.forEach((h, i) => {
      const v = r[i] ?? "";
      if (v === "") { o[h] = null; return; }
      if (v === "true" || v === "false") { o[h] = v === "true"; return; }
      if (/^-?\d+(\.\d+)?$/.test(v)) { o[h] = Number(v); return; }
      if ((v.startsWith("{") && v.endsWith("}")) || (v.startsWith("[") && v.endsWith("]"))) {
        try { o[h] = JSON.parse(v); return; } catch {}
      }
      o[h] = v;
    });
    return o;
  });
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export function FeatureIO({ feature, tables, size = "sm" }: FeatureIOProps) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const importFormatRef = useRef<"json" | "csv">("json");
  const [busy, setBusy] = useState<"idle" | "export" | "import">("idle");

  const invalidateAll = () => {
    const keys = new Set<string>();
    tables.forEach((t) => (t.invalidateKeys || [t.table]).forEach((k) => keys.add(k)));
    keys.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
  };

  const fetchAll = async () => {
    const out: Record<string, any[]> = {};
    let total = 0;
    for (const { table } of tables) {
      const { data, error } = await supabase.from(table as any).select("*");
      if (error) { console.warn(`Export warning for ${table}:`, error.message); out[table] = []; }
      else { out[table] = data || []; total += data?.length || 0; }
    }
    return { out, total };
  };

  const handleExportJson = async () => {
    setBusy("export");
    try {
      const { out, total } = await fetchAll();
      const bundle = { _meta: { app: "MahBook", feature, version: "1.0", exportedAt: new Date().toISOString() }, ...out };
      downloadFile(JSON.stringify(bundle, null, 2), `mahbook-${feature}-${format(new Date(), "yyyy-MM-dd")}.json`, "application/json");
      toast.success(`Exported ${total} ${feature} record${total === 1 ? "" : "s"}`);
    } catch (e: any) { toast.error(e.message || "Export failed"); }
    finally { setBusy("idle"); }
  };

  const handleExportCsv = async () => {
    setBusy("export");
    try {
      const { out, total } = await fetchAll();
      const date = format(new Date(), "yyyy-MM-dd");
      const nonEmpty = Object.entries(out).filter(([, rows]) => rows.length);
      if (!nonEmpty.length) { toast.info("Nothing to export"); return; }
      // One CSV per table (downloaded sequentially)
      for (const [table, rows] of nonEmpty) {
        const name = nonEmpty.length === 1 ? `mahbook-${feature}-${date}.csv` : `mahbook-${feature}-${table}-${date}.csv`;
        downloadFile(toCsv(rows), name, "text/csv");
        await new Promise(r => setTimeout(r, 150));
      }
      toast.success(`Exported ${total} record${total === 1 ? "" : "s"} as CSV`);
    } catch (e: any) { toast.error(e.message || "Export failed"); }
    finally { setBusy("idle"); }
  };

  const triggerImport = (fmt: "json" | "csv") => {
    importFormatRef.current = fmt;
    if (fileRef.current) {
      fileRef.current.accept = fmt === "csv" ? ".csv" : ".json";
      fileRef.current.click();
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (fileRef.current) fileRef.current.value = "";
    if (!f) return;
    setBusy("import");
    try {
      const text = await f.text();
      const fmt = importFormatRef.current;
      let perTable: Record<string, any[]> = {};
      if (fmt === "json") {
        const json = JSON.parse(text);
        if (!json._meta || json._meta.app !== "MahBook") { toast.error("This file is not a MahBook export"); return; }
        for (const { table } of tables) if (Array.isArray(json[table])) perTable[table] = json[table];
      } else {
        const rows = parseCsv(text);
        if (!rows.length) { toast.error("CSV is empty"); return; }
        // CSV imports go into the first/primary table
        perTable[tables[0].table] = rows;
      }
      let imported = 0, skipped = 0;
      for (const [table, rows] of Object.entries(perTable)) {
        if (!rows.length) continue;
        const cleaned = rows.map((r) => {
          const out: any = { ...r };
          for (const k of STRIP_FIELDS) delete out[k];
          if ("is_demo" in out) out.is_demo = false;
          return out;
        });
        for (let i = 0; i < cleaned.length; i += 50) {
          const batch = cleaned.slice(i, i + 50);
          const { error } = await supabase.from(table as any).upsert(batch as any, { onConflict: "id" });
          if (error) { console.warn(`Import warning for ${table}:`, error.message); skipped += batch.length; }
          else imported += batch.length;
        }
      }
      invalidateAll();
      if (imported) toast.success(`Imported ${imported} record${imported === 1 ? "" : "s"}${skipped ? ` · ${skipped} skipped` : ""}`);
      else toast.error("No records imported");
    } catch {
      toast.error("Failed to read or import file");
    } finally { setBusy("idle"); }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size={size} className="gap-1.5 h-9" disabled={busy !== "idle"}>
            {busy !== "idle" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            <span className="text-xs">Data</span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-muted-foreground">Export</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleExportJson} className="gap-2 text-xs">
            <FileJson className="h-3.5 w-3.5" /> Export as JSON
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportCsv} className="gap-2 text-xs">
            <FileSpreadsheet className="h-3.5 w-3.5" /> Export as CSV
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-muted-foreground">Import</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => triggerImport("json")} className="gap-2 text-xs">
            <Upload className="h-3.5 w-3.5" /> Import from JSON
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => triggerImport("csv")} className="gap-2 text-xs">
            <Upload className="h-3.5 w-3.5" /> Import from CSV
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFile} />
    </>
  );
}
