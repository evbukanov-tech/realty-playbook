import { Suspense } from "react";
import { requireUserId } from "@/lib/session";
import { getPublicPrompts } from "@/lib/prompt-queries";
import { PromptsPageContent } from "@/components/dashboard/PromptsPageContent";
import { PromptsListSkeleton } from "@/components/dashboard/PromptsListSkeleton";

type PageProps = {
  searchParams: Promise<{ q?: string; sort?: string }>;
};

async function PublicPromptsList({
  query,
  sort,
  userId,
}: {
  query?: string;
  sort?: string;
  userId: string;
}) {
  const sortValue = sort === "popular" ? "popular" : "recent";
  const prompts = await getPublicPrompts(query, sortValue, userId);

  return (
    <PromptsPageContent
      title="Публичные документы"
      subtitle="Каталог документов, которыми поделились пользователи"
      prompts={prompts}
      currentUserId={userId}
      showOwner
      showSort
      emptyTitle="Публичных документов пока нет"
      emptyDescription="Когда кто-то опубликует документ, он появится здесь."
    />
  );
}

export default async function PublicPromptsPage({ searchParams }: PageProps) {
  const userId = await requireUserId();
  const { q, sort } = await searchParams;

  return (
    <Suspense
      fallback={
        <div className="px-8 py-6">
          <PromptsListSkeleton />
        </div>
      }
    >
      <PublicPromptsList query={q} sort={sort} userId={userId} />
    </Suspense>
  );
}
