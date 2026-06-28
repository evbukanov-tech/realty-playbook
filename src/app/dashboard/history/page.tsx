import { requireUserId } from "@/lib/session";
import { getRecentActivity } from "@/lib/activity-queries";
import { ActivityList } from "@/components/dashboard/ActivityList";

export default async function HistoryPage() {
  const userId = await requireUserId();
  const activity = await getRecentActivity(userId);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b bg-background px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">История</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Последние действия с документами и лайками
        </p>
      </header>

      <div className="flex-1 px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
        <ActivityList items={activity} />
      </div>
    </div>
  );
}
