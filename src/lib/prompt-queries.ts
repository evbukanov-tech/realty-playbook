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

export type PromptSort = "popular" | "recent";

function mapPromptWithLikes<
  T extends {
    _count: { likes: number };
    likes?: { id: string }[];
  },
>(prompt: T, userId?: string) {
  const { _count, likes, ...rest } = prompt;
  return {
    ...rest,
    likesCount: _count.likes,
    likedByMe: userId ? (likes?.length ?? 0) > 0 : false,
  };
}

/** Документы текущего пользователя с поиском и лимитом. */
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

/** Публичные документы всех пользователей. */
export async function getPublicPrompts(
  query?: string,
  sort: PromptSort = "recent",
  userId?: string,
) {
  const search = buildSearchFilter(query);

  const prompts = await prisma.prompt.findMany({
    where: {
      isPublic: true,
      ...(search ?? {}),
    },
    orderBy:
      sort === "popular"
        ? { likes: { _count: "desc" } }
        : { createdAt: "desc" },
    take: PROMPT_LIST_LIMIT,
    include: {
      user: { select: { id: true, name: true, image: true } },
      _count: { select: { likes: true } },
      ...(userId
        ? {
            likes: {
              where: { userId },
              select: { id: true },
              take: 1,
            },
          }
        : {}),
    },
  });

  return prompts.map((prompt) => mapPromptWithLikes(prompt, userId));
}

/** Избранные документы текущего пользователя. */
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
