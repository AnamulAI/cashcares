import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Users, CreditCard, ArrowLeftRight, Wallet, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminStats {
  totalUsers: number;
  totalAccounts: number;
  totalTransactions: number;
}

export default function Admin() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/dashboard");
      return;
    }
    loadAdminData();
  }, [isAdmin, navigate]);

  const loadAdminData = async () => {
    setLoading(true);
    const [profilesRes, accountsRes, txnRes] = await Promise.all([
      supabase.from("profiles").select("id, full_name, email, created_at", { count: "exact" }),
      supabase.from("accounts").select("id", { count: "exact" }),
      supabase.from("transactions").select("id", { count: "exact" }),
    ]);

    setStats({
      totalUsers: profilesRes.count || 0,
      totalAccounts: accountsRes.count || 0,
      totalTransactions: txnRes.count || 0,
    });
    setUsers((profilesRes.data || []).slice(0, 20));
    setLoading(false);
  };

  if (!isAdmin) return null;

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-primary" },
    { label: "Total Accounts", value: stats?.totalAccounts ?? 0, icon: Wallet, color: "text-feature-accounts" },
    { label: "Total Transactions", value: stats?.totalTransactions ?? 0, icon: ArrowLeftRight, color: "text-feature-transactions" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        subtitle="System overview and user management"
        actions={<Badge className="gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Admin</Badge>}
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {statCards.map(s => (
              <Card key={s.label} className="finance-card-static">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center">
                      <s.icon className={`h-5 w-5 ${s.color}`} />
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
                      <p className="text-2xl font-bold font-display">{s.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="finance-card-static">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> Recent Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No users found</p>
              ) : (
                <div className="space-y-2">
                  {users.map(u => (
                    <div key={u.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-accent/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {(u.full_name || u.email || "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{u.full_name || "No name"}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
