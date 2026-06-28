import { PromptsListSkeleton } from "@/components/dashboard/PromptsListSkeleton";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <div className="border-b px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-72 animate-pulse rounded bg-muted" />
        <div className="mt-5 h-9 w-full max-w-md animate-pulse rounded bg-muted" />
      </div>
      <div className="px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
        <PromptsListSkeleton />
      </div>
    </div>
  );
}
