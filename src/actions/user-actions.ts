"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { profileFormSchema, type ProfileFormValues } from "@/lib/validations/user";

export type ActionResult =
  | { success: true }
  | { success: false; error: string };

export async function updateProfile(
  values: ProfileFormValues,
): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = profileFormSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Неверные данные",
    };
  }

  const name = parsed.data.name.trim();

  await prisma.user.update({
    where: { id: userId },
    data: { name: name || null },
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard", "layout");

  return { success: true };
}
