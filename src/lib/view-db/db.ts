import { PrismaClient } from "@prisma/client";

import { getDatabaseUrl } from "./config";
import type { DbTarget } from "./types";

export function createDbClient(target: DbTarget): PrismaClient {
  return new PrismaClient({
    datasources: {
      db: { url: getDatabaseUrl(target) },
    },
  });
}

export function quoteIdent(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}
