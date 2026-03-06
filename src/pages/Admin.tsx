import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Users, CreditCard, ArrowLeftRight, Wallet, ShieldCheck, Eye,
  UserPlus, TrendingUp, Crown, Activity, Database, Bell, HardDrive,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { UserDetailModal } from "@/components/admin/UserDetailModal";
import { toast } from "sonner";
import { startOfMonth } from "date-fns";

// ---- Types ----
interface AdminStats {
  totalUsers: number;
  totalAccounts: number;
  totalTransactions: number;
  totalBudgets: number;
  totalCategories: number;
  totalReminders: number;
  newUsersThisMonth: number;
}

interface PlanDist {
  free: number;
  monthly: number;
  yearly: number;
  lifetime: number;
}

interface AdminUser {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  company_name: string | null;
  role_title: string | null;
  country: string | null;
  created_at: string;
  role: string;
  plan: string;
}

// ---- Component ----
export default function Admin() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [planDist, setPlanDist] = useState<PlanDist>({ free: 0, monthly: 0, yearly: 0, lifetime: 0 });
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [roleConfirm, setRoleConfirm] = useState<{ userId: string; newRole: string } | null>(null);
  const [showAllUsers, setShowAllUsers] = useState(false);

  useEffect(() => {
    if (!isAdmin) { navigate("/dashboard"); return; }
    loadAdminData();
  }, [isAdmin, navigate]);

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    const monthStart = startOfMonth(new Date()).toISOString();

    const [profilesRes, accountsRes, txnRes, budgetsRes, categoriesRes, remindersRes, rolesRes] = await Promise.all([
      supabase.from("profiles").select("id, full_name, email, phone, avatar_url, company_name, role_title, country, created_at", { count: "exact" }),
      supabase.from("accounts").select("id", { count: "exact" }),
      supabase.from("transactions").select("id", { count: "exact" }),
      supabase.from("budgets").select("id", { count: "exact" }),
      supabase.from("categories").select("id", { count: "exact" }),
      supabase.from("reminders").select("id", { count: "exact" }),
      supabase.from("user_roles").select("user_id, role"),
    ]);

    const profiles = profilesRes.data || [];
    const roles = rolesRes.data || [];
    const rolesMap: Record<string, string> = {};
    roles.forEach((r: any) => { rolesMap[r.user_id] = r.role; });

    const newThisMonth = profiles.filter(p => p.created_at >= monthStart).length;

    // Plan distribution is placeholder since plans are stored client-side
    // In a real app this would come from a subscriptions table
    const dist: PlanDist = { free: profiles.length, monthly: 0, yearly: 0, lifetime: 0 };

    setStats({
      totalUsers: profilesRes.count || 0,
      totalAccounts: accountsRes.count || 0,
      totalTransactions: txnRes.count || 0,
      totalBudgets: budgetsRes.count || 0,
      totalCategories: categoriesRes.count || 0,
      totalReminders: remindersRes.count || 0,
      newUsersThisMonth: newThisMonth,
    });

    setPlanDist(dist);

    setUsers(profiles.map(p => ({
      ...p,
      role: rolesMap[p.id] || "user",
      plan: "free", // placeholder until subscriptions are DB-backed
    })));

    setLoading(false);
  }, []);

  const handleViewUser = async (user: AdminUser) => {
    // Load per-user stats
    const [acRes, txRes, budRes] = await Promise.all([
      supabase.from("accounts").select("id", { count: "exact" }).eq("user_id", user.id),
      supabase.from("transactions").select("id", { count: "exact" }).eq("user_id", user.id),
      supabase.from("budgets").select("id", { count: "exact" }).eq("user_id", user.id),
    ]);
    setSelectedUser({
      ...user,
      accountCount: acRes.count || 0,
      transactionCount: txRes.count || 0,
      budgetCount: budRes.count || 0,
    });
    setDetailOpen(true);
  };

  const handleChangeRole = async () => {
    if (!roleConfirm) return;
    const { userId, newRole } = roleConfirm;
    // Upsert role
    const { error } = await supabase
      .from("user_roles")
      .update({ role: newRole as any })
      .eq("user_id", userId);
    if (error) {
      toast.error("Failed to update role: " + error.message);
    } else {
      toast.success(`Role updated to ${newRole}`);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    }
    setRoleConfirm(null);
  };

  if (!isAdmin) return null;

  const summaryCards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-primary" },
    { label: "New This Month", value: stats?.newUsersThisMonth ?? 0, icon: UserPlus, color: "text-positive" },
    { label: "Total Accounts", value: stats?.totalAccounts ?? 0, icon: Wallet, color: "text-feature-accounts" },
    { label: "Total Transactions", value: stats?.totalTransactions ?? 0, icon: ArrowLeftRight, color: "text-feature-transactions" },
    { label: "Total Budgets", value: stats?.totalBudgets ?? 0, icon: CreditCard, color: "text-feature-budgets" },
    { label: "Total Categories", value: stats?.totalCategories ?? 0, icon: Database, color: "text-feature-categories" },
    { label: "Reminders", value: stats?.totalReminders ?? 0, icon: Bell, color: "text-feature-reminders" },
    { label: "Revenue", value: "—", icon: TrendingUp, color: "text-warning", sub: "Coming soon" },
  ];

  const displayedUsers = showAllUsers ? users : users.slice(0, 10);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        subtitle="System overview and user management"
        actions={<Badge className="gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Admin</Badge>}
      />

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {summaryCards.map(s => (
              <Card key={s.label} className="finance-card-static">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
                      <s.icon className={`h-4.5 w-4.5 ${s.color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">{s.label}</p>
                      <p className="text-xl font-bold font-display">{s.value}</p>
                      {s.sub && <p className="text-[10px] text-muted-foreground">{s.sub}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Plan distribution */}
          <Card className="finance-card-static">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Crown className="h-4 w-4 text-feature-subscription" /> Subscription Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {([
                  { label: "Free", count: planDist.free, color: "bg-muted-foreground/20" },
                  { label: "Monthly", count: planDist.monthly, color: "bg-primary/20" },
                  { label: "Yearly", count: planDist.yearly, color: "bg-positive/20" },
                  { label: "Lifetime", count: planDist.lifetime, color: "bg-warning/20" },
                ] as const).map(p => (
                  <div key={p.label} className={`rounded-lg p-3 text-center ${p.color}`}>
                    <p className="text-2xl font-bold font-display">{p.count}</p>
                    <p className="text-[11px] text-muted-foreground">{p.label}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-3 text-center">Plan data will be fully accurate once subscriptions are stored in the database.</p>
            </CardContent>
          </Card>

          {/* User management table */}
          <Card className="finance-card-static">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> User Management
                <Badge variant="secondary" className="text-[10px] ml-auto">{users.length} users</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-[11px] font-medium text-muted-foreground">User</th>
                      <th className="text-left py-2 text-[11px] font-medium text-muted-foreground hidden sm:table-cell">Email</th>
                      <th className="text-center py-2 text-[11px] font-medium text-muted-foreground">Role</th>
                      <th className="text-center py-2 text-[11px] font-medium text-muted-foreground hidden sm:table-cell">Joined</th>
                      <th className="text-right py-2 text-[11px] font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedUsers.map(u => {
                      const initial = (u.full_name || u.email || "?").charAt(0).toUpperCase();
                      return (
                        <tr key={u.id} className="border-b border-border/50 last:border-0 hover:bg-accent/30 transition-colors">
                          <td className="py-2.5">
                            <div className="flex items-center gap-2.5">
                              {u.avatar_url ? (
                                <img src={u.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover" />
                              ) : (
                                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary">{initial}</div>
                              )}
                              <span className="text-xs font-medium truncate max-w-[120px]">{u.full_name || "No name"}</span>
                            </div>
                          </td>
                          <td className="py-2.5 text-xs text-muted-foreground hidden sm:table-cell truncate max-w-[160px]">{u.email}</td>
                          <td className="py-2.5 text-center">
                            <Select
                              value={u.role}
                              onValueChange={(val) => setRoleConfirm({ userId: u.id, newRole: val })}
                            >
                              <SelectTrigger className="h-6 text-[10px] w-20 mx-auto">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">user</SelectItem>
                                <SelectItem value="admin">admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="py-2.5 text-xs text-muted-foreground text-center hidden sm:table-cell">
                            {new Date(u.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-2.5 text-right">
                            <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1" onClick={() => handleViewUser(u)}>
                              <Eye className="h-3.5 w-3.5" /> View
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {users.length > 10 && (
                <Button variant="ghost" size="sm" className="w-full mt-2 text-xs gap-1" onClick={() => setShowAllUsers(!showAllUsers)}>
                  {showAllUsers ? <><ChevronUp className="h-3.5 w-3.5" /> Show Less</> : <><ChevronDown className="h-3.5 w-3.5" /> Show All ({users.length})</>}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* System overview */}
          <Card className="finance-card-static">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-positive" /> System Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Data Records", value: (stats?.totalAccounts ?? 0) + (stats?.totalTransactions ?? 0) + (stats?.totalBudgets ?? 0) + (stats?.totalCategories ?? 0), icon: Database },
                  { label: "Backup Status", value: "OK", icon: HardDrive, sub: "Auto-managed by Supabase" },
                  { label: "Support Tickets", value: "—", icon: Bell, sub: "Coming soon" },
                ].map(s => (
                  <div key={s.label} className="rounded-lg bg-accent/40 p-4">
                    <s.icon className="h-4 w-4 text-muted-foreground mb-2" />
                    <p className="text-lg font-bold font-display">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                    {s.sub && <p className="text-[10px] text-muted-foreground/60 mt-0.5">{s.sub}</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* User detail modal */}
      <UserDetailModal user={selectedUser} open={detailOpen} onOpenChange={setDetailOpen} />

      {/* Role change confirmation */}
      <ConfirmDialog
        open={!!roleConfirm}
        onOpenChange={(open) => { if (!open) setRoleConfirm(null); }}
        title="Change User Role"
        description={`Change this user's role to "${roleConfirm?.newRole}"? This will affect their access permissions.`}
        onConfirm={handleChangeRole}
        confirmLabel="Confirm Change"
        destructive={false}
      />
    </div>
  );
}
