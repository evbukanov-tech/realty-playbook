"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  DashboardSidebar,
  DashboardSidebarNav,
} from "@/components/dashboard/DashboardSidebar";

type DashboardShellProps = {
  userName?: string | null;
  userEmail?: string | null;
  children: React.ReactNode;
};

export function DashboardShell({
  userName,
  userEmail,
  children,
}: DashboardShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const displayName = userName ?? userEmail ?? "Пользователь";

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar userName={userName} userEmail={userEmail} />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col overflow-auto bg-background">
        <header className="sticky top-0 z-40 flex items-center gap-3 border-b bg-card px-4 py-3 lg:hidden">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setMenuOpen(true)}
            aria-label="Открыть меню"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              ProStore
            </p>
            <p className="truncate text-sm font-semibold">{displayName}</p>
          </div>
        </header>

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetContent side="left" className="w-[280px] p-0" showClose={false}>
            <DashboardSidebarNav
              userName={userName}
              userEmail={userEmail}
              onNavigate={() => setMenuOpen(false)}
            />
          </SheetContent>
        </Sheet>

        {children}
      </div>
    </div>
  );
}
