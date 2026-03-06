import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Phone, MapPin, Building2, Briefcase, CreditCard, Edit, CheckCircle2 } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { useAccounts } from "@/hooks/use-accounts";
import { useTransactions } from "@/hooks/use-transactions";
import { useCategories } from "@/hooks/use-categories";
import { useBudgets } from "@/hooks/use-budgets";
import { useTranslation } from "@/i18n/useTranslation";
import { formatNumber } from "@/lib/formatters";

export default function Profile() {
  const [editOpen, setEditOpen] = useState(false);
  const { plan, isPremium } = useAppContext();
  const { t, lang } = useTranslation();
  const { data: accounts = [] } = useAccounts();
  const { data: transactions = [] } = useTransactions();
  const { data: categories = [] } = useCategories();
  const { data: budgets = [] } = useBudgets();

  const fmtNum = (n: number) => formatNumber(n, lang);

  // Dynamic profile data
  const profileData = {
    name: "Rafiq Ahmed",
    email: "rafiq@cashcare.app",
    phone: "+880 1712-345678",
    address: "Dhaka, Bangladesh",
    company: "CashCare Inc.",
    role: t("profile.businessOwner"),
    orgType: t("profile.smallBusiness"),
    salary: "—",
    country: "Bangladesh",
    state: "Dhaka Division",
    memberSince: "March 2026",
    workspace: t("profile.personal"),
  };

  const planLabels: Record<string, string> = {
    free: t("subscription.freePlan"),
    monthly: t("subscription.monthlyPremium"),
    yearly: t("subscription.yearlyPremium"),
    lifetime: t("subscription.lifetimePremium"),
  };

  const completionFields = [
    { label: t("profile.fullName"), done: true },
    { label: t("profile.email"), done: true },
    { label: t("profile.phone"), done: true },
    { label: t("profile.address"), done: true },
    { label: t("profile.company"), done: true },
    { label: t("profile.salary"), done: false },
    { label: t("profile.photo"), done: false },
  ];

  const completedCount = completionFields.filter(f => f.done).length;
  const completionPct = Math.round((completedCount / completionFields.length) * 100);

  return (
    <div className="space-y-6">
      <PageHeader title={t("profile.title")} subtitle={t("profile.subtitle")} />

      <Card className="finance-card-static">
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-6">
          <Avatar className="h-20 w-20 text-2xl">
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">RA</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold font-display tracking-tight">{profileData.name}</h2>
            <p className="text-sm text-muted-foreground">{profileData.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge variant="secondary" className="text-[10px]">{profileData.role}</Badge>
              <Badge variant="outline" className="text-[10px]">{profileData.workspace}</Badge>
              <Badge variant={isPremium ? "default" : "secondary"} className="text-[10px]">{planLabels[plan]}</Badge>
            </div>
          </div>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs shrink-0" onClick={() => setEditOpen(true)}>
            <Edit className="h-3.5 w-3.5" /> {t("profile.editProfile")}
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Card className="finance-card-static">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><User className="h-4 w-4 text-primary" /> {t("profile.personalInfo")}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: User, label: t("profile.fullName"), value: profileData.name },
                { icon: Mail, label: t("profile.email"), value: profileData.email },
                { icon: Phone, label: t("profile.phone"), value: profileData.phone },
                { icon: MapPin, label: t("profile.address"), value: profileData.address },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent shrink-0 mt-0.5">
                    <f.icon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">{f.label}</p>
                    <p className="text-sm font-medium truncate">{f.value}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="finance-card-static">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><Briefcase className="h-4 w-4 text-primary" /> {t("profile.professionalInfo")}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: Building2, label: t("profile.company"), value: profileData.company },
                { icon: Briefcase, label: t("profile.role"), value: profileData.role },
                { icon: Building2, label: t("profile.orgType"), value: profileData.orgType },
                { icon: CreditCard, label: t("profile.salary"), value: profileData.salary },
                { icon: MapPin, label: t("profile.country"), value: profileData.country },
                { icon: MapPin, label: t("profile.state"), value: profileData.state },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent shrink-0 mt-0.5">
                    <f.icon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">{f.label}</p>
                    <p className="text-sm font-medium truncate">{f.value}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="finance-card-static">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">{t("profile.accountSummary")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: t("profile.plan"), value: planLabels[plan] },
                { label: t("profile.memberSince"), value: profileData.memberSince },
                { label: t("profile.workspace"), value: profileData.workspace },
                { label: t("profile.totalAccounts"), value: fmtNum(accounts.length) },
                { label: t("profile.totalTransactions"), value: fmtNum(transactions.length) },
                { label: t("profile.totalCategories"), value: fmtNum(categories.length) },
                { label: t("profile.activeBudgets"), value: fmtNum(budgets.length) },
              ].map((f, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{f.label}</span>
                    <span className="text-xs font-semibold">{f.value}</span>
                  </div>
                  {i < 6 && <Separator className="mt-3" />}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="finance-card-static">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">{t("profile.profileCompletion")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-display text-primary">{fmtNum(completionPct)}%</span>
                <span className="text-xs text-muted-foreground">{fmtNum(completedCount)}/{fmtNum(completionFields.length)} {t("profile.fields")}</span>
              </div>
              <Progress value={completionPct} className="h-2" />
              <div className="space-y-1.5 pt-1">
                {completionFields.map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className={`h-3.5 w-3.5 ${f.done ? "text-positive" : "text-muted-foreground/30"}`} />
                    <span className={`text-xs ${f.done ? "text-foreground" : "text-muted-foreground"}`}>{f.label}</span>
                  </div>
                ))}
              </div>
              {completionPct < 100 && (
                <Button size="sm" variant="outline" className="w-full text-xs mt-2" onClick={() => setEditOpen(true)}>{t("profile.completeProfile")}</Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("profile.editProfile")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{t("profile.personalSection")}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs">{t("profile.fullName")}</Label><Input defaultValue={profileData.name} className="h-9 text-sm" /></div>
              <div className="space-y-1.5"><Label className="text-xs">{t("profile.email")}</Label><Input defaultValue={profileData.email} className="h-9 text-sm" /></div>
              <div className="space-y-1.5"><Label className="text-xs">{t("profile.phone")}</Label><Input defaultValue={profileData.phone} className="h-9 text-sm" /></div>
              <div className="space-y-1.5"><Label className="text-xs">{t("profile.address")}</Label><Input defaultValue={profileData.address} className="h-9 text-sm" /></div>
            </div>
            <Separator />
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{t("profile.professionalSection")}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs">{t("profile.company")}</Label><Input defaultValue={profileData.company} className="h-9 text-sm" /></div>
              <div className="space-y-1.5"><Label className="text-xs">{t("profile.role")}</Label><Input defaultValue={profileData.role} className="h-9 text-sm" /></div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t("profile.orgType")}</Label>
                <Select defaultValue="small_business">
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">{t("profile.individual")}</SelectItem>
                    <SelectItem value="small_business">{t("profile.smallBusiness")}</SelectItem>
                    <SelectItem value="enterprise">{t("profile.enterprise")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">{t("profile.salary")}</Label><Input placeholder={t("profile.optional")} className="h-9 text-sm" /></div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t("profile.country")}</Label>
                <Select defaultValue="bd">
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bd">Bangladesh</SelectItem>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">{t("profile.state")}</Label><Input defaultValue={profileData.state} className="h-9 text-sm" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditOpen(false)}>{t("action.cancel")}</Button>
            <Button size="sm" onClick={() => setEditOpen(false)}>{t("action.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
