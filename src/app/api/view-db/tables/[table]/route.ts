import { NextRequest, NextResponse } from "next/server";

import {
  assertViewDbEnabled,
  parseDbTarget,
} from "@/lib/view-db/config";
import {
  createTableRow,
  getTableRows,
} from "@/lib/view-db/crud";
import { createDbClient } from "@/lib/view-db/db";

type RouteContext = {
  params: Promise<{ table: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    assertViewDbEnabled();
    const { table } = await context.params;
    const db = parseDbTarget(request.nextUrl.searchParams.get("db"));
    const page = Number(request.nextUrl.searchParams.get("page") ?? "1");
    const pageSize = Number(request.nextUrl.searchParams.get("pageSize") ?? "20");
    const prisma = createDbClient(db);

    try {
      const result = await getTableRows(prisma, decodeURIComponent(table), page, pageSize);
      return NextResponse.json(result);
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка сервера";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    assertViewDbEnabled();
    const { table } = await context.params;
    const db = parseDbTarget(request.nextUrl.searchParams.get("db"));
    const body = (await request.json()) as Record<string, unknown>;
    const prisma = createDbClient(db);

    try {
      const row = await createTableRow(prisma, decodeURIComponent(table), body);
      return NextResponse.json({ row });
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка сервера";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
