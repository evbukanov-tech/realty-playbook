"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PromptListItem } from "@/components/dashboard/PromptCard";

type PromptViewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt: PromptListItem;
  showOwner?: boolean;
};

export function PromptViewDialog({
  open,
  onOpenChange,
  prompt,
  showOwner = false,
}: PromptViewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{prompt.title}</DialogTitle>
          <DialogDescription asChild>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {showOwner && (
                <span>{prompt.user.name ?? "Аноним"}</span>
              )}
              <time dateTime={prompt.updatedAt.toISOString()}>
                {prompt.updatedAt.toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </time>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {prompt.content}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
