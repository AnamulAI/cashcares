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
  ChevronDown, ChevronUp, MoreHorizontal, Shield, Pencil,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { UserDetailModal, type UserDetail } from "@/components/admin/UserDetailModal";
import { EditRoleModal } from "@/components/admin/EditRoleModal";
import { UpdatePlanModal } from "@/components/admin/UpdatePlanModal";
import { AdminUpgradeRequests } from "@/components/admin/AdminUpgradeRequests";
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

interface PlanDist { free: number; monthly: number; yearly: number; lifetime: number; }

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
  status: string;
}

// ---- Component ----
export default function Admin() {
  const { isAdmin, user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [planDist, setPlanDist] = useState<PlanDist>({ free: 0, monthly: 0, yearly: 0, lifetime: 0 });
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllUsers, setShowAllUsers] = useState(false);

  // Modals
  const [detailUser, setDetailUser] = useState<UserDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [roleTarget, setRoleTarget] = useState<AdminUser | null>(null);
  const [planTarget, setPlanTarget] = useState<AdminUser | null>(null);

  useEffect(() => {
    if (!isAdmin) { navigate("/dashboard"); return; }
    loadAdminData();
  }, [isAdmin, navigate]);

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    const monthStart = startOfMonth(new Date()).toISOString();

    const [profilesRes, accountsRes, txnRes, budgetsRes, categoriesRes, remindersRes, rolesRes] = await Promise.all([
      supabase.from("profiles").select("id, full_name, email, phone, avatar_url, company_name, role_title, country, created_at, subscription_plan, status", { count: "exact" }),
      supabase.from("accounts").select("id", { count: "exact" }),
      supabase.from("transactions").select("id", { count: "exact" }),
      supabase.from("budgets").select("id", { count: "exact" }),
      supabase.from("categories").select("id", { count: "exact" }),
      supabase.from("reminders").select("id", { count: "exact" }),
      supabase.from("user_roles").select("user_id, role"),
    ]);

    const profiles = (profilesRes.data || []) as any[];
    const roles = rolesRes.data || [];
    const rolesMap: Record<string, string> = {};
    roles.forEach((r: any) => { rolesMap[r.user_id] = r.role; });

    const newThisMonth = profiles.filter(p => p.created_at >= monthStart).length;

    const dist: PlanDist = { free: 0, monthly: 0, yearly: 0, lifetime: 0 };
    profiles.forEach(p => {
      const plan = p.subscription_plan || "free";
      if (plan in dist) dist[plan as keyof PlanDist]++;
      else dist.free++;
    });

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
      id: p.id,
      full_name: p.full_name,
      email: p.email,
      phone: p.phone,
      avatar_url: p.avatar_url,
      company_name: p.company_name,
      role_title: p.role_title,
      country: p.country,
      created_at: p.created_at,
      role: rolesMap[p.id] || "user",
      plan: p.subscription_plan || "free",
      status: p.status || "active",
    })));
    setLoading(false);
  }, []);

  // ---- Handlers ----
  const handleViewUser = async (user: AdminUser) => {
    const [acRes, txRes, budRes] = await Promise.all([
      supabase.from("accounts").select("id", { count: "exact" }).eq("user_id", user.id),
      supabase.from("transactions").select("id", { count: "exact" }).eq("user_id", user.id),
      supabase.from("budgets").select("id", { count: "exact" }).eq("user_id", user.id),
    ]);
    setDetailUser({
      ...user,
      accountCount: acRes.count || 0,
      transactionCount: txRes.count || 0,
      budgetCount: budRes.count || 0,
    });
    setDetailOpen(true);
  };

  const handleRoleChange = async (newRole: string) => {
    if (!roleTarget) return;
    const { error } = await supabase
      .from("user_roles")
      .update({ role: newRole as any })
      .eq("user_id", roleTarget.id);
    if (error) {
      toast.error("Failed to update role: " + error.message);
    } else {
      toast.success(`Role updated to ${newRole}`);
      setUsers(prev => prev.map(u => u.id === roleTarget.id ? { ...u, role: newRole } : u));
    }
  };

  const handlePlanChange = async (newPlan: string, note: string) => {
    if (!planTarget) return;
    console.log("[Admin] Updating plan:", { userId: planTarget.id, field: "profiles.subscription_plan", newPlan });
    const { error, count } = await supabase
      .from("profiles")
      .update({ subscription_plan: newPlan } as any)
      .eq("id", planTarget.id)
      .select("subscription_plan")
      .then(async (res) => {
        // Verify the write by re-reading the row
        if (!res.error && res.data && res.data.length > 0) {
          const persisted = (res.data[0] as any).subscription_plan;
          console.log("[Admin] Persisted value:", persisted);
          if (persisted !== newPlan) {
            return { error: { message: "Write did not persist — value mismatch" }, count: 0 };
          }
          return { error: null, count: res.data.length };
        }
        if (!res.error && (!res.data || res.data.length === 0)) {
          return { error: { message: "No rows updated — RLS may be blocking the write" }, count: 0 };
        }
        return { error: res.error, count: 0 };
      });
    if (error) {
      toast.error("Failed to update plan: " + (error as any).message);
    } else {
      toast.success(`Subscription updated to ${newPlan}`);
      setUsers(prev => prev.map(u => u.id === planTarget.id ? { ...u, plan: newPlan } : u));
      setPlanDist(prev => {
        const next = { ...prev };
        const oldPlan = planTarget.plan as keyof PlanDist;
        const np = newPlan as keyof PlanDist;
        if (oldPlan in next) next[oldPlan]--;
        if (np in next) next[np]++;
        return next;
      });
    }
  };

  if (!isAdmin) return null;

  const summaryCards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-primary" },
    { label: "New This Month", value: stats?.newUsersThisMonth ?? 0, icon: UserPlus, color: "text-positive" },
    { label: "Premium Users", value: (planDist.monthly + planDist.yearly + planDist.lifetime), icon: Crown, color: "text-feature-subscription" },
    { label: "Total Accounts", value: stats?.totalAccounts ?? 0, icon: Wallet, color: "text-feature-accounts" },
    { label: "Total Transactions", value: stats?.totalTransactions ?? 0, icon: ArrowLeftRight, color: "text-feature-transactions" },
    { label: "Total Budgets", value: stats?.totalBudgets ?? 0, icon: CreditCard, color: "text-feature-budgets" },
    { label: "Total Categories", value: stats?.totalCategories ?? 0, icon: Database, color: "text-feature-categories" },
    { label: "Revenue", value: "—", icon: TrendingUp, color: "text-warning", sub: "Coming soon" },
  ];

  const displayedUsers = showAllUsers ? users : users.slice(0, 10);

  const planBadgeVariant = (plan: string) => plan !== "free" ? "default" as const : "outline" as const;
  const statusColor = (s: string) => s === "active" ? "text-positive" : s === "suspended" ? "text-warning" : "text-muted-foreground";

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
                      <s.icon className={`h-4 w-4 ${s.color}`} />
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
            </CardContent>
          </Card>

          {/* Upgrade Requests */}
          <AdminUpgradeRequests
            users={users}
            onPlanActivated={(userId, newPlan) => {
              setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan: newPlan } : u));
              const old = users.find(u => u.id === userId)?.plan || "free";
              setPlanDist(prev => {
                const next = { ...prev };
                if (old in next) next[old as keyof PlanDist]--;
                if (newPlan in next) next[newPlan as keyof PlanDist]++;
                return next;
              });
            }}
          />

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
                      <th className="text-center py-2 text-[11px] font-medium text-muted-foreground hidden md:table-cell">Plan</th>
                      <th className="text-center py-2 text-[11px] font-medium text-muted-foreground hidden lg:table-cell">Status</th>
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
                            <Badge variant={u.role === "admin" ? "default" : "secondary"} className="text-[10px]">{u.role}</Badge>
                          </td>
                          <td className="py-2.5 text-center hidden md:table-cell">
                            <Badge variant={planBadgeVariant(u.plan)} className="text-[10px]">{u.plan}</Badge>
                          </td>
                          <td className="py-2.5 text-center hidden lg:table-cell">
                            <span className={`text-[10px] font-medium ${statusColor(u.status)}`}>{u.status}</span>
                          </td>
                          <td className="py-2.5 text-xs text-muted-foreground text-center hidden sm:table-cell">
                            {new Date(u.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-2.5 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuItem className="gap-2 text-xs cursor-pointer" onClick={() => handleViewUser(u)}>
                                  <Eye className="h-3.5 w-3.5" /> View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 text-xs cursor-pointer" onClick={() => setRoleTarget(u)}>
                                  <Shield className="h-3.5 w-3.5" /> Edit Role
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 text-xs cursor-pointer" onClick={() => setPlanTarget(u)}>
                                  <Crown className="h-3.5 w-3.5" /> Update Plan
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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

      {/* Modals */}
      <UserDetailModal
        user={detailUser}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEditRole={() => { if (detailUser) setRoleTarget(detailUser as any); }}
        onEditPlan={() => { if (detailUser) setPlanTarget(detailUser as any); }}
      />

      <EditRoleModal
        open={!!roleTarget}
        onOpenChange={(o) => { if (!o) setRoleTarget(null); }}
        userName={roleTarget?.full_name || roleTarget?.email || "User"}
        currentRole={roleTarget?.role || "user"}
        onConfirm={handleRoleChange}
        isSelf={roleTarget?.id === currentUser?.id}
      />

      <UpdatePlanModal
        open={!!planTarget}
        onOpenChange={(o) => { if (!o) setPlanTarget(null); }}
        userName={planTarget?.full_name || planTarget?.email || "User"}
        currentPlan={planTarget?.plan || "free"}
        onConfirm={handlePlanChange}
      />
    </div>
  );
}
