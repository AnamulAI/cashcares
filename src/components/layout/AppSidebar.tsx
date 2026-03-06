import {
  LayoutDashboard, ArrowLeftRight, Landmark, Tag, PieChart, BarChart3,
  Building2, TrendingUp, HandCoins, CreditCard, Scale, Settings, Crown, Lock
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { APP_CONFIG } from "@/config/app";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, active: true },
    ],
  },
  {
    label: "Money",
    items: [
      { title: "Transactions", url: "/transactions", icon: ArrowLeftRight, active: true },
      { title: "Accounts", url: "/accounts", icon: Landmark, active: true },
      { title: "Categories", url: "/categories", icon: Tag, active: true },
      { title: "Budgets", url: "/budgets", icon: PieChart, active: false },
    ],
  },
  {
    label: "Tracking",
    items: [
      { title: "Receivables", url: "/receivables", icon: HandCoins, active: false },
      { title: "Payables", url: "/payables", icon: CreditCard, active: false },
      { title: "Debt & Loans", url: "/debt-loans", icon: Scale, active: false },
    ],
  },
  {
    label: "Wealth",
    items: [
      { title: "Assets", url: "/assets", icon: Building2, active: false },
      { title: "Investments", url: "/investments", icon: TrendingUp, active: false },
    ],
  },
  {
    label: "Insights",
    items: [
      { title: "Reports", url: "/reports", icon: BarChart3, active: false },
    ],
  },
];

const systemItems = [
  { title: "Settings", url: "/settings", icon: Settings, active: false },
  { title: "Subscription", url: "/subscription", icon: Crown, active: false },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm shrink-0">
            CC
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-semibold text-sm font-display truncate">{APP_CONFIG.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{APP_CONFIG.tagline}</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      {item.active ? (
                        <NavLink
                          to={item.url}
                          end
                          className={cn(
                            "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-accent",
                            !item.active && "opacity-50 pointer-events-none"
                          )}
                          activeClassName="bg-accent text-accent-foreground font-medium"
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          {!collapsed && <span className="truncate">{item.title}</span>}
                          {!collapsed && !item.active && (
                            <Badge variant="secondary" className="ml-auto text-[9px] px-1.5 py-0">Soon</Badge>
                          )}
                        </NavLink>
                      ) : (
                        <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm opacity-40 cursor-default">
                          <item.icon className="h-4 w-4 shrink-0" />
                          {!collapsed && <span className="truncate">{item.title}</span>}
                          {!collapsed && <Lock className="ml-auto h-3 w-3" />}
                        </div>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="px-2 pb-4">
        <SidebarMenu>
          {systemItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm opacity-40 cursor-default">
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.title}</span>}
                  {!collapsed && <Lock className="ml-auto h-3 w-3" />}
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
