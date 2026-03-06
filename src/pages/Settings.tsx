import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Globe, Bell, Palette, Shield, Database, Download, Upload, RefreshCw, Monitor, Sun, Moon, FlaskConical, Trash2 } from "lucide-react";
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
              <Select value={settings.dateFormat} onValueChange={handleDateFormatChange}><SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="dmy">DD/MM/YYYY</SelectItem><SelectItem value="mdy">MM/DD/YYYY</SelectItem><SelectItem value="ymd">YYYY-MM-DD</SelectItem></SelectContent></Select>
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
