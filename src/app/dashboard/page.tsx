import { Suspense } from "react";
import { requireUserId } from "@/lib/session";
import { getUserPrompts } from "@/lib/prompt-queries";
import { PromptsPageContent } from "@/components/dashboard/PromptsPageContent";
import { PromptsListSkeleton } from "@/components/dashboard/PromptsListSkeleton";

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

async function PromptsList({ query, userId }: { query?: string; userId: string }) {
  const prompts = await getUserPrompts(userId, query);

  return (
    <PromptsPageContent
      title="Мои промты"
      subtitle="Управляйте своими промтами — создавайте, редактируйте и делитесь"
      prompts={prompts}
      currentUserId={userId}
      showCreateButton
      emptyTitle="Пока нет промтов"
      emptyDescription="Создайте первый промт, чтобы он появился в этом списке."
    />
  );
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const userId = await requireUserId();
  const { q } = await searchParams;

  return (
    <Suspense
      fallback={
        <div className="px-8 py-6">
          <PromptsListSkeleton />
        </div>
      }
    >
      <PromptsList query={q} userId={userId} />
    </Suspense>
  );
}
