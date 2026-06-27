import { z } from "zod";

export const promptFormSchema = z.object({
  title: z
    .string()
    .min(1, "Введите название")
    .max(200, "Название не длиннее 200 символов"),
  content: z
    .string()
    .min(1, "Введите текст документа")
    .max(10000, "Текст не длиннее 10000 символов"),
  isPublic: z.boolean(),
});

export type PromptFormValues = z.infer<typeof promptFormSchema>;

export const promptIdSchema = z.object({
  id: z.string().min(1),
});
