import { Suspense } from "react";
import { requireUserId } from "@/lib/session";
import { getFavoritePrompts } from "@/lib/prompt-queries";
import { PromptsPageContent } from "@/components/dashboard/PromptsPageContent";
import { PromptsListSkeleton } from "@/components/dashboard/PromptsListSkeleton";

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

async function FavoritePromptsList({
  query,
  userId,
}: {
  query?: string;
  userId: string;
}) {
  const prompts = await getFavoritePrompts(userId, query);

  return (
    <PromptsPageContent
      title="Избранное"
      subtitle="Документы, отмеченные звёздочкой"
      prompts={prompts}
      currentUserId={userId}
      emptyTitle="Избранных документов пока нет"
      emptyDescription="Отметьте документ звёздочкой в списке «Документы», чтобы он появился здесь."
    />
  );
}

export default async function FavoritesPage({ searchParams }: PageProps) {
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
      <FavoritePromptsList query={q} userId={userId} />
    </Suspense>
  );
}
