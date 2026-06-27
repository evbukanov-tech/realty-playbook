"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import {
  promptFormSchema,
  promptIdSchema,
  type PromptFormValues,
} from "@/lib/validations/prompt";

const DASHBOARD_PATHS = [
  "/dashboard",
  "/dashboard/public",
  "/dashboard/favorites",
] as const;

function revalidateDashboard() {
  for (const path of DASHBOARD_PATHS) {
    revalidatePath(path);
  }
}

export type ActionResult =
  | { success: true }
  | { success: false; error: string };

async function getOwnedPrompt(id: string, userId: string) {
  return prisma.prompt.findFirst({
    where: { id, userId },
  });
}

export async function createPrompt(
  values: PromptFormValues,
): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = promptFormSchema.safeParse(values);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Неверные данные" };
  }

  const { title, content, isPublic } = parsed.data;

  await prisma.prompt.create({
    data: { userId, title, content, isPublic },
  });

  revalidateDashboard();
  return { success: true };
}

export async function updatePrompt(
  id: string,
  values: PromptFormValues,
): Promise<ActionResult> {
  const userId = await requireUserId();
  const idParsed = promptIdSchema.safeParse({ id });
  const valuesParsed = promptFormSchema.safeParse(values);

  if (!idParsed.success || !valuesParsed.success) {
    return { success: false, error: "Неверные данные" };
  }

  const existing = await getOwnedPrompt(id, userId);
  if (!existing) {
    return { success: false, error: "Промт не найден или нет доступа" };
  }

  const { title, content, isPublic } = valuesParsed.data;

  await prisma.prompt.update({
    where: { id },
    data: { title, content, isPublic },
  });

  revalidateDashboard();
  return { success: true };
}

export async function deletePrompt(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  const idParsed = promptIdSchema.safeParse({ id });

  if (!idParsed.success) {
    return { success: false, error: "Неверный идентификатор" };
  }

  const existing = await getOwnedPrompt(id, userId);
  if (!existing) {
    return { success: false, error: "Промт не найден или нет доступа" };
  }

  await prisma.prompt.delete({ where: { id } });

  revalidateDashboard();
  return { success: true };
}

export async function togglePublic(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  const idParsed = promptIdSchema.safeParse({ id });

  if (!idParsed.success) {
    return { success: false, error: "Неверный идентификатор" };
  }

  const existing = await getOwnedPrompt(id, userId);
  if (!existing) {
    return { success: false, error: "Промт не найден или нет доступа" };
  }

  await prisma.prompt.update({
    where: { id },
    data: { isPublic: !existing.isPublic },
  });

  revalidateDashboard();
  return { success: true };
}

export async function toggleFavorite(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  const idParsed = promptIdSchema.safeParse({ id });

  if (!idParsed.success) {
    return { success: false, error: "Неверный идентификатор" };
  }

  const existing = await getOwnedPrompt(id, userId);
  if (!existing) {
    return { success: false, error: "Промт не найден или нет доступа" };
  }

  await prisma.prompt.update({
    where: { id },
    data: { isFavorite: !existing.isFavorite },
  });

  revalidateDashboard();
  return { success: true };
}
