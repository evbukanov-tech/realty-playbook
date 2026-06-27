import { History } from "lucide-react";

export default function HistoryPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b bg-background px-8 py-6">
        <h1 className="text-2xl font-bold tracking-tight">История</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          TODO: здесь будет история просмотров и действий
        </p>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center px-8 py-16 text-center">
        <History className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <h2 className="text-lg font-semibold">Раздел в разработке</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          История будет доступна в следующих версиях приложения.
        </p>
      </div>
    </div>
  );
}
