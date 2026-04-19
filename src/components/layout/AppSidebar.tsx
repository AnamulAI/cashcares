import {
  LayoutDashboard, ArrowLeftRight, Landmark, Tag, PieChart, BarChart3,
  Building2, TrendingUp, HandCoins, CreditCard, Scale, Settings, Crown, Lock,
  Users, Bell, Wallet, ShieldCheck, PiggyBank
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { SidebarSyncBadge } from "@/components/shared/SidebarSyncBadge";
import { useAppContext } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/i18n/useTranslation";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    labelKey: "nav.overview",
    items: [
      { titleKey: "nav.dashboard", url: "/dashboard", icon: LayoutDashboard, color: "text-primary", active: true },
    ],
  },
  {
    labelKey: "nav.money",
    items: [
      { titleKey: "nav.transactions", url: "/transactions", icon: ArrowLeftRight, color: "text-feature-transactions", active: true },
      { titleKey: "nav.accounts", url: "/accounts", icon: Wallet, color: "text-feature-accounts", active: true },
      { titleKey: "nav.categories", url: "/categories", icon: Tag, color: "text-feature-categories", active: true },
      { titleKey: "nav.budgets", url: "/budgets", icon: PieChart, color: "text-feature-budget", active: true },
    ],
  },
  {
    labelKey: "nav.tracking",
    items: [
      { titleKey: "nav.receivables", url: "/receivables", icon: HandCoins, color: "text-feature-receivables", active: true },
      { titleKey: "nav.payables", url: "/payables", icon: CreditCard, color: "text-feature-payables", active: true },
      { titleKey: "nav.debtLoans", url: "/debt-loans", icon: Scale, color: "text-feature-debt", active: true },
      { titleKey: "nav.partnerships", url: "/partnerships", icon: Users, color: "text-feature-partnerships", active: true },
    ],
  },
  {
    labelKey: "nav.wealth",
    items: [
      { titleKey: "nav.assets", url: "/assets", icon: Building2, color: "text-feature-assets", active: true },
      { titleKey: "nav.investments", url: "/investments", icon: TrendingUp, color: "text-feature-investments", active: true },
      { titleKey: "nav.savings", url: "/savings", icon: PiggyBank, color: "text-feature-savings", active: true },
    ],
  },
  {
    labelKey: "nav.insights",
    items: [
      { titleKey: "nav.reports", url: "/reports", icon: BarChart3, color: "text-feature-reports", active: true },
      { titleKey: "nav.reminders", url: "/reminders", icon: Bell, color: "text-feature-reminders", active: true },
    ],
  },
];

const systemItems = [
  { titleKey: "nav.settings", url: "/settings", icon: Settings, color: "text-feature-settings", active: true },
  { titleKey: "nav.subscription", url: "/subscription", icon: Crown, color: "text-feature-subscription", active: true },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { isModuleLocked } = useAppContext();
  const { isAdmin } = useAuth();
  const { t } = useTranslation();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="px-4 py-5">
        <BrandLogo size="md" showText={!collapsed} />
      </SidebarHeader>

      <SidebarContent className="px-3 mt-1">
        {navGroups.map((group) => (
          <SidebarGroup key={group.labelKey} className="mb-1">
            <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-medium px-3 mb-1">
              {t(group.labelKey)}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = location.pathname === item.url;
                  const locked = !item.active || isModuleLocked(item.url);
                  return (
                    <SidebarMenuItem key={item.titleKey}>
                      <SidebarMenuButton asChild>
                        {!locked ? (
                          <NavLink
                            to={item.url}
                            end
                            className={cn(
                              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-200 ease-out",
                              "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent hover:translate-x-0.5",
                            )}
                            activeClassName="bg-gradient-to-r from-primary/10 to-violet-500/5 text-primary font-medium border-l-2 border-primary !pl-[10px]"
                          >
                            <item.icon className={cn("h-[18px] w-[18px] shrink-0", isActive ? "text-primary" : item.color)} />
                            {!collapsed && <span className="truncate">{t(item.titleKey)}</span>}
                          </NavLink>
                        ) : (
                          <div
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground/40 cursor-pointer select-none hover:bg-sidebar-accent/50 transition-colors"
                            onClick={() => navigate("/subscription")}
                          >
                            <item.icon className="h-[18px] w-[18px] shrink-0" />
                            {!collapsed && (
                              <>
                                <span className="truncate flex-1">{t(item.titleKey)}</span>
                                <Lock className="h-3 w-3 opacity-50" />
                              </>
                            )}
                          </div>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* Admin section - only for admins */}
        {isAdmin && (
          <SidebarGroup className="mb-1">
            <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-medium px-3 mb-1">
              Admin
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/admin"
                      end
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-200 ease-out",
                        "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent hover:translate-x-0.5",
                      )}
                      activeClassName="bg-gradient-to-r from-primary/10 to-violet-500/5 text-primary font-medium border-l-2 border-primary !pl-[10px]"
                    >
                      <ShieldCheck className={cn("h-[18px] w-[18px] shrink-0", location.pathname === "/admin" ? "text-primary" : "text-warning")} />
                      {!collapsed && <span className="truncate">Admin Dashboard</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="px-3 pb-5 border-t border-sidebar-border pt-3">
        <SidebarMenu>
          {systemItems.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <SidebarMenuItem key={item.titleKey}>
                <SidebarMenuButton asChild>
                  {item.active ? (
                    <NavLink
                      to={item.url}
                      end
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-200 ease-out",
                        "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent hover:translate-x-0.5",
                      )}
                      activeClassName="bg-gradient-to-r from-primary/10 to-violet-500/5 text-primary font-medium border-l-2 border-primary !pl-[10px]"
                    >
                      <item.icon className={cn("h-[18px] w-[18px] shrink-0", isActive ? "text-primary" : item.color)} />
                      {!collapsed && <span className="truncate">{t(item.titleKey)}</span>}
                    </NavLink>
                  ) : (
                    <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground/40 cursor-default select-none">
                      <item.icon className="h-[18px] w-[18px] shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="truncate flex-1">{t(item.titleKey)}</span>
                          <Lock className="h-3 w-3 opacity-50" />
                        </>
                      )}
                    </div>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
