import type { PrismaClient } from "@prisma/client";

import type { ColumnInfo } from "./types";

export async function listTables(prisma: PrismaClient): Promise<string[]> {
  const tables = await prisma.$queryRaw<{ table_name: string }[]>`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `;

  return tables.map((row) => row.table_name);
}

export async function getTableColumns(
  prisma: PrismaClient,
  table: string,
): Promise<ColumnInfo[]> {
  const columns = await prisma.$queryRaw<
    {
      column_name: string;
      data_type: string;
      is_nullable: string;
      column_default: string | null;
    }[]
  >`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = ${table}
    ORDER BY ordinal_position
  `;

  const primaryKeys = await prisma.$queryRaw<{ column_name: string }[]>`
    SELECT kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    WHERE tc.table_schema = 'public'
      AND tc.table_name = ${table}
      AND tc.constraint_type = 'PRIMARY KEY'
    ORDER BY kcu.ordinal_position
  `;

  const pkSet = new Set(primaryKeys.map((row) => row.column_name));

  return columns.map((column) => ({
    name: column.column_name,
    dataType: column.data_type,
    isNullable: column.is_nullable === "YES",
    hasDefault: column.column_default !== null,
    isPrimaryKey: pkSet.has(column.column_name),
  }));
}

export async function assertTableExists(
  prisma: PrismaClient,
  table: string,
): Promise<void> {
  const tables = await listTables(prisma);
  if (!tables.includes(table)) {
    throw new Error(`Таблица «${table}» не найдена`);
  }
}

export function getPrimaryKeyColumn(columns: ColumnInfo[]): string {
  const pk = columns.find((column) => column.isPrimaryKey);
  if (!pk) {
    throw new Error("У таблицы нет первичного ключа");
  }
  return pk.name;
}
