import { prisma } from "@/lib/prisma";

export async function getUserProfile(userId: string) {
  const [user, favoriteCount] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        _count: {
          select: {
            prompts: true,
            likes: true,
          },
        },
      },
    }),
    prisma.prompt.count({
      where: { userId, isFavorite: true },
    }),
  ]);

  return {
    ...user,
    favoriteCount,
  };
}

export type UserProfile = Awaited<ReturnType<typeof getUserProfile>>;
