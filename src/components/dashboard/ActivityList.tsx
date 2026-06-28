import Link from "next/link";
import { FilePlus, History, Pencil, ThumbsUp } from "lucide-react";
import type { ActivityItem, ActivityType } from "@/lib/activity-queries";

const activityMeta: Record<
  ActivityType,
  { label: string; icon: typeof History }
> = {
  created: { label: "Создан документ", icon: FilePlus },
  updated: { label: "Изменён документ", icon: Pencil },
  liked: { label: "Понравился документ", icon: ThumbsUp },
};

type ActivityListProps = {
  items: ActivityItem[];
};

export function ActivityList({ items }: ActivityListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <History className="mb-4 h-10 w-10 text-muted-foreground/50" />
        <h2 className="text-lg font-semibold">Пока нет действий</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Здесь появятся созданные и изменённые документы, а также лайки
          публичных материалов.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y rounded-xl border bg-card">
      {items.map((item) => {
        const meta = activityMeta[item.type];
        const Icon = meta.icon;

        return (
          <li key={item.id} className="flex gap-4 px-4 py-4 sm:px-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{meta.label}</p>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {item.promptTitle}
              </p>
              <time
                dateTime={item.occurredAt.toISOString()}
                className="mt-1 block text-xs text-muted-foreground"
              >
                {item.occurredAt.toLocaleString("ru-RU", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
            </div>
            <Link
              href={
                item.type === "liked"
                  ? "/dashboard/public"
                  : "/dashboard"
              }
              className="shrink-0 self-center text-sm font-medium text-primary hover:underline"
            >
              Открыть
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
