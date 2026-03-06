import { useState } from "react";
import { Bell, Search, Plus, ChevronDown, User, CreditCard, LogOut, Settings2, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { APP_CONFIG } from "@/config/app";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { QuickAddModal } from "./QuickAddModal";

export function AppHeader() {
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-[56px] items-center gap-3 border-b bg-card/90 backdrop-blur-md px-4">
        <SidebarTrigger className="shrink-0 text-muted-foreground hover:text-foreground" />

        {/* Search */}
        <div className="relative hidden sm:block w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
          <Input placeholder="Search transactions, accounts..." className="pl-9 h-9 bg-muted/50 border-transparent focus:border-input focus:bg-background text-sm" />
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          {/* Currency */}
          <Badge variant="secondary" className="hidden md:flex gap-1 font-mono text-[11px] px-2.5 py-1 bg-muted/60 text-muted-foreground border-0">
            {APP_CONFIG.currency.code} {APP_CONFIG.currency.symbol}
          </Badge>

          {/* Date range */}
          <Button variant="ghost" size="sm" className="hidden lg:flex gap-1.5 text-xs h-8 text-muted-foreground hover:text-foreground">
            This Month <ChevronDown className="h-3 w-3 opacity-60" />
          </Button>

          {/* Notification */}
          <Button variant="ghost" size="icon" className="h-9 w-9 relative text-muted-foreground hover:text-foreground">
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-negative ring-2 ring-card" />
          </Button>

          {/* User */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                  <User className="h-4 w-4 text-primary" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 p-1.5">
              <DropdownMenuLabel className="px-3 py-2">
                <p className="text-sm font-medium">User Name</p>
                <p className="text-xs text-muted-foreground">user@email.com</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2.5 px-3 py-2 cursor-pointer">
                <UserCircle className="h-4 w-4 text-muted-foreground" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2.5 px-3 py-2 cursor-pointer">
                <Settings2 className="h-4 w-4 text-muted-foreground" /> Preferences
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2.5 px-3 py-2 cursor-pointer">
                <CreditCard className="h-4 w-4 text-muted-foreground" /> Billing
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2.5 px-3 py-2 cursor-pointer text-negative">
                <LogOut className="h-4 w-4" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Quick add */}
          <Button size="sm" className="h-9 gap-1.5 ml-1 shadow-sm" onClick={() => setQuickAddOpen(true)}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Record</span>
          </Button>
        </div>
      </header>

      <QuickAddModal open={quickAddOpen} onOpenChange={setQuickAddOpen} />
    </>
  );
}