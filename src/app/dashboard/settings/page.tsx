import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b bg-background px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Настройки</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          TODO: здесь будут настройки профиля и приложения
        </p>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center sm:px-6 sm:py-16 lg:px-8">
        <Settings className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <h2 className="text-lg font-semibold">Раздел в разработке</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Настройки аккаунта и предпочтений появятся позже.
        </p>
      </div>
    </div>
  );
}
