import Link from "next/link";
import { auth } from "@/auth";
import { getHomePrompts } from "@/lib/prompt-queries";
import { PublicPromptCard } from "@/components/PublicPromptCard";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const session = await auth();
  const userId = session?.user?.id;
  const { recentPrompts, popularPrompts } = await getHomePrompts(userId);

  return (
    <div>
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              REALTY PLAYBOOK
            </h1>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Платформа, где риэлторы, маркетологи и руководители агентств
              обмениваются готовыми рабочими материалами для продаж недвижимости.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-2 sm:flex-row">
              {userId ? (
                <Button asChild size="lg">
                  <Link href="/dashboard">Добавить документ</Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg">
                    <Link href="/login?callbackUrl=%2Fdashboard">Добавить документ</Link>
                  </Button>
                  <p className="text-sm text-muted-foreground sm:ml-2">
                    Войдите, чтобы добавлять
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:space-y-12 sm:px-6 sm:py-12">
        <PromptSection
          title="Новые"
          subtitle="Последние опубликованные промты"
          prompts={recentPrompts}
          emptyMessage="Публичных промтов пока нет"
        />

        <PromptSection
          title="Популярные"
          subtitle="Топ по количеству лайков"
          prompts={popularPrompts}
          emptyMessage="Пока нет популярных промтов"
        />
      </div>
    </div>
  );
}

function PromptSection({
  title,
  subtitle,
  prompts,
  emptyMessage,
}: {
  title: string;
  subtitle: string;
  prompts: Awaited<ReturnType<typeof getHomePrompts>>["recentPrompts"];
  emptyMessage: string;
}) {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      {prompts.length === 0 ? (
        <p className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {prompts.map((prompt) => (
            <li key={prompt.id}>
              <PublicPromptCard prompt={prompt} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
