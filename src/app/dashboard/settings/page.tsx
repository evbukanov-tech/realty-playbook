import { requireUserId } from "@/lib/session";
import { getUserProfile } from "@/lib/user-queries";
import { SettingsForm } from "@/components/dashboard/SettingsForm";

export default async function SettingsPage() {
  const userId = await requireUserId();
  const profile = await getUserProfile(userId);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b bg-background px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Настройки</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Профиль, аккаунт и статистика
        </p>
      </header>

      <div className="flex-1 px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
        <SettingsForm profile={profile} />
      </div>
    </div>
  );
}
