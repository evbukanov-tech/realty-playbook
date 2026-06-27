"use client";

import { Suspense, useState } from "react";
import { Plus, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PromptCard, type PromptListItem } from "@/components/dashboard/PromptCard";
import { PromptDialog } from "@/components/dashboard/PromptDialog";
import { PromptSearch } from "@/components/dashboard/PromptSearch";

type PromptsPageContentProps = {
  title: string;
  subtitle: string;
  prompts: PromptListItem[];
  currentUserId: string;
  showOwner?: boolean;
  emptyTitle: string;
  emptyDescription: string;
  showCreateButton?: boolean;
};

export function PromptsPageContent({
  title,
  subtitle,
  prompts,
  currentUserId,
  showOwner = false,
  emptyTitle,
  emptyDescription,
  showCreateButton = false,
}: PromptsPageContentProps) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b bg-background px-8 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {showCreateButton && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Новый документ
            </Button>
          )}
        </div>
        <div className="mt-5">
          <Suspense
            fallback={
              <div className="h-9 w-full max-w-md animate-pulse rounded-md bg-muted" />
            }
          >
            <PromptSearch />
          </Suspense>
        </div>
      </header>

      <div className="flex-1 px-8 py-6">
        {prompts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
            <Bookmark className="mb-4 h-10 w-10 text-muted-foreground/50" />
            <h2 className="text-lg font-semibold">{emptyTitle}</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {emptyDescription}
            </p>
            {showCreateButton && (
              <Button className="mt-6" onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4" />
                Создать документ
              </Button>
            )}
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {prompts.map((prompt) => (
              <li key={prompt.id}>
                <PromptCard
                  prompt={prompt}
                  currentUserId={currentUserId}
                  showOwner={showOwner}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {showCreateButton && (
        <PromptDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          mode="create"
        />
      )}
    </div>
  );
}
