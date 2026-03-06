import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileJson, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/i18n/useTranslation";
import { toast } from "sonner";

const IMPORTABLE_TABLES = ["accounts", "categories", "transactions", "budgets", "receivables", "payables", "loans", "assets", "investments", "reminders", "partnerships", "partnership_entries"] as const;

interface ImportDataModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportDataModal({ open, onOpenChange }: ImportDataModalProps) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Record<string, number> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [parsedData, setParsedData] = useState<Record<string, any[]> | null>(null);

  const reset = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setParsedData(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setPreview(null);
    setParsedData(null);
    const f = e.target.files?.[0];
    if (!f) return;

    if (!f.name.endsWith(".json")) {
      setError(t("import.invalidFormat"));
      return;
    }

    try {
      const text = await f.text();
      const json = JSON.parse(text);
      if (typeof json !== "object" || json === null) {
        setError(t("import.invalidStructure"));
        return;
      }

      const counts: Record<string, number> = {};
      const data: Record<string, any[]> = {};

      for (const table of IMPORTABLE_TABLES) {
        if (Array.isArray(json[table]) && json[table].length > 0) {
          counts[table] = json[table].length;
          // Strip id, created_at, updated_at to avoid conflicts
          data[table] = json[table].map((row: any) => {
            const { id, created_at, updated_at, ...rest } = row;
            return rest;
          });
        }
      }

      if (Object.keys(counts).length === 0) {
        setError(t("import.noRecognizedData"));
        return;
      }

      setFile(f);
      setPreview(counts);
      setParsedData(data);
    } catch {
      setError(t("import.parseError"));
    }
  };

  const handleImport = async () => {
    if (!parsedData) return;
    setImporting(true);
    let totalImported = 0;

    try {
      // Import in dependency order
      const order: typeof IMPORTABLE_TABLES[number][] = [
        "accounts", "categories", "transactions", "budgets",
        "receivables", "payables", "loans", "assets", "investments",
        "reminders", "partnerships", "partnership_entries"
      ];

      for (const table of order) {
        const rows = parsedData[table];
        if (!rows || rows.length === 0) continue;

        // Insert in batches of 50
        for (let i = 0; i < rows.length; i += 50) {
          const batch = rows.slice(i, i + 50);
          const { error: insertError } = await supabase.from(table as any).insert(batch as any);
          if (insertError) {
            console.warn(`Import warning for ${table}:`, insertError.message);
          } else {
            totalImported += batch.length;
          }
        }
      }

      // Invalidate all queries
      qc.invalidateQueries();
      toast.success(`${t("import.success")}: ${totalImported} ${t("import.records")}`);
      reset();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || t("import.failed"));
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-feature-reports" />
            {t("settings.importData")}
          </DialogTitle>
          <DialogDescription>{t("import.description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div
            className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/40 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <FileJson className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-medium">{file ? file.name : t("import.selectFile")}</p>
            <p className="text-xs text-muted-foreground mt-1">{t("import.jsonOnly")}</p>
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {preview && (
            <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("import.preview")}</p>
              {Object.entries(preview).map(([table, count]) => (
                <div key={table} className="flex items-center justify-between text-sm">
                  <span className="capitalize">{table.replace(/_/g, " ")}</span>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => { reset(); onOpenChange(false); }}>
            {t("action.cancel")}
          </Button>
          <Button
            size="sm"
            onClick={handleImport}
            disabled={!parsedData || importing}
            className="gap-1.5"
          >
            {importing ? (
              <>{t("import.importing")}</>
            ) : (
              <><CheckCircle2 className="h-3.5 w-3.5" /> {t("import.confirmImport")}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
