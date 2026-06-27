import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const PROMPT_LIST_LIMIT = 10;

function buildSearchFilter(query?: string): Prisma.PromptWhereInput | undefined {
  if (!query?.trim()) return undefined;

  const q = query.trim();
  return {
    OR: [
      { title: { contains: q, mode: "insensitive" } },
      { content: { contains: q, mode: "insensitive" } },
    ],
  };
}

export type PromptWithUser = Awaited<ReturnType<typeof getPublicPrompts>>[number];

/** Промты текущего пользователя с поиском и лимитом. */
export async function getUserPrompts(userId: string, query?: string) {
  const search = buildSearchFilter(query);

  return prisma.prompt.findMany({
    where: {
      userId,
      ...(search ?? {}),
    },
    orderBy: { updatedAt: "desc" },
    take: PROMPT_LIST_LIMIT,
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  });
}

/** Публичные промты всех пользователей. */
export async function getPublicPrompts(query?: string) {
  const search = buildSearchFilter(query);

  return prisma.prompt.findMany({
    where: {
      isPublic: true,
      ...(search ?? {}),
    },
    orderBy: { createdAt: "desc" },
    take: PROMPT_LIST_LIMIT,
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  });
}

/** Избранные промты текущего пользователя. */
export async function getFavoritePrompts(userId: string, query?: string) {
  const search = buildSearchFilter(query);

  return prisma.prompt.findMany({
    where: {
      userId,
      isFavorite: true,
      ...(search ?? {}),
    },
    orderBy: { updatedAt: "desc" },
    take: PROMPT_LIST_LIMIT,
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  });
}

export function getPromptPreview(content: string, maxLength = 160): string {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trimEnd()}…`;
}
