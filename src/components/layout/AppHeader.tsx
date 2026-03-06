import { useState } from "react";
import { Bell, Search, Plus, ChevronDown, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { APP_CONFIG } from "@/config/app";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QuickAddModal } from "./QuickAddModal";

export function AppHeader() {
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card/80 backdrop-blur-sm px-4">
        <SidebarTrigger className="shrink-0" />

        {/* Search */}
        <div className="relative hidden sm:block w-full max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-8 h-9 bg-background" />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Currency */}
          <Badge variant="secondary" className="hidden md:flex gap-1 font-mono text-xs">
            {APP_CONFIG.currency.code} {APP_CONFIG.currency.symbol}
          </Badge>

          {/* Date range placeholder */}
          <Button variant="outline" size="sm" className="hidden lg:flex gap-1 text-xs h-8">
            This Month <ChevronDown className="h-3 w-3" />
          </Button>

          {/* Notification */}
          <Button variant="ghost" size="icon" className="h-9 w-9 relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-negative" />
          </Button>

          {/* User */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Preferences</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Quick add */}
          <Button size="sm" className="h-9 gap-1.5" onClick={() => setQuickAddOpen(true)}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Record</span>
          </Button>
        </div>
      </header>

      <QuickAddModal open={quickAddOpen} onOpenChange={setQuickAddOpen} />
    </>
  );
}
