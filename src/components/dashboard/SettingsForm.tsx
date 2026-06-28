"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateProfile } from "@/actions/user-actions";
import {
  profileFormSchema,
  type ProfileFormValues,
} from "@/lib/validations/user";
import type { UserProfile } from "@/lib/user-queries";
import { ThemeSettings } from "@/components/dashboard/ThemeSettings";

type SettingsFormProps = {
  profile: UserProfile;
};

export function SettingsForm({ profile }: SettingsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: profile.name ?? "",
    },
  });

  const onSubmit = (values: ProfileFormValues) => {
    setError(null);
    startTransition(async () => {
      const result = await updateProfile(values);
      if (result.success) {
        router.refresh();
        return;
      }
      setError(result.error);
    });
  };

  const displayInitial = (profile.name ?? profile.email ?? "?")
    .charAt(0)
    .toUpperCase();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Профиль</CardTitle>
          <CardDescription>
            Имя отображается в боковом меню и рядом с документами
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex items-center gap-4">
            {profile.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.image}
                alt=""
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                {displayInitial}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate font-medium">
                {profile.name ?? "Без имени"}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {profile.email}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Отображаемое имя</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Как вас показывать в приложении"
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={profile.email}
                readOnly
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email привязан к аккаунту Google и не редактируется здесь
              </p>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={isPending || !isDirty}>
              {isPending ? "Сохранение…" : "Сохранить"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <ThemeSettings />

        <Card>
          <CardHeader>
            <CardTitle>Аккаунт</CardTitle>
            <CardDescription>Основная информация</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Дата регистрации</span>
              <time dateTime={profile.createdAt.toISOString()}>
                {profile.createdAt.toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </time>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Статистика</CardTitle>
            <CardDescription>Краткий обзор активности</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border px-4 py-3">
              <p className="text-2xl font-semibold tabular-nums">
                {profile._count.prompts}
              </p>
              <p className="text-sm text-muted-foreground">Документов</p>
            </div>
            <div className="rounded-lg border px-4 py-3">
              <p className="text-2xl font-semibold tabular-nums">
                {profile.favoriteCount}
              </p>
              <p className="text-sm text-muted-foreground">В избранном</p>
            </div>
            <div className="rounded-lg border px-4 py-3">
              <p className="text-2xl font-semibold tabular-nums">
                {profile._count.likes}
              </p>
              <p className="text-sm text-muted-foreground">Лайков</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
