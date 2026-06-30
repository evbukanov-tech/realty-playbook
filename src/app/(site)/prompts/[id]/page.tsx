import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getPublicPromptById } from "@/lib/prompt-queries";
import { LikeButton } from "@/components/dashboard/LikeButton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PromptPage({ params }: PageProps) {
  const session = await auth();
  const { id } = await params;
  const prompt = await getPublicPromptById(id, session?.user?.id);

  if (!prompt) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
        <Link href="/">← На главную</Link>
      </Button>

      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {prompt.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span>{prompt.user.name ?? "Аноним"}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={prompt.createdAt.toISOString()}>
            {prompt.createdAt.toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>
        </div>
      </header>

      <Separator className="my-6" />

      <div className="prose prose-sm max-w-none dark:prose-invert">
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {prompt.content}
        </p>
      </div>

      <div className="mt-8 flex items-center gap-4">
        <LikeButton
          promptId={prompt.id}
          initialLiked={prompt.likedByMe}
          initialCount={prompt.likesCount}
        />
      </div>
    </article>
  );
}
