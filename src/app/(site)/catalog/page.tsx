import { Suspense } from "react";
import { auth } from "@/auth";
import { getPublicPrompts } from "@/lib/prompt-queries";
import { PublicPromptCard } from "@/components/PublicPromptCard";
import { PromptSearch } from "@/components/dashboard/PromptSearch";
import { PromptSort } from "@/components/dashboard/PromptSort";

type PageProps = {
  searchParams: Promise<{ q?: string; sort?: string }>;
};

async function CatalogList({
  query,
  sort,
  userId,
}: {
  query?: string;
  sort?: string;
  userId?: string;
}) {
  const sortValue = sort === "popular" ? "popular" : "recent";
  const prompts = await getPublicPrompts(query, sortValue, userId);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Каталог</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Все публичные промты сообщества
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <Suspense
            fallback={
              <div className="h-9 w-full max-w-md animate-pulse rounded-md bg-muted" />
            }
          >
            <PromptSearch />
          </Suspense>
          <Suspense
            fallback={
              <div className="h-9 w-40 animate-pulse rounded-md bg-muted" />
            }
          >
            <PromptSort />
          </Suspense>
        </div>
      </header>

      {prompts.length === 0 ? (
        <p className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
          {query
            ? "Ничего не найдено. Попробуйте другой запрос."
            : "Публичных промтов пока нет."}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {prompts.map((prompt) => (
            <li key={prompt.id}>
              <PublicPromptCard
                prompt={{
                  id: prompt.id,
                  title: prompt.title,
                  content: prompt.content,
                  createdAt: prompt.createdAt,
                  likesCount: prompt.likesCount ?? 0,
                  likedByMe: prompt.likedByMe ?? false,
                  user: prompt.user,
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default async function CatalogPage({ searchParams }: PageProps) {
  const session = await auth();
  const { q, sort } = await searchParams;

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      }
    >
      <CatalogList query={q} sort={sort} userId={session?.user?.id} />
    </Suspense>
  );
}
