import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatAppDate } from "@/lib/formatters";
import {
  Bell, Search, Plus, ChevronDown, User, CreditCard, LogOut,
  Settings2, UserCircle, Check, AlertTriangle, Clock, DollarSign,
  ArrowUpRight, CheckCheck, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { QuickAddModal } from "./QuickAddModal";
import { OfflineIndicator } from "@/components/shared/OfflineIndicator";
import { useAppContext, CURRENCIES, type DatePreset } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/i18n/useTranslation";
import { toast } from "sonner";

const ICON_MAP: Record<string, any> = {
  AlertTriangle, Clock, DollarSign, ArrowUpRight,
};

const PRESET_KEYS: { preset: DatePreset; key: string }[] = [
  { preset: "this_month", key: "datePreset.thisMonth" },
  { preset: "last_month", key: "datePreset.lastMonth" },
  { preset: "last_3_months", key: "datePreset.last3Months" },
  { preset: "this_year", key: "datePreset.thisYear" },
  { preset: "custom", key: "datePreset.customRange" },
];

export function AppHeader() {
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [showCustomCalendar, setShowCustomCalendar] = useState(false);
  const navigate = useNavigate();
  const {
    currency, setCurrency,
    datePreset, dateRange, setDatePreset, setCustomRange,
    notifications, unreadCount, markRead, markAllRead,
    settings,
  } = useAppContext();
  const { profile, isAdmin, signOut } = useAuth();
  const { t, lang } = useTranslation();
  const fmtDate = (d: Date) => formatAppDate(d, settings.dateFormat, settings.timezone, lang);

  const handleDatePreset = (p: DatePreset) => {
    if (p === "custom") {
      setShowCustomCalendar(true);
    } else {
      setDatePreset(p);
      setShowCustomCalendar(false);
      setDatePopoverOpen(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      localStorage.clear();
      toast.success("Signed out successfully");
      navigate("/auth");
    } catch {
      toast.error("Sign out failed");
    }
  };

  const displayName = profile?.full_name || "User";
  const displayEmail = profile?.email || "";
  const initials = displayName
    .split(" ")
    .map(w => w.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

  const currentPresetKey = PRESET_KEYS.find(p => p.preset === datePreset)?.key || "datePreset.thisMonth";

  return (
    <>
      <header className="sticky top-0 z-30 flex h-[56px] items-center gap-3 border-b bg-card/90 backdrop-blur-md px-4">
        <SidebarTrigger className="shrink-0 text-muted-foreground hover:text-foreground" />

        {/* Search */}
        <div className="relative hidden sm:block w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
          <Input placeholder={t("topbar.searchPlaceholder")} className="pl-9 h-9 bg-muted/50 border-transparent focus:border-input focus:bg-background text-sm" />
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <OfflineIndicator />
          {/* Currency Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="hidden md:flex items-center gap-1 font-mono text-[11px] px-2.5 py-1 bg-muted/60 text-muted-foreground rounded-md hover:bg-muted transition-colors cursor-pointer">
                {currency.code} {currency.symbol}
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 p-1">
              {CURRENCIES.map(c => (
                <DropdownMenuItem
                  key={c.code}
                  className="gap-2.5 px-3 py-2 cursor-pointer justify-between"
                  onClick={() => setCurrency(c)}
                >
                  <span className="font-mono text-xs">{c.code} {c.symbol}</span>
                  {currency.code === c.code && <Check className="h-3.5 w-3.5 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Date Range Selector */}
          <Popover open={datePopoverOpen} onOpenChange={(o) => { setDatePopoverOpen(o); if (!o) setShowCustomCalendar(false); }}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="hidden lg:flex gap-1.5 text-xs h-8 text-muted-foreground hover:text-foreground">
                {t(currentPresetKey)} <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-auto p-0">
              {!showCustomCalendar ? (
                <div className="p-1.5 min-w-[180px]">
                  {PRESET_KEYS.map(({ preset, key }) => (
                    <button
                      key={preset}
                      onClick={() => handleDatePreset(preset)}
                      className={cn(
                        "w-full flex items-center justify-between gap-3 px-3 py-2 text-xs rounded-md hover:bg-accent transition-colors",
                        datePreset === preset && "bg-accent font-medium"
                      )}
                    >
                      {t(key)}
                      {datePreset === preset && preset !== "custom" && <Check className="h-3.5 w-3.5 text-primary" />}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-3 space-y-3">
                  <p className="text-xs font-medium text-muted-foreground px-1">{t("topbar.selectDateRange")}</p>
                  <Calendar
                    mode="range"
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        setCustomRange({ from: range.from, to: range.to });
                      }
                    }}
                    numberOfMonths={1}
                    className="p-3 pointer-events-auto"
                  />
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] text-muted-foreground">
                      {fmtDate(dateRange.from)} — {fmtDate(dateRange.to)}
                    </span>
                    <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => { setDatePopoverOpen(false); setShowCustomCalendar(false); }}>
                      {t("action.apply")}
                    </Button>
                  </div>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 relative text-muted-foreground hover:text-foreground">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-negative ring-2 ring-card" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <span className="text-sm font-semibold">{t("topbar.notifications")}</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[11px] text-primary hover:underline flex items-center gap-1">
                    <CheckCheck className="h-3 w-3" /> {t("topbar.markAllRead")}
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">{t("topbar.noNotifications")}</div>
                ) : (
                  notifications.map(n => {
                    const Icon = ICON_MAP[n.icon] || AlertTriangle;
                    return (
                      <button
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        className={cn(
                          "w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-accent/50 transition-colors border-b border-border/40 last:border-0",
                          !n.read && "bg-primary/[0.03]"
                        )}
                      >
                        <div className={cn("mt-0.5 h-7 w-7 rounded-lg flex items-center justify-center shrink-0 bg-muted/60")}>
                          <Icon className={cn("h-3.5 w-3.5", n.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-xs", !n.read ? "font-medium" : "text-muted-foreground")}>{n.title}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{n.desc}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground/60 shrink-0 mt-0.5">{n.time}</span>
                        {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1.5" />}
                      </button>
                    );
                  })
                )}
              </div>
              <div className="border-t px-4 py-2.5">
                <button onClick={() => navigate("/reminders")} className="text-xs text-primary hover:underline w-full text-center">
                  {t("topbar.viewAllNotifications")}
                </button>
              </div>
            </PopoverContent>
          </Popover>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-primary">{initials}</span>
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 p-1.5">
              <DropdownMenuLabel className="px-3 py-2">
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
                {isAdmin && (
                  <div className="flex items-center gap-1 mt-1">
                    <ShieldCheck className="h-3 w-3 text-primary" />
                    <span className="text-[10px] text-primary font-medium">Admin</span>
                  </div>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2.5 px-3 py-2 cursor-pointer" onClick={() => navigate("/profile")}>
                <UserCircle className="h-4 w-4 text-muted-foreground" /> {t("topbar.profile")}
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2.5 px-3 py-2 cursor-pointer" onClick={() => navigate("/settings")}>
                <Settings2 className="h-4 w-4 text-muted-foreground" /> {t("topbar.preferences")}
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2.5 px-3 py-2 cursor-pointer" onClick={() => navigate("/subscription")}>
                <CreditCard className="h-4 w-4 text-muted-foreground" /> {t("topbar.billing")}
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem className="gap-2.5 px-3 py-2 cursor-pointer" onClick={() => navigate("/admin")}>
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" /> Admin Dashboard
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2.5 px-3 py-2 cursor-pointer text-negative" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" /> {t("topbar.signOut")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Quick add */}
          <Button size="sm" className="h-9 gap-1.5 ml-1 shadow-sm" onClick={() => setQuickAddOpen(true)}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t("action.addRecord")}</span>
          </Button>
        </div>
      </header>

      <QuickAddModal open={quickAddOpen} onOpenChange={setQuickAddOpen} />
    </>
  );
}
