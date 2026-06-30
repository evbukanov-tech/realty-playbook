"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type HeaderMobileNavProps = {
  isLoggedIn: boolean;
  className?: string;
};

export function HeaderMobileNav({ isLoggedIn, className }: HeaderMobileNavProps) {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: "Главная" },
    { href: "/catalog", label: "Каталог" },
    {
      href: isLoggedIn ? "/dashboard" : "/login?callbackUrl=%2Fdashboard",
      label: "Мои промты",
    },
  ];

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn(className)}
        onClick={() => setOpen(true)}
        aria-label="Открыть меню"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[280px]">
          <p className="text-lg font-semibold">ProStore</p>
          <Separator className="my-4" />
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
