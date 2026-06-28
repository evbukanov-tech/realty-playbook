import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, { params }: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Войдите в аккаунт, чтобы поставить лайк" },
        { status: 401 },
      );
    }

    const { id: promptId } = await params;

    const prompt = await prisma.prompt.findUnique({
      where: { id: promptId },
      select: { id: true, isPublic: true },
    });

    if (!prompt || !prompt.isPublic) {
      return NextResponse.json(
        { error: "Документ не найден" },
        { status: 404 },
      );
    }

    const userId = session.user.id;

    const existing = await prisma.like.findUnique({
      where: {
        userId_promptId: { userId, promptId },
      },
    });

    let liked: boolean;

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      liked = false;
    } else {
      await prisma.like.create({ data: { userId, promptId } });
      liked = true;
    }

    const likesCount = await prisma.like.count({
      where: { promptId },
    });

    return NextResponse.json({ liked, likesCount });
  } catch (error) {
    console.error("POST /api/prompts/[id]/like:", error);
    return NextResponse.json({ error: "Попробуйте позже" }, { status: 503 });
  }
}
