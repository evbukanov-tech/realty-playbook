import { prisma } from "@/lib/prisma";

const ACTIVITY_LIMIT = 20;

export type ActivityType = "created" | "updated" | "liked";

export type ActivityItem = {
  id: string;
  type: ActivityType;
  promptId: string;
  promptTitle: string;
  occurredAt: Date;
};

function isNewPrompt(createdAt: Date, updatedAt: Date): boolean {
  return Math.abs(updatedAt.getTime() - createdAt.getTime()) < 60_000;
}

/** Последние действия пользователя на основе документов и лайков. */
export async function getRecentActivity(userId: string): Promise<ActivityItem[]> {
  const [prompts, likes] = await Promise.all([
    prisma.prompt.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: ACTIVITY_LIMIT,
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.like.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: ACTIVITY_LIMIT,
      include: {
        prompt: { select: { id: true, title: true } },
      },
    }),
  ]);

  const promptActivities: ActivityItem[] = prompts.map((prompt) => ({
    id: `prompt-${prompt.id}-${prompt.updatedAt.toISOString()}`,
    type: isNewPrompt(prompt.createdAt, prompt.updatedAt) ? "created" : "updated",
    promptId: prompt.id,
    promptTitle: prompt.title,
    occurredAt: prompt.updatedAt,
  }));

  const likeActivities: ActivityItem[] = likes.map((like) => ({
    id: `like-${like.id}`,
    type: "liked",
    promptId: like.prompt.id,
    promptTitle: like.prompt.title,
    occurredAt: like.createdAt,
  }));

  return [...promptActivities, ...likeActivities]
    .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
    .slice(0, ACTIVITY_LIMIT);
}
