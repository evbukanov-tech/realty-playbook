import { z } from "zod";

export const profileFormSchema = z.object({
  name: z
    .string()
    .max(100, "Имя не длиннее 100 символов"),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
