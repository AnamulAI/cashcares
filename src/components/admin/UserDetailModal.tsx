import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, Calendar, Wallet, ArrowLeftRight, CreditCard, Shield, MapPin, Building2, Crown } from "lucide-react";

export interface UserDetail {
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
  accountCount: number;
  transactionCount: number;
  budgetCount: number;
}

interface UserDetailModalProps {
  user: UserDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditRole?: () => void;
  onEditPlan?: () => void;
}

const statusColors: Record<string, string> = {
  active: "text-positive",
  suspended: "text-warning",
  inactive: "text-muted-foreground",
};

export function UserDetailModal({ user, open, onOpenChange, onEditRole, onEditPlan }: UserDetailModalProps) {
  if (!user) return null;

  const initial = (user.full_name || user.email || "?").charAt(0).toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">User Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Profile header */}
          <div className="flex items-center gap-4">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="" className="h-14 w-14 rounded-full object-cover" />
            ) : (
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                {initial}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{user.full_name || "No name"}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-[10px] gap-1">
                  <Shield className="h-3 w-3" /> {user.role}
                </Badge>
                <Badge variant={user.plan !== "free" ? "default" : "outline"} className="text-[10px] gap-1">
                  <Crown className="h-3 w-3" /> {user.plan}
                </Badge>
                <Badge variant="outline" className={`text-[10px] ${statusColors[user.status] || ""}`}>
                  {user.status}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Info rows */}
          <div className="space-y-2.5">
            {user.phone && (
              <div className="flex items-center gap-3 text-xs">
                <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span>{user.phone}</span>
              </div>
            )}
            {user.company_name && (
              <div className="flex items-center gap-3 text-xs">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span>{user.company_name}{user.role_title ? ` — ${user.role_title}` : ""}</span>
              </div>
            )}
            {user.country && (
              <div className="flex items-center gap-3 text-xs">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span>{user.country}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-xs">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span>Joined {new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
            </div>
          </div>

          <Separator />

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Accounts", value: user.accountCount, icon: Wallet, color: "text-feature-accounts" },
              { label: "Transactions", value: user.transactionCount, icon: ArrowLeftRight, color: "text-feature-transactions" },
              { label: "Budgets", value: user.budgetCount, icon: CreditCard, color: "text-feature-budgets" },
            ].map(s => (
              <div key={s.label} className="rounded-lg bg-accent/50 p-3 text-center">
                <s.icon className={`h-4 w-4 mx-auto mb-1 ${s.color}`} />
                <p className="text-lg font-bold font-display">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-1">
            {onEditRole && (
              <Button size="sm" variant="outline" className="flex-1 text-xs gap-1.5" onClick={() => { onOpenChange(false); onEditRole(); }}>
                <Shield className="h-3.5 w-3.5" /> Edit Role
              </Button>
            )}
            {onEditPlan && (
              <Button size="sm" variant="outline" className="flex-1 text-xs gap-1.5" onClick={() => { onOpenChange(false); onEditPlan(); }}>
                <Crown className="h-3.5 w-3.5" /> Update Plan
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
