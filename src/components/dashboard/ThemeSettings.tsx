"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ThemeSettings() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && (theme === "dark" || resolvedTheme === "dark");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Оформление</CardTitle>
        <CardDescription>Выберите светлую или тёмную тему интерфейса</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            {isDark ? (
              <Moon className="mt-0.5 h-5 w-5 text-muted-foreground" />
            ) : (
              <Sun className="mt-0.5 h-5 w-5 text-muted-foreground" />
            )}
            <div className="space-y-1">
              <Label htmlFor="theme-toggle" className="text-sm font-medium">
                Тёмная тема
              </Label>
              <p className="text-sm text-muted-foreground">
                {isDark
                  ? "Сейчас включена тёмная тема"
                  : "Сейчас включена светлая тема"}
              </p>
            </div>
          </div>
          <Switch
            id="theme-toggle"
            checked={isDark}
            disabled={!mounted}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            aria-label="Переключить тёмную тему"
          />
        </div>
      </CardContent>
    </Card>
  );
}
