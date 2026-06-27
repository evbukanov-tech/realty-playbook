"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  promptFormSchema,
  type PromptFormValues,
} from "@/lib/validations/prompt";
import { createPrompt, updatePrompt } from "@/actions/prompt-actions";
import type { PromptListItem } from "@/components/dashboard/PromptCard";

type PromptDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  prompt?: PromptListItem;
};

const defaultValues: PromptFormValues = {
  title: "",
  content: "",
  isPublic: false,
};

export function PromptDialog({
  open,
  onOpenChange,
  mode,
  prompt,
}: PromptDialogProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PromptFormValues>({
    resolver: zodResolver(promptFormSchema),
    defaultValues,
  });

  const isPublic = watch("isPublic");

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && prompt) {
      reset({
        title: prompt.title,
        content: prompt.content,
        isPublic: prompt.isPublic,
      });
    } else {
      reset(defaultValues);
    }
  }, [open, mode, prompt, reset]);

  const onSubmit = (values: PromptFormValues) => {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createPrompt(values)
          : await updatePrompt(prompt!.id, values);

      if (result.success) {
        onOpenChange(false);
        reset(defaultValues);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Новый промт" : "Редактировать промт"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Создайте промт и выберите видимость."
              : "Измените название, текст или видимость промта."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Название</Label>
            <Input id="title" {...register("title")} placeholder="Название промта" />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Текст промта</Label>
            <Textarea
              id="content"
              {...register("content")}
              placeholder="Введите текст промта…"
              rows={6}
            />
            {errors.content && (
              <p className="text-xs text-destructive">{errors.content.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border px-3 py-3">
            <div>
              <Label htmlFor="isPublic" className="text-sm">
                Публичный промт
              </Label>
              <p className="text-xs text-muted-foreground">
                Будет виден в каталоге публичных промтов
              </p>
            </div>
            <Switch
              id="isPublic"
              checked={isPublic}
              onCheckedChange={(checked) => setValue("isPublic", checked)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Сохранение…"
                : mode === "create"
                  ? "Создать"
                  : "Сохранить"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
