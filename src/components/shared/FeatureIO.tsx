import { useRef, useState } from "react";
import { Download, Upload, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";

export interface FeatureIOTable {
  /** Supabase table name */
  table: string;
  /** React Query keys to invalidate after import */
  invalidateKeys?: string[];
}

interface FeatureIOProps {
  /** Short feature label used for filename and menu (e.g. "accounts", "transactions") */
  feature: string;
  /** One or more tables to include in the export/import bundle */
  tables: FeatureIOTable[];
  /** Optional button size override */
  size?: "sm" | "default";
}

const STRIP_FIELDS = ["user_id", "created_at", "updated_at"] as const;

export function FeatureIO({ feature, tables, size = "sm" }: FeatureIOProps) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"idle" | "export" | "import">("idle");

  const handleExport = async () => {
    setBusy("export");
    try {
      const bundle: Record<string, any> = {
        _meta: { app: "MahBook", feature, version: "1.0", exportedAt: new Date().toISOString() },
      };
      let totalRows = 0;
      for (const { table } of tables) {
        const { data, error } = await supabase.from(table as any).select("*");
        if (error) {
          console.warn(`Export warning for ${table}:`, error.message);
          bundle[table] = [];
        } else {
          bundle[table] = data || [];
          totalRows += data?.length || 0;
        }
      }
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mahbook-${feature}-${format(new Date(), "yyyy-MM-dd")}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${totalRows} ${feature} record${totalRows === 1 ? "" : "s"}`);
    } catch (e: any) {
      toast.error(e.message || "Export failed");
    } finally {
      setBusy("idle");
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (fileRef.current) fileRef.current.value = "";
    if (!f) return;
    if (!f.name.endsWith(".json")) {
      toast.error("Please select a .json export file");
      return;
    }
    setBusy("import");
    try {
      const json = JSON.parse(await f.text());
      if (!json._meta || json._meta.app !== "MahBook") {
        toast.error("This file is not a MahBook export");
        return;
      }
      let totalImported = 0;
      let totalSkipped = 0;
      for (const { table } of tables) {
        const rows: any[] = Array.isArray(json[table]) ? json[table] : [];
        if (!rows.length) continue;
        // Strip ownership/timestamp fields so the current user becomes the owner
        const cleaned = rows.map((r) => {
          const out: any = { ...r };
          for (const k of STRIP_FIELDS) delete out[k];
          if ("is_demo" in out) out.is_demo = false;
          return out;
        });
        for (let i = 0; i < cleaned.length; i += 50) {
          const batch = cleaned.slice(i, i + 50);
          const { error } = await supabase.from(table as any).upsert(batch as any, { onConflict: "id" });
          if (error) {
            console.warn(`Import warning for ${table}:`, error.message);
            totalSkipped += batch.length;
          } else {
            totalImported += batch.length;
          }
        }
      }
      const keys = new Set<string>();
      tables.forEach((t) => (t.invalidateKeys || [t.table]).forEach((k) => keys.add(k)));
      keys.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
      if (totalImported) toast.success(`Imported ${totalImported} record${totalImported === 1 ? "" : "s"}${totalSkipped ? ` · ${totalSkipped} skipped` : ""}`);
      else toast.error("No records imported");
    } catch {
      toast.error("Failed to read or import file");
    } finally {
      setBusy("idle");
    }
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
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-muted-foreground">Transfer</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleExport} className="gap-2 text-xs">
            <Download className="h-3.5 w-3.5" /> Export as JSON
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => fileRef.current?.click()} className="gap-2 text-xs">
            <Upload className="h-3.5 w-3.5" /> Import from JSON
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFile} />
    </>
  );
}
