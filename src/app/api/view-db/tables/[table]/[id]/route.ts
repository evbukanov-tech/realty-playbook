import { NextRequest, NextResponse } from "next/server";

import {
  assertViewDbEnabled,
  parseDbTarget,
} from "@/lib/view-db/config";
import {
  deleteTableRow,
  updateTableRow,
} from "@/lib/view-db/crud";
import { createDbClient } from "@/lib/view-db/db";

type RouteContext = {
  params: Promise<{ table: string; id: string }>;
};

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    assertViewDbEnabled();
    const { table, id } = await context.params;
    const db = parseDbTarget(request.nextUrl.searchParams.get("db"));
    const body = (await request.json()) as Record<string, unknown>;
    const prisma = createDbClient(db);

    try {
      const row = await updateTableRow(
        prisma,
        decodeURIComponent(table),
        decodeURIComponent(id),
        body,
      );
      return NextResponse.json({ row });
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка сервера";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    assertViewDbEnabled();
    const { table, id } = await context.params;
    const db = parseDbTarget(request.nextUrl.searchParams.get("db"));
    const prisma = createDbClient(db);

    try {
      await deleteTableRow(
        prisma,
        decodeURIComponent(table),
        decodeURIComponent(id),
      );
      return NextResponse.json({ ok: true });
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка сервера";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
