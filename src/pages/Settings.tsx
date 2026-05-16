import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Globe, Bell, Palette, Shield, Database, Download, Upload, RefreshCw, Monitor, Sun, Moon, FlaskConical, Trash2, RotateCw, CheckCircle2, XCircle, AlertCircle, WifiOff, Wifi } from "lucide-react";
import { useAppContext, CURRENCIES, type DatePreset } from "@/contexts/AppContext";
import { useTranslation } from "@/i18n/useTranslation";
import { useTransactions } from "@/hooks/use-transactions";
import { useAccounts } from "@/hooks/use-accounts";
import { useCategories } from "@/hooks/use-categories";
import { ImportDataModal } from "@/components/settings/ImportDataModal";
import { BackupRestoreModal } from "@/components/settings/BackupRestoreModal";
import { loadDemoData, clearDemoData, isDemoDataLoaded } from "@/lib/demo-data";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Settings() {
  const { currency, setCurrency, settings, updateSettings, setDatePreset } = useAppContext();
  const { t } = useTranslation();
  const { data: transactions = [] } = useTransactions();
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const [importOpen, setImportOpen] = useState(false);
  const [backupOpen, setBackupOpen] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);
  const qc = useQueryClient();
  const [swVersion, setSwVersion] = useState<string | null>(null);
  const [versionHistory, setVersionHistory] = useState<{ version: string; seenAt: string }[]>(() => {
    try { return JSON.parse(localStorage.getItem("mahbook:sw-version-history") || "[]"); } catch { return []; }
  });
  const [readiness, setReadiness] = useState<{
    status: "idle" | "checking" | "ready" | "partial" | "unavailable";
    swRegistered: boolean;
    swActive: boolean;
    swScope?: string;
    cacheCount: number;
    cachedItems: number;
    online: boolean;
    checkedAt?: string;
    message: string;
  }>({ status: "idle", swRegistered: false, swActive: false, cacheCount: 0, cachedItems: 0, online: typeof navigator !== "undefined" ? navigator.onLine : true, message: "Not checked yet." });

  const checkOfflineReadiness = async () => {
    setReadiness((r) => ({ ...r, status: "checking", message: "Checking…" }));
    const online = typeof navigator !== "undefined" ? navigator.onLine : true;
    if (!("serviceWorker" in navigator)) {
      setReadiness({ status: "unavailable", swRegistered: false, swActive: false, cacheCount: 0, cachedItems: 0, online, checkedAt: new Date().toISOString(), message: "Service workers aren't supported in this browser." });
      return;
    }
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const swRegistered = !!reg;
      const swActive = !!reg?.active;
      const scope = reg?.scope;
      let cacheCount = 0;
      let cachedItems = 0;
      if ("caches" in window) {
        const keys = await caches.keys();
        cacheCount = keys.length;
        const counts = await Promise.all(keys.map(async (k) => (await (await caches.open(k)).keys()).length));
        cachedItems = counts.reduce((a, b) => a + b, 0);
      }
      let status: "ready" | "partial" | "unavailable" = "unavailable";
      let message = "Offline mode is not available yet. Visit the published app online once to install it.";
      if (swActive && cachedItems > 0) { status = "ready"; message = "Offline-ready. The app will keep working without internet."; }
      else if (swRegistered && !swActive) { status = "partial"; message = "Service worker is installing. Reload once it finishes to enable offline mode."; }
      else if (swActive && cachedItems === 0) { status = "partial"; message = "Service worker is active but nothing is cached yet. Browse a few pages online to populate the cache."; }
      setReadiness({ status, swRegistered, swActive, swScope: scope, cacheCount, cachedItems, online, checkedAt: new Date().toISOString(), message });
    } catch (e: any) {
      setReadiness({ status: "unavailable", swRegistered: false, swActive: false, cacheCount: 0, cachedItems: 0, online, checkedAt: new Date().toISOString(), message: e?.message || "Couldn't read service worker status." });
    }
  };

  const recordVersion = (v: string) => {
    if (!v || ["unsupported", "not installed", "unknown", "checking…"].includes(v)) return;
    setVersionHistory((prev) => {
      if (prev[0]?.version === v) return prev;
      const next = [{ version: v, seenAt: new Date().toISOString() }, ...prev.filter(e => e.version !== v)].slice(0, 5);
      try { localStorage.setItem("mahbook:sw-version-history", JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const fetchSwVersion = async () => {
    if (!("serviceWorker" in navigator)) { setSwVersion("unsupported"); return; }
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sw = reg?.active;
      if (!sw) { setSwVersion("not installed"); return; }
      const channel = new MessageChannel();
      const versionPromise = new Promise<string>((resolve) => {
        channel.port1.onmessage = (e) => resolve(e.data?.version ?? "unknown");
        setTimeout(() => resolve("unknown"), 1500);
      });
      sw.postMessage("GET_VERSION", [channel.port2]);
      const v = await versionPromise;
      setSwVersion(v);
      recordVersion(v);
    } catch {
      setSwVersion("unknown");
    }
  };

  useEffect(() => { fetchSwVersion(); }, []);

  const toggleNotif = (key: keyof typeof settings.notifications) => {
    updateSettings({ notifications: { ...settings.notifications, [key]: !settings.notifications[key] } });
    toast.success(t("action.save") + " ✓");
  };

  const handleCurrencyChange = (code: string) => {
    const c = CURRENCIES.find(x => x.code === code);
    if (c) { setCurrency(c); toast.success(t("action.save") + " ✓"); }
  };

  const handleLanguageChange = (v: string) => {
    updateSettings({ language: v });
    toast.success(v === "bn" ? "ভাষা পরিবর্তন হয়েছে" : "Language updated");
  };

  const handleDateFormatChange = (v: string) => { updateSettings({ dateFormat: v }); toast.success(t("action.save") + " ✓"); };
  const handleTimezoneChange = (v: string) => { updateSettings({ timezone: v }); toast.success(t("action.save") + " ✓"); };
  const handleDefaultRangeChange = (v: string) => { updateSettings({ defaultDashboardRange: v as DatePreset }); toast.success(t("action.save") + " ✓"); };
  const handleThemeChange = (v: "light" | "dark" | "system") => { updateSettings({ theme: v }); toast.success(t("action.save") + " ✓"); };

  const handleLoadDemo = async () => {
    setDemoLoading(true);
    try {
      const already = await isDemoDataLoaded();
      if (already) {
        toast.info("Demo data is already loaded");
        return;
      }
      const { total } = await loadDemoData();
      qc.invalidateQueries();
      toast.success(`Demo data loaded — ${total} records added. Reloading...`);
      setTimeout(() => window.location.reload(), 800);
    } catch (e: any) {
      toast.error(e.message || "Failed to load demo data");
    } finally {
      setDemoLoading(false);
    }
  };

  const handleClearDemo = async () => {
    setDemoLoading(true);
    try {
      const { total } = await clearDemoData();
      qc.invalidateQueries();
      toast.success(`Cleared ${total} demo records. Reloading...`);
      setTimeout(() => window.location.reload(), 800);
    } catch (e: any) {
      toast.error(e.message || "Failed to clear demo data");
    } finally {
      setDemoLoading(false);
      setClearConfirm(false);
    }
  };

  const exportAllData = () => {
    const data = { exportedAt: new Date().toISOString(), accounts, categories, transactions };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cashcare-backup-${format(new Date(), "yyyy-MM-dd")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported successfully");
  };

  const checkForUpdates = async () => {
    if (!("serviceWorker" in navigator)) { toast.info("Updates aren't available in this browser"); return; }
    toast.loading("Checking for updates…", { id: "sw-check" });
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg) { toast.success("App is up to date", { id: "sw-check" }); return; }
      await reg.update();
      toast.dismiss("sw-check");
      await fetchSwVersion();
      if (reg.waiting) {
        // Let PWAUpdatePrompt show the reload prompt with force=true
        window.dispatchEvent(new CustomEvent("mahbook:sw-check"));
      } else {
        // Trigger the prompt's check handler which will toast success when current
        window.dispatchEvent(new CustomEvent("mahbook:sw-check"));
      }
    } catch {
      toast.error("Couldn't check for updates", { id: "sw-check" });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("settings.title")} subtitle={t("settings.subtitle")} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* General Preferences */}
        <Card className="finance-card-static">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><Globe className="h-4 w-4 text-feature-settings" /> {t("settings.generalPreferences")}</CardTitle>
            <CardDescription className="text-xs">{t("settings.localeSettings")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div><Label className="text-xs font-medium">{t("settings.currency")}</Label><p className="text-[11px] text-muted-foreground">{t("settings.currencyDesc")}</p></div>
              <Select value={currency.code} onValueChange={handleCurrencyChange}><SelectTrigger className="w-[100px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent>{CURRENCIES.map(c => <SelectItem key={c.code} value={c.code}>{c.symbol} {c.code}</SelectItem>)}</SelectContent></Select>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div><Label className="text-xs font-medium">{t("settings.language")}</Label><p className="text-[11px] text-muted-foreground">{t("settings.languageDesc")}</p></div>
              <Select value={settings.language} onValueChange={handleLanguageChange}><SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="bn">বাংলা</SelectItem></SelectContent></Select>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div><Label className="text-xs font-medium">{t("settings.dateFormat")}</Label><p className="text-[11px] text-muted-foreground">{t("settings.dateFormatDesc")}</p></div>
              <Select value={settings.dateFormat} onValueChange={handleDateFormatChange}><SelectTrigger className="w-[150px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="dmy">14 Feb, 2026</SelectItem><SelectItem value="mdy">Feb 14, 2026</SelectItem><SelectItem value="ymd">2026 Feb 14</SelectItem></SelectContent></Select>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div><Label className="text-xs font-medium">{t("settings.relativeTime")}</Label><p className="text-[11px] text-muted-foreground">{t("settings.relativeTimeDesc")}</p></div>
              <Switch checked={!!settings.relativeTime} onCheckedChange={(v) => { updateSettings({ relativeTime: v }); toast.success(t("action.save") + " ✓"); }} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div><Label className="text-xs font-medium">{t("settings.timezone")}</Label><p className="text-[11px] text-muted-foreground">{t("settings.timezoneDesc")}</p></div>
              <Select value={settings.timezone} onValueChange={handleTimezoneChange}><SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="dhaka">Asia/Dhaka (GMT+6)</SelectItem><SelectItem value="utc">UTC</SelectItem><SelectItem value="est">US/Eastern</SelectItem></SelectContent></Select>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div><Label className="text-xs font-medium">Default Dashboard Range</Label><p className="text-[11px] text-muted-foreground">Initial date range when loading dashboard</p></div>
              <Select value={settings.defaultDashboardRange || "this_month"} onValueChange={handleDefaultRangeChange}><SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="this_month">{t("datePreset.thisMonth")}</SelectItem><SelectItem value="last_month">{t("datePreset.lastMonth")}</SelectItem><SelectItem value="last_3_months">{t("datePreset.last3Months")}</SelectItem><SelectItem value="this_year">{t("datePreset.thisYear")}</SelectItem></SelectContent></Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="finance-card-static">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><Bell className="h-4 w-4 text-feature-reminders" /> {t("settings.notifications")}</CardTitle>
            <CardDescription className="text-xs">{t("settings.notificationsDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {([
              { key: "email" as const, label: t("settings.emailNotifications"), desc: t("settings.emailDesc") },
              { key: "budgetThreshold" as const, label: t("settings.budgetThresholdAlerts"), desc: t("settings.budgetThresholdDesc") },
              { key: "receivableReminder" as const, label: t("settings.receivableReminders"), desc: t("settings.receivableDesc") },
              { key: "payableReminder" as const, label: t("settings.payableReminders"), desc: t("settings.payableDesc") },
              { key: "loanDue" as const, label: t("settings.loanDueReminders"), desc: t("settings.loanDueDesc") },
            ]).map((item, i) => (
              <div key={item.key}>
                <div className="flex items-center justify-between">
                  <div><Label className="text-xs font-medium">{item.label}</Label><p className="text-[11px] text-muted-foreground">{item.desc}</p></div>
                  <Switch checked={settings.notifications[item.key]} onCheckedChange={() => toggleNotif(item.key)} />
                </div>
                {i < 4 && <Separator className="mt-4" />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="finance-card-static">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><Palette className="h-4 w-4 text-feature-categories" /> {t("settings.appearance")}</CardTitle>
            <CardDescription className="text-xs">{t("settings.appearanceDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs font-medium mb-2 block">{t("settings.theme")}</Label>
              <div className="flex gap-2">
                {([
                  { value: "light" as const, icon: Sun, label: t("settings.light") },
                  { value: "dark" as const, icon: Moon, label: t("settings.dark") },
                  { value: "system" as const, icon: Monitor, label: t("settings.system") },
                ]).map(thm => (
                  <Button key={thm.value} variant={settings.theme === thm.value ? "default" : "outline"} size="sm" className="gap-1.5 text-xs flex-1" onClick={() => handleThemeChange(thm.value)}>
                    <thm.icon className="h-3.5 w-3.5" /> {thm.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="finance-card-static">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><Shield className="h-4 w-4 text-feature-settings" /> {t("settings.security")}</CardTitle>
            <CardDescription className="text-xs">{t("settings.securityDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div><Label className="text-xs font-medium">{t("settings.changePassword")}</Label><p className="text-[11px] text-muted-foreground">{t("settings.changePasswordDesc")}</p></div>
              <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => toast.info("Password change requires authentication to be set up first.")}>{t("settings.change")}</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div><Label className="text-xs font-medium">{t("settings.twoFactor")}</Label><p className="text-[11px] text-muted-foreground">{t("settings.twoFactorDesc")}</p></div>
              <Badge variant="secondary" className="text-[10px]">{t("settings.comingSoon")}</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div><Label className="text-xs font-medium">{t("settings.sessionActivity")}</Label><p className="text-[11px] text-muted-foreground">{t("settings.sessionDesc")}</p></div>
              <Badge variant="secondary" className="text-[10px]">{t("settings.comingSoon")}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Data & Export */}
        <Card className="finance-card-static lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><Database className="h-4 w-4 text-feature-reports" /> {t("settings.dataExport")}</CardTitle>
            <CardDescription className="text-xs">{t("settings.dataExportDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-1.5 text-xs" onClick={exportAllData}>
                <Download className="h-5 w-5 text-feature-reports" />
                <span className="font-medium">{t("settings.exportAllData")}</span>
                <span className="text-[10px] text-muted-foreground">{t("settings.exportAllDataDesc")}</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-1.5 text-xs" onClick={() => setImportOpen(true)}>
                <Upload className="h-5 w-5 text-feature-reports" />
                <span className="font-medium">{t("settings.importData")}</span>
                <span className="text-[10px] text-muted-foreground">{t("import.importDesc")}</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-1.5 text-xs" onClick={() => setBackupOpen(true)}>
                <RefreshCw className="h-5 w-5 text-feature-reports" />
                <span className="font-medium">{t("settings.backupRestore")}</span>
                <span className="text-[10px] text-muted-foreground">{t("backup.backupDesc")}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Demo Data — Dev/Testing */}
        <Card className="finance-card-static lg:col-span-2 border-dashed border-muted-foreground/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-muted-foreground" /> Demo / Test Data
              <Badge variant="secondary" className="text-[9px] ml-1">DEV</Badge>
            </CardTitle>
            <CardDescription className="text-xs">Load realistic sample data across all modules for testing and review.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleLoadDemo} disabled={demoLoading}>
                <FlaskConical className="h-3.5 w-3.5" />
                {demoLoading ? "Loading..." : "Load Demo Data"}
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/5" onClick={() => setClearConfirm(true)} disabled={demoLoading}>
                <Trash2 className="h-3.5 w-3.5" />
                Clear Demo Data
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">Seeds accounts, categories, transactions, budgets, receivables, payables, loans, assets, investments, partnerships, and reminders.</p>
          </CardContent>
        </Card>

        {/* App Updates */}
        <Card className="finance-card-static lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><RotateCw className="h-4 w-4 text-feature-settings" /> App Updates</CardTitle>
            <CardDescription className="text-xs">Check for the latest MahBook version and refresh the offline cache.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-medium">Installed cache version</Label>
                <p className="text-[11px] text-muted-foreground">Reported live by the active service worker.</p>
              </div>
              <Badge variant="secondary" className="font-mono text-[10px]">{swVersion ?? "checking…"}</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-medium">Check for updates</Label>
                <p className="text-[11px] text-muted-foreground">If a newer version is installed, you'll be prompted to reload immediately.</p>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={checkForUpdates}>
                <RotateCw className="h-3.5 w-3.5" /> Check now
              </Button>
            </div>
            <Separator />
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <Label className="text-xs font-medium">Version history</Label>
                  <p className="text-[11px] text-muted-foreground">Last {versionHistory.length || 5} cache versions seen on this device.</p>
                </div>
                {versionHistory.length > 0 && (
                  <Button variant="ghost" size="sm" className="text-[11px] h-7 text-muted-foreground" onClick={() => { localStorage.removeItem("mahbook:sw-version-history"); setVersionHistory([]); }}>
                    Clear
                  </Button>
                )}
              </div>
              {versionHistory.length === 0 ? (
                <p className="text-[11px] text-muted-foreground italic">No versions recorded yet.</p>
              ) : (
                <ul className="space-y-1.5">
                  {versionHistory.map((entry, i) => (
                    <li key={`${entry.version}-${entry.seenAt}`} className="flex items-center justify-between text-[11px] py-1.5 px-2 rounded-md bg-muted/40">
                      <div className="flex items-center gap-2">
                        <Badge variant={i === 0 ? "default" : "secondary"} className="font-mono text-[10px]">{entry.version}</Badge>
                        {i === 0 && <span className="text-[10px] text-muted-foreground">current</span>}
                      </div>
                      <span className="text-muted-foreground tabular-nums">{format(new Date(entry.seenAt), "dd MMM yyyy, HH:mm")}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Label className="text-xs font-medium">Offline readiness</Label>
                  <p className="text-[11px] text-muted-foreground">Verify the service worker is installed and the app can run without internet.</p>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8 shrink-0" onClick={checkOfflineReadiness} disabled={readiness.status === "checking"}>
                  {readiness.status === "checking" ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Shield className="h-3.5 w-3.5" />}
                  {readiness.status === "checking" ? "Checking…" : "Check status"}
                </Button>
              </div>
              {readiness.status !== "idle" && (
                <div className={
                  "rounded-md border p-3 space-y-2.5 " +
                  (readiness.status === "ready" ? "border-positive/30 bg-positive/5"
                    : readiness.status === "partial" ? "border-warning/30 bg-warning/5"
                    : readiness.status === "unavailable" ? "border-negative/30 bg-negative/5"
                    : "border-border bg-muted/30")
                }>
                  <div className="flex items-center gap-2 text-xs font-medium">
                    {readiness.status === "ready" && <><CheckCircle2 className="h-4 w-4 text-positive" /><span className="text-positive">Offline ready</span></>}
                    {readiness.status === "partial" && <><AlertCircle className="h-4 w-4 text-warning" /><span className="text-warning">Partially ready</span></>}
                    {readiness.status === "unavailable" && <><XCircle className="h-4 w-4 text-negative" /><span className="text-negative">Not available</span></>}
                    {readiness.status === "checking" && <><RefreshCw className="h-4 w-4 animate-spin" /><span>Checking…</span></>}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{readiness.message}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      {readiness.swRegistered ? <CheckCircle2 className="h-3 w-3 text-positive" /> : <XCircle className="h-3 w-3 text-negative" />}
                      <span className="text-muted-foreground">SW registered</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      {readiness.swActive ? <CheckCircle2 className="h-3 w-3 text-positive" /> : <XCircle className="h-3 w-3 text-negative" />}
                      <span className="text-muted-foreground">SW active</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Database className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{readiness.cacheCount} cache{readiness.cacheCount === 1 ? "" : "s"} · {readiness.cachedItems} item{readiness.cachedItems === 1 ? "" : "s"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      {readiness.online ? <Wifi className="h-3 w-3 text-positive" /> : <WifiOff className="h-3 w-3 text-negative" />}
                      <span className="text-muted-foreground">{readiness.online ? "Online" : "Offline"}</span>
                    </div>
                  </div>
                  {readiness.checkedAt && (
                    <p className="text-[10px] text-muted-foreground/70 pt-1">Checked {format(new Date(readiness.checkedAt), "dd MMM yyyy, HH:mm:ss")}</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <ImportDataModal open={importOpen} onOpenChange={setImportOpen} />
      <BackupRestoreModal open={backupOpen} onOpenChange={setBackupOpen} />
      <ConfirmDialog
        open={clearConfirm}
        onOpenChange={setClearConfirm}
        title="Clear Demo Data"
        description="This will remove all demo/sample records from every module. Your manually added data will not be affected."
        confirmLabel="Clear Demo Data"
        onConfirm={handleClearDemo}
        destructive
      />
    </div>
  );
}
