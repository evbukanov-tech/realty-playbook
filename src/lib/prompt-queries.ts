import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const PROMPT_LIST_LIMIT = 10;
const HOME_PROMPTS_LIMIT = 15;

export type PublicPromptListItem = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  likesCount: number;
  likedByMe: boolean;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
};

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

function buildLikesInclude(userId?: string) {
  return {
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
  };
}

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

  const prompts = await prisma.prompt.findMany({
    where: {
      userId,
      ...(search ?? {}),
    },
    orderBy: { updatedAt: "desc" },
    take: PROMPT_LIST_LIMIT,
    include: {
      user: { select: { id: true, name: true, image: true } },
      ...buildLikesInclude(userId),
    },
  });

  return prompts.map((prompt) => mapPromptWithLikes(prompt, userId));
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
      ...buildLikesInclude(userId),
    },
  });

  return prompts.map((prompt) => mapPromptWithLikes(prompt, userId));
}

/** Избранные документы текущего пользователя. */
export async function getFavoritePrompts(userId: string, query?: string) {
  const search = buildSearchFilter(query);

  const prompts = await prisma.prompt.findMany({
    where: {
      userId,
      isFavorite: true,
      ...(search ?? {}),
    },
    orderBy: { updatedAt: "desc" },
    take: PROMPT_LIST_LIMIT,
    include: {
      user: { select: { id: true, name: true, image: true } },
      ...buildLikesInclude(userId),
    },
  });

  return prompts.map((prompt) => mapPromptWithLikes(prompt, userId));
}

export function getPromptPreview(content: string, maxLength = 160): string {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trimEnd()}…`;
}

async function getLikedPromptIds(
  userId: string,
  promptIds: string[],
): Promise<Set<string>> {
  if (promptIds.length === 0) return new Set();

  const likes = await prisma.like.findMany({
    where: { userId, promptId: { in: promptIds } },
    select: { promptId: true },
  });

  return new Set(likes.map((like) => like.promptId));
}

function mapPublicPrompt<
  T extends {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    user: { id: string; name: string | null; image: string | null };
    _count: { likes: number };
  },
>(prompt: T, likedIds: Set<string>): PublicPromptListItem {
  return {
    id: prompt.id,
    title: prompt.title,
    content: prompt.content,
    createdAt: prompt.createdAt,
    likesCount: prompt._count.likes,
    likedByMe: likedIds.has(prompt.id),
    user: prompt.user,
  };
}

const publicPromptInclude = {
  user: { select: { id: true, name: true, image: true } },
  _count: { select: { likes: true } },
} as const;

/** Данные для главной: новые и популярные публичные промты. */
export async function getHomePrompts(userId?: string) {
  const publicWhere = { isPublic: true };

  const [recentRaw, popularRaw] = await Promise.all([
    prisma.prompt.findMany({
      where: publicWhere,
      orderBy: { createdAt: "desc" },
      take: HOME_PROMPTS_LIMIT,
      include: publicPromptInclude,
    }),
    prisma.prompt.findMany({
      where: publicWhere,
      orderBy: { likes: { _count: "desc" } },
      take: HOME_PROMPTS_LIMIT,
      include: publicPromptInclude,
    }),
  ]);

  const allIds = [
    ...new Set([...recentRaw, ...popularRaw].map((prompt) => prompt.id)),
  ];
  const likedIds = userId
    ? await getLikedPromptIds(userId, allIds)
    : new Set<string>();

  return {
    recentPrompts: recentRaw.map((prompt) => mapPublicPrompt(prompt, likedIds)),
    popularPrompts: popularRaw.map((prompt) =>
      mapPublicPrompt(prompt, likedIds),
    ),
  };
}

/** Публичный промт по id (для страницы просмотра). */
export async function getPublicPromptById(id: string, userId?: string) {
  const prompt = await prisma.prompt.findFirst({
    where: { id, isPublic: true },
    include: publicPromptInclude,
  });

  if (!prompt) return null;

  const likedIds = userId
    ? await getLikedPromptIds(userId, [prompt.id])
    : new Set<string>();

  return mapPublicPrompt(prompt, likedIds);
}
