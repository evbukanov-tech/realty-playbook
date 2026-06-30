import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LikeButton } from "@/components/dashboard/LikeButton";
import { getPromptPreview, type PublicPromptListItem } from "@/lib/prompt-queries";

type PublicPromptCardProps = {
  prompt: PublicPromptListItem;
};

export function PublicPromptCard({ prompt }: PublicPromptCardProps) {
  return (
    <Card className="flex h-full flex-col max-sm:shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-base leading-snug">{prompt.title}</CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>{prompt.user.name ?? "Аноним"}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={prompt.createdAt.toISOString()}>
            {prompt.createdAt.toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </time>
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-auto space-y-4">
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {getPromptPreview(prompt.content)}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <LikeButton
            promptId={prompt.id}
            initialLiked={prompt.likedByMe}
            initialCount={prompt.likesCount}
          />
          <Button asChild variant="outline" size="sm">
            <Link href={`/prompts/${prompt.id}`}>Открыть</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
