import { Visibility } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Документы текущего пользователя (включая приватные).
 */
export async function getMyPrompts(userId: string) {
  return prisma.realtyPlaybook.findMany({
    where: { ownerId: userId },
    orderBy: { updatedAt: "desc" },
    include: {
      category: true,
      tags: true,
      _count: { select: { votes: true } },
    },
  });
}

/**
 * Публичные документы для каталога (без приватных).
 */
export async function getPublicPrompts() {
  return prisma.realtyPlaybook.findMany({
    where: { visibility: Visibility.PUBLIC },
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      owner: { select: { id: true, name: true, image: true } },
      _count: { select: { votes: true } },
    },
  });
}

/**
 * Один документ с проверкой доступа:
 * - публичный — виден всем
 * - приватный — только владельцу
 */
export async function getPromptById(promptId: string, userId?: string) {
  const prompt = await prisma.realtyPlaybook.findUnique({
    where: { id: promptId },
    include: {
      category: true,
      tags: true,
      owner: { select: { id: true, name: true, image: true } },
      _count: { select: { votes: true } },
    },
  });

  if (!prompt) return null;

  const isOwner = userId === prompt.ownerId;
  const isPublic = prompt.visibility === Visibility.PUBLIC;

  if (!isPublic && !isOwner) {
    return null;
  }

  return prompt;
}
