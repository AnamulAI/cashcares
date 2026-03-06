import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Phone, MapPin, Building2, Briefcase, CreditCard, Edit, CheckCircle2, Camera, Trash2, Loader2 } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useAccounts } from "@/hooks/use-accounts";
import { useTransactions } from "@/hooks/use-transactions";
import { useCategories } from "@/hooks/use-categories";
import { useBudgets } from "@/hooks/use-budgets";
import { useTranslation } from "@/i18n/useTranslation";
import { formatNumber } from "@/lib/formatters";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function Profile() {
  const [editOpen, setEditOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { plan, isPremium } = useAppContext();
  const { profile, refreshProfile, user } = useAuth();
  const { t, lang } = useTranslation();
  const { data: accounts = [] } = useAccounts();
  const { data: transactions = [] } = useTransactions();
  const { data: categories = [] } = useCategories();
  const { data: budgets = [] } = useBudgets();

  const fmtNum = (n: number) => formatNumber(n, lang);

  const [form, setForm] = useState({
    full_name: profile?.full_name || "",
    email: profile?.email || user?.email || "",
    phone: profile?.phone || "",
    address: profile?.address || "",
    company_name: profile?.company_name || "",
    role_title: profile?.role_title || "",
    organization_type: profile?.organization_type || "small_business",
    country: profile?.country || "Bangladesh",
    state_division: profile?.state_division || "",
  });
  const [saving, setSaving] = useState(false);

  const handleEditOpen = () => {
    setForm({
      full_name: profile?.full_name || "",
      email: profile?.email || user?.email || "",
      phone: profile?.phone || "",
      address: profile?.address || "",
      company_name: profile?.company_name || "",
      role_title: profile?.role_title || "",
      organization_type: profile?.organization_type || "small_business",
      country: profile?.country || "Bangladesh",
      state_division: profile?.state_division || "",
    });
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name || null,
        email: form.email || null,
        phone: form.phone || null,
        address: form.address || null,
        company_name: form.company_name || null,
        role_title: form.role_title || null,
        organization_type: form.organization_type || null,
        country: form.country || null,
        state_division: form.state_division || null,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Failed to save profile");
    } else {
      await refreshProfile();
      toast.success(t("action.saved") || "Profile saved!");
      setEditOpen(false);
    }
  };

  // --- Avatar upload ---
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Please upload a JPG, PNG, WebP, or GIF image.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image must be under 2MB.");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const filePath = `${user.id}/avatar.${ext}`;

    // Remove old avatar files first
    const { data: existing } = await supabase.storage.from("avatars").list(user.id);
    if (existing && existing.length > 0) {
      await supabase.storage.from("avatars").remove(existing.map(f => `${user.id}/${f.name}`));
    }

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      toast.error("Upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const avatarUrl = urlData.publicUrl + "?t=" + Date.now(); // cache bust

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", user.id);

    if (updateError) {
      toast.error("Failed to save avatar URL");
    } else {
      await refreshProfile();
      toast.success("Profile picture updated!");
    }
    setUploading(false);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;
    setUploading(true);

    const { data: existing } = await supabase.storage.from("avatars").list(user.id);
    if (existing && existing.length > 0) {
      await supabase.storage.from("avatars").remove(existing.map(f => `${user.id}/${f.name}`));
    }

    await supabase.from("profiles").update({ avatar_url: null }).eq("id", user.id);
    await refreshProfile();
    toast.success("Profile picture removed");
    setUploading(false);
  };

  const displayName = profile?.full_name || "User";
  const displayEmail = profile?.email || user?.email || "";
  const initials = displayName.split(" ").map(w => w.charAt(0)).slice(0, 2).join("").toUpperCase() || "U";

  const planLabels: Record<string, string> = {
    free: t("subscription.freePlan"),
    monthly: t("subscription.monthlyPremium"),
    yearly: t("subscription.yearlyPremium"),
    lifetime: t("subscription.lifetimePremium"),
  };

  const completionFields = [
    { label: t("profile.fullName"), done: !!profile?.full_name },
    { label: t("profile.email"), done: !!profile?.email },
    { label: t("profile.phone"), done: !!profile?.phone },
    { label: t("profile.address"), done: !!profile?.address },
    { label: t("profile.company"), done: !!profile?.company_name },
    { label: t("profile.photo"), done: !!profile?.avatar_url },
  ];

  const completedCount = completionFields.filter(f => f.done).length;
  const completionPct = Math.round((completedCount / completionFields.length) * 100);

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "—";

  return (
    <div className="space-y-6">
      <PageHeader title={t("profile.title")} subtitle={t("profile.subtitle")} />

      <Card className="finance-card-static">
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-6">
          {/* Avatar with upload overlay */}
          <div className="relative group">
            <Avatar className="h-20 w-20 text-2xl">
              {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">{initials}</AvatarFallback>
            </Avatar>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleAvatarUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
            >
              {uploading ? (
                <Loader2 className="h-5 w-5 text-white animate-spin" />
              ) : (
                <Camera className="h-5 w-5 text-white" />
              )}
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold font-display tracking-tight">{displayName}</h2>
            <p className="text-sm text-muted-foreground">{displayEmail}</p>
            <div className="flex items-center gap-2 mt-1.5">
              {profile?.role_title && <Badge variant="secondary" className="text-[10px]">{profile.role_title}</Badge>}
              <Badge variant="outline" className="text-[10px]">{t("profile.personal")}</Badge>
              <Badge variant={isPremium ? "default" : "secondary"} className="text-[10px]">{planLabels[plan]}</Badge>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Button size="sm" variant="ghost" className="h-7 text-[11px] gap-1 px-2" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                <Camera className="h-3 w-3" /> Change Photo
              </Button>
              {profile?.avatar_url && (
                <Button size="sm" variant="ghost" className="h-7 text-[11px] gap-1 px-2 text-destructive hover:text-destructive" onClick={handleRemoveAvatar} disabled={uploading}>
                  <Trash2 className="h-3 w-3" /> Remove
                </Button>
              )}
            </div>
          </div>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs shrink-0" onClick={handleEditOpen}>
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
                { icon: User, label: t("profile.fullName"), value: profile?.full_name || "—" },
                { icon: Mail, label: t("profile.email"), value: displayEmail || "—" },
                { icon: Phone, label: t("profile.phone"), value: profile?.phone || "—" },
                { icon: MapPin, label: t("profile.address"), value: profile?.address || "—" },
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
                { icon: Building2, label: t("profile.company"), value: profile?.company_name || "—" },
                { icon: Briefcase, label: t("profile.role"), value: profile?.role_title || "—" },
                { icon: Building2, label: t("profile.orgType"), value: profile?.organization_type || "—" },
                { icon: MapPin, label: t("profile.country"), value: profile?.country || "—" },
                { icon: MapPin, label: t("profile.state"), value: profile?.state_division || "—" },
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
                { label: t("profile.memberSince"), value: memberSince },
                { label: t("profile.workspace"), value: t("profile.personal") },
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
                <Button size="sm" variant="outline" className="w-full text-xs mt-2" onClick={handleEditOpen}>{t("profile.completeProfile")}</Button>
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
              <div className="space-y-1.5">
                <Label className="text-xs">{t("profile.fullName")}</Label>
                <Input value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t("profile.email")}</Label>
                <Input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t("profile.phone")}</Label>
                <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t("profile.address")}</Label>
                <Input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} className="h-9 text-sm" />
              </div>
            </div>
            <Separator />
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{t("profile.professionalSection")}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">{t("profile.company")}</Label>
                <Input value={form.company_name} onChange={e => setForm(p => ({ ...p, company_name: e.target.value }))} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t("profile.role")}</Label>
                <Input value={form.role_title} onChange={e => setForm(p => ({ ...p, role_title: e.target.value }))} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t("profile.orgType")}</Label>
                <Select value={form.organization_type} onValueChange={v => setForm(p => ({ ...p, organization_type: v }))}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">{t("profile.individual")}</SelectItem>
                    <SelectItem value="small_business">{t("profile.smallBusiness")}</SelectItem>
                    <SelectItem value="enterprise">{t("profile.enterprise")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t("profile.country")}</Label>
                <Select value={form.country} onValueChange={v => setForm(p => ({ ...p, country: v }))}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bangladesh">Bangladesh</SelectItem>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    <SelectItem value="India">India</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label className="text-xs">{t("profile.state")}</Label>
                <Input value={form.state_division} onChange={e => setForm(p => ({ ...p, state_division: e.target.value }))} className="h-9 text-sm" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditOpen(false)}>{t("action.cancel")}</Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : t("action.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
