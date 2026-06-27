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
      title="Маркетплейс практических решений Realty Playbook"
      subtitle="Управляй и обменивайся готовыми рабочими материалами для продаж недвижимости."
      prompts={prompts}
      currentUserId={userId}
      showCreateButton
      emptyTitle="Пока нет документов"
      emptyDescription="Создайте первый документ, чтобы он появился в этом списке."
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
