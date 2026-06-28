"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Globe,
  History,
  MessageSquare,
  Settings,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@/components/SignOutButton";

const navItems = [
  { href: "/dashboard", label: "Документы", icon: MessageSquare, exact: true },
  { href: "/dashboard/public", label: "Публичные", icon: Globe },
  { href: "/dashboard/favorites", label: "Избранное", icon: Star },
  { href: "/dashboard/history", label: "История", icon: History, disabled: true },
  { href: "/dashboard/settings", label: "Настройки", icon: Settings, disabled: true },
] as const;

type DashboardSidebarNavProps = {
  userName?: string | null;
  userEmail?: string | null;
  onNavigate?: () => void;
  className?: string;
};

export function DashboardSidebarNav({
  userName,
  userEmail,
  onNavigate,
  className,
}: DashboardSidebarNavProps) {
  const pathname = usePathname();
  const displayName = userName ?? userEmail ?? "Пользователь";

  return (
    <div className={cn("flex h-full flex-col bg-card", className)}>
      <div className="border-b px-5 py-6">
        <p className="text-xs font-medium tracking-wide text-muted-foreground">
          Realty Playbook
        </p>
        <p className="mt-1 truncate text-sm font-semibold">{displayName}</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            "exact" in item && item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          if ("disabled" in item && item.disabled) {
            return (
              <span
                key={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground/60"
                title="Скоро"
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
                <span className="ml-auto text-[10px] uppercase">TODO</span>
              </span>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t px-3 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <SignOutButton className="w-full justify-center" />
      </div>
    </div>
  );
}

type DashboardSidebarProps = {
  userName?: string | null;
  userEmail?: string | null;
};

export function DashboardSidebar({ userName, userEmail }: DashboardSidebarProps) {
  return (
    <aside className="sticky top-0 hidden h-screen w-[280px] shrink-0 flex-col border-r bg-card lg:flex">
      <DashboardSidebarNav userName={userName} userEmail={userEmail} />
    </aside>
  );
}
