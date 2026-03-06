import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Globe, Bell, Palette, Shield, Database, Download, Upload, RefreshCw, Monitor, Sun, Moon } from "lucide-react";
import { useAppContext, CURRENCIES } from "@/contexts/AppContext";
import { useTransactions } from "@/hooks/use-transactions";
import { useAccounts } from "@/hooks/use-accounts";
import { useCategories } from "@/hooks/use-categories";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Settings() {
  const { currency, setCurrency, settings, updateSettings } = useAppContext();
  const { data: transactions = [] } = useTransactions();
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();

  const toggleNotif = (key: keyof typeof settings.notifications) => {
    updateSettings({ notifications: { ...settings.notifications, [key]: !settings.notifications[key] } });
  };

  const exportAllData = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      accounts,
      categories,
      transactions,
    };
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
      <PageHeader title="Settings" subtitle="Manage preferences, security, and application behavior" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* General Preferences */}
        <Card className="finance-card-static">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> General Preferences</CardTitle>
            <CardDescription className="text-xs">Locale and regional settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-medium">Currency</Label>
                <p className="text-[11px] text-muted-foreground">Display currency across the app</p>
              </div>
              <Select value={currency.code} onValueChange={v => { const c = CURRENCIES.find(x => x.code === v); if (c) setCurrency(c); }}>
                <SelectTrigger className="w-[100px] h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(c => <SelectItem key={c.code} value={c.code}>{c.symbol} {c.code}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-medium">Language</Label>
                <p className="text-[11px] text-muted-foreground">Interface language</p>
              </div>
              <Select value={settings.language} onValueChange={v => updateSettings({ language: v })}>
                <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="bn">বাংলা</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-medium">Date Format</Label>
                <p className="text-[11px] text-muted-foreground">How dates appear across the app</p>
              </div>
              <Select value={settings.dateFormat} onValueChange={v => updateSettings({ dateFormat: v })}>
                <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                  <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                  <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-medium">Timezone</Label>
                <p className="text-[11px] text-muted-foreground">Used for date/time calculations</p>
              </div>
              <Select value={settings.timezone} onValueChange={v => updateSettings({ timezone: v })}>
                <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dhaka">Asia/Dhaka (GMT+6)</SelectItem>
                  <SelectItem value="utc">UTC</SelectItem>
                  <SelectItem value="est">US/Eastern</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="finance-card-static">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><Bell className="h-4 w-4 text-primary" /> Notifications</CardTitle>
            <CardDescription className="text-xs">Control what alerts you receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {([
              { key: "email" as const, label: "Email Notifications", desc: "Receive weekly summaries via email" },
              { key: "budgetThreshold" as const, label: "Budget Threshold Alerts", desc: "Notify when spending nears limits" },
              { key: "receivableReminder" as const, label: "Receivable Reminders", desc: "Alerts for outstanding receivables" },
              { key: "payableReminder" as const, label: "Payable Reminders", desc: "Alerts for upcoming payables" },
              { key: "loanDue" as const, label: "Loan Due Reminders", desc: "Notifications for loan repayments" },
            ]).map((item, i) => (
              <div key={item.key}>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs font-medium">{item.label}</Label>
                    <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                  </div>
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
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><Palette className="h-4 w-4 text-primary" /> Appearance</CardTitle>
            <CardDescription className="text-xs">Customize the look and feel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs font-medium mb-2 block">Theme</Label>
              <div className="flex gap-2">
                {([
                  { value: "light" as const, icon: Sun, label: "Light" },
                  { value: "dark" as const, icon: Moon, label: "Dark" },
                  { value: "system" as const, icon: Monitor, label: "System" },
                ]).map(t => (
                  <Button
                    key={t.value}
                    variant={settings.theme === t.value ? "default" : "outline"}
                    size="sm"
                    className="gap-1.5 text-xs flex-1"
                    onClick={() => updateSettings({ theme: t.value })}
                  >
                    <t.icon className="h-3.5 w-3.5" /> {t.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="finance-card-static">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Security</CardTitle>
            <CardDescription className="text-xs">Account protection settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-medium">Change Password</Label>
                <p className="text-[11px] text-muted-foreground">Update your account password</p>
              </div>
              <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => toast.info("Password change requires authentication to be set up first.")}>Change</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-medium">Two-Factor Authentication</Label>
                <p className="text-[11px] text-muted-foreground">Add an extra layer of security</p>
              </div>
              <Badge variant="secondary" className="text-[10px]">Coming Soon</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-medium">Session Activity</Label>
                <p className="text-[11px] text-muted-foreground">View active login sessions</p>
              </div>
              <Badge variant="secondary" className="text-[10px]">Coming Soon</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Data & Export */}
        <Card className="finance-card-static lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><Database className="h-4 w-4 text-primary" /> Data & Export</CardTitle>
            <CardDescription className="text-xs">Manage your financial data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-1.5 text-xs" onClick={exportAllData}>
                <Download className="h-5 w-5 text-primary" />
                <span className="font-medium">Export All Data</span>
                <span className="text-[10px] text-muted-foreground">Download your data as JSON</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-1.5 text-xs" disabled>
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Import Data</span>
                <span className="text-[10px] text-muted-foreground">Coming Soon</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-1.5 text-xs" disabled>
                <RefreshCw className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Backup & Restore</span>
                <span className="text-[10px] text-muted-foreground">Coming Soon</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
