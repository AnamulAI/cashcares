import {
  LayoutDashboard, ArrowLeftRight, Landmark, Tag, PieChart, BarChart3,
  Building2, TrendingUp, HandCoins, CreditCard, Scale, Settings, Crown, Lock,
  Users, Bell
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { APP_CONFIG } from "@/config/app";
import { useAppContext } from "@/contexts/AppContext";
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
      { titleKey: "nav.dashboard", url: "/dashboard", icon: LayoutDashboard, active: true },
    ],
  },
  {
    labelKey: "nav.money",
    items: [
      { titleKey: "nav.transactions", url: "/transactions", icon: ArrowLeftRight, active: true },
      { titleKey: "nav.accounts", url: "/accounts", icon: Landmark, active: true },
      { titleKey: "nav.categories", url: "/categories", icon: Tag, active: true },
      { titleKey: "nav.budgets", url: "/budgets", icon: PieChart, active: true },
    ],
  },
  {
    labelKey: "nav.tracking",
    items: [
      { titleKey: "nav.receivables", url: "/receivables", icon: HandCoins, active: true },
      { titleKey: "nav.payables", url: "/payables", icon: CreditCard, active: true },
      { titleKey: "nav.debtLoans", url: "/debt-loans", icon: Scale, active: true },
      { titleKey: "nav.partnerships", url: "/partnerships", icon: Users, active: true },
    ],
  },
  {
    labelKey: "nav.wealth",
    items: [
      { titleKey: "nav.assets", url: "/assets", icon: Building2, active: true },
      { titleKey: "nav.investments", url: "/investments", icon: TrendingUp, active: true },
    ],
  },
  {
    labelKey: "nav.insights",
    items: [
      { titleKey: "nav.reports", url: "/reports", icon: BarChart3, active: true },
      { titleKey: "nav.reminders", url: "/reminders", icon: Bell, active: true },
    ],
  },
];

const systemItems = [
  { titleKey: "nav.settings", url: "/settings", icon: Settings, active: true },
  { titleKey: "nav.subscription", url: "/subscription", icon: Crown, active: true },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { isModuleLocked } = useAppContext();
  const { t } = useTranslation();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm shrink-0 shadow-sm">
            CC
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-semibold text-[15px] font-display tracking-tight">{APP_CONFIG.name}</p>
              <p className="text-[11px] text-muted-foreground/70 leading-none mt-0.5">{APP_CONFIG.tagline}</p>
            </div>
          )}
        </div>
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
                              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-150",
                              "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                            )}
                            activeClassName="bg-primary/8 text-primary font-medium !hover:bg-primary/10"
                          >
                            <item.icon className={cn("h-[18px] w-[18px] shrink-0", isActive && "text-primary")} />
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
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
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
                        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-150",
                        "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                      )}
                      activeClassName="bg-primary/8 text-primary font-medium !hover:bg-primary/10"
                    >
                      <item.icon className={cn("h-[18px] w-[18px] shrink-0", isActive && "text-primary")} />
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
