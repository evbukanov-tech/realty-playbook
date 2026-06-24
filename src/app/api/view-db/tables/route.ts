import { NextRequest, NextResponse } from "next/server";

import {
  assertViewDbEnabled,
  parseDbTarget,
} from "@/lib/view-db/config";
import { createDbClient } from "@/lib/view-db/db";
import { listTables } from "@/lib/view-db/metadata";

export async function GET(request: NextRequest) {
  try {
    assertViewDbEnabled();
    const db = parseDbTarget(request.nextUrl.searchParams.get("db"));
    const prisma = createDbClient(db);

    try {
      const tables = await listTables(prisma);
      return NextResponse.json({ tables });
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка сервера";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
