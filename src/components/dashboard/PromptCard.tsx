"use client";

import { useState, useTransition } from "react";
import { Eye, Globe, Lock, Pencil, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPromptPreview } from "@/lib/prompt-queries";
import {
  deletePrompt,
  toggleFavorite,
  togglePublic,
} from "@/actions/prompt-actions";
import { PromptDialog } from "@/components/dashboard/PromptDialog";
import { PromptViewDialog } from "@/components/dashboard/PromptViewDialog";
import { LikeButton } from "@/components/dashboard/LikeButton";
import { cn } from "@/lib/utils";

export type PromptListItem = {
  id: string;
  userId: string;
  title: string;
  content: string;
  isPublic: boolean;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  likesCount?: number;
  likedByMe?: boolean;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
};

type PromptCardProps = {
  prompt: PromptListItem;
  currentUserId: string;
  showOwner?: boolean;
};

export function PromptCard({
  prompt,
  currentUserId,
  showOwner = false,
}: PromptCardProps) {
  const isOwner = prompt.userId === currentUserId;
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleTogglePublic = () => {
    setError(null);
    startTransition(async () => {
      const result = await togglePublic(prompt.id);
      if (!result.success) setError(result.error);
    });
  };

  const handleToggleFavorite = () => {
    setError(null);
    startTransition(async () => {
      const result = await toggleFavorite(prompt.id);
      if (!result.success) setError(result.error);
    });
  };

  const handleDelete = () => {
    if (!confirm("Удалить этот документ?")) return;
    setError(null);
    startTransition(async () => {
      const result = await deletePrompt(prompt.id);
      if (!result.success) setError(result.error);
    });
  };

  return (
    <>
      <Card className={cn(isPending && "opacity-60")}>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base leading-snug">
                {!isOwner ? (
                  <button
                    type="button"
                    onClick={() => setViewOpen(true)}
                    className="text-left hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                  >
                    {prompt.title}
                  </button>
                ) : (
                  prompt.title
                )}
              </CardTitle>
              {showOwner && (
                <CardDescription className="mt-1">
                  {prompt.user.name ?? "Аноним"}
                </CardDescription>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1 self-start">
              {prompt.isPublic ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  <Globe className="h-3 w-3" />
                  Публичный
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
                  <Lock className="h-3 w-3" />
                  Приватный
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {getPromptPreview(prompt.content)}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <time
                dateTime={prompt.updatedAt.toISOString()}
                className="text-xs text-muted-foreground"
              >
                {prompt.updatedAt.toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </time>

              {prompt.isPublic && (
                <LikeButton
                  promptId={prompt.id}
                  initialLiked={prompt.likedByMe ?? false}
                  initialCount={prompt.likesCount ?? 0}
                />
              )}
            </div>

            {!isOwner ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setViewOpen(true)}
              >
                <Eye className="h-4 w-4" />
                Открыть
              </Button>
            ) : (
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleFavorite}
                  disabled={isPending}
                  aria-label={
                    prompt.isFavorite
                      ? "Убрать из избранного"
                      : "Добавить в избранное"
                  }
                >
                  <Star
                    className={cn(
                      "h-4 w-4",
                      prompt.isFavorite && "fill-amber-400 text-amber-400",
                    )}
                  />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleTogglePublic}
                  disabled={isPending}
                  aria-label={
                    prompt.isPublic ? "Сделать приватным" : "Сделать публичным"
                  }
                >
                  {prompt.isPublic ? (
                    <Lock className="h-4 w-4" />
                  ) : (
                    <Globe className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditOpen(true)}
                  disabled={isPending}
                  aria-label="Редактировать"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleDelete}
                  disabled={isPending}
                  aria-label="Удалить"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {isOwner && (
        <PromptDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          mode="edit"
          prompt={prompt}
        />
      )}

      {!isOwner && (
        <PromptViewDialog
          open={viewOpen}
          onOpenChange={setViewOpen}
          prompt={prompt}
          showOwner={showOwner}
        />
      )}
    </>
  );
}
