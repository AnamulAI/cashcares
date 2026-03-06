import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Upload, FileJson, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/i18n/useTranslation";
import { toast } from "sonner";
import { format } from "date-fns";

const BACKUP_TABLES = ["accounts", "categories", "transactions", "budgets", "receivables", "payables", "loans", "assets", "investments", "reminders", "partnerships", "partnership_entries"] as const;

interface BackupRestoreModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BackupRestoreModal({ open, onOpenChange }: BackupRestoreModalProps) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [backing, setBacking] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restorePreview, setRestorePreview] = useState<Record<string, number> | null>(null);
  const [restoreData, setRestoreData] = useState<Record<string, any[]> | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [confirmRestore, setConfirmRestore] = useState(false);

  const resetRestore = () => {
    setRestoreFile(null);
    setRestorePreview(null);
    setRestoreData(null);
    setRestoreError(null);
    setConfirmRestore(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleBackup = async () => {
    setBacking(true);
    try {
      const backup: Record<string, any> = {
        _meta: {
          app: "CashCare",
          version: "1.0",
          exportedAt: new Date().toISOString(),
          type: "full_backup",
        },
      };

      for (const table of BACKUP_TABLES) {
        const { data, error } = await supabase.from(table as any).select("*");
        if (error) {
          console.warn(`Backup warning for ${table}:`, error.message);
          backup[table] = [];
        } else {
          backup[table] = data || [];
        }
      }

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cash-care-backup-${format(new Date(), "yyyy-MM-dd")}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t("backup.downloadSuccess"));
    } catch (err: any) {
      toast.error(err.message || t("backup.failed"));
    } finally {
      setBacking(false);
    }
  };

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setRestoreError(null);
    setRestorePreview(null);
    setRestoreData(null);
    setConfirmRestore(false);
    const f = e.target.files?.[0];
    if (!f) return;

    if (!f.name.endsWith(".json")) {
      setRestoreError(t("import.invalidFormat"));
      return;
    }

    try {
      const text = await f.text();
      const json = JSON.parse(text);

      if (!json._meta || json._meta.app !== "CashCare") {
        setRestoreError(t("backup.invalidBackup"));
        return;
      }

      const counts: Record<string, number> = {};
      const data: Record<string, any[]> = {};

      for (const table of BACKUP_TABLES) {
        if (Array.isArray(json[table]) && json[table].length > 0) {
          counts[table] = json[table].length;
          data[table] = json[table];
        }
      }

      if (Object.keys(counts).length === 0) {
        setRestoreError(t("backup.emptyBackup"));
        return;
      }

      setRestoreFile(f);
      setRestorePreview(counts);
      setRestoreData(data);
    } catch {
      setRestoreError(t("import.parseError"));
    }
  };

  const handleRestore = async () => {
    if (!restoreData) return;
    setRestoring(true);
    let totalRestored = 0;

    try {
      // Insert in dependency order, using upsert to handle duplicates
      const order: typeof BACKUP_TABLES[number][] = [
        "accounts", "categories", "transactions", "budgets",
        "receivables", "payables", "loans", "assets", "investments",
        "reminders", "partnerships", "partnership_entries"
      ];

      for (const table of order) {
        const rows = restoreData[table];
        if (!rows || rows.length === 0) continue;

        for (let i = 0; i < rows.length; i += 50) {
          const batch = rows.slice(i, i + 50);
          const { error: upsertError } = await supabase.from(table as any).upsert(batch as any, { onConflict: "id" });
          if (upsertError) {
            console.warn(`Restore warning for ${table}:`, upsertError.message);
          } else {
            totalRestored += batch.length;
          }
        }
      }

      qc.invalidateQueries();
      toast.success(`${t("backup.restoreSuccess")}: ${totalRestored} ${t("import.records")}`);
      resetRestore();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || t("backup.restoreFailed"));
    } finally {
      setRestoring(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetRestore(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("settings.backupRestore")}</DialogTitle>
          <DialogDescription>{t("backup.description")}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="backup" className="w-full">
          <TabsList className="w-full h-9 bg-muted/60 p-1">
            <TabsTrigger value="backup" className="flex-1 text-xs gap-1.5">
              <Download className="h-3.5 w-3.5" /> {t("backup.backup")}
            </TabsTrigger>
            <TabsTrigger value="restore" className="flex-1 text-xs gap-1.5">
              <Upload className="h-3.5 w-3.5" /> {t("backup.restore")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="backup" className="space-y-4 mt-4">
            <div className="rounded-lg border bg-muted/30 p-4 text-center">
              <Download className="h-8 w-8 mx-auto text-feature-reports mb-2" />
              <p className="text-sm font-medium">{t("backup.fullBackup")}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("backup.fullBackupDesc")}</p>
            </div>
            <Button className="w-full gap-1.5" onClick={handleBackup} disabled={backing}>
              <Download className="h-4 w-4" />
              {backing ? t("common.loading") : t("backup.downloadBackup")}
            </Button>
          </TabsContent>

          <TabsContent value="restore" className="space-y-4 mt-4">
            <div className="flex items-start gap-2 text-xs text-warning bg-warning/10 rounded-lg px-3 py-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{t("backup.restoreWarning")}</span>
            </div>

            <div
              className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/40 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <FileJson className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">{restoreFile ? restoreFile.name : t("import.selectFile")}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("backup.selectBackupFile")}</p>
              <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleRestoreFile} />
            </div>

            {restoreError && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {restoreError}
              </div>
            )}

            {restorePreview && (
              <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("import.preview")}</p>
                {Object.entries(restorePreview).map(([table, count]) => (
                  <div key={table} className="flex items-center justify-between text-sm">
                    <span className="capitalize">{table.replace(/_/g, " ")}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            )}

            {restoreData && !confirmRestore && (
              <Button className="w-full" variant="outline" onClick={() => setConfirmRestore(true)}>
                {t("backup.proceedRestore")}
              </Button>
            )}

            {confirmRestore && (
              <Button className="w-full gap-1.5 bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleRestore} disabled={restoring}>
                <CheckCircle2 className="h-4 w-4" />
                {restoring ? t("backup.restoring") : t("backup.confirmRestore")}
              </Button>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
