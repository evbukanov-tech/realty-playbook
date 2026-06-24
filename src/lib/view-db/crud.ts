import type { PrismaClient } from "@prisma/client";

import { quoteIdent } from "./db";
import {
  assertTableExists,
  getPrimaryKeyColumn,
  getTableColumns,
} from "./metadata";
import type { ColumnInfo, TableRowsResult } from "./types";

const DEFAULT_PAGE_SIZE = 20;

function serializeValue(value: unknown): unknown {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === "bigint") {
    return value.toString();
  }
  return value;
}

function serializeRow(row: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key, serializeValue(value)]),
  );
}

function editableColumns(columns: ColumnInfo[]): ColumnInfo[] {
  return columns.filter(
    (column) =>
      !column.isPrimaryKey &&
      !(
        column.hasDefault &&
        (column.name === "createdAt" ||
          column.name === "updatedAt" ||
          column.name === "id")
      ),
  );
}

function normalizeInputValue(
  column: ColumnInfo,
  value: unknown,
): unknown {
  if (value === "" || value === null || value === undefined) {
    if (column.isNullable) {
      return null;
    }
    throw new Error(`Поле «${column.name}» обязательно`);
  }

  if (
    column.dataType.includes("int") ||
    column.dataType === "numeric" ||
    column.dataType === "double precision" ||
    column.dataType === "real"
  ) {
    const number = Number(value);
    if (Number.isNaN(number)) {
      throw new Error(`Поле «${column.name}» должно быть числом`);
    }
    return number;
  }

  if (column.dataType === "boolean") {
    if (value === true || value === false) {
      return value;
    }
    if (value === "true") {
      return true;
    }
    if (value === "false") {
      return false;
    }
    throw new Error(`Поле «${column.name}» должно быть true/false`);
  }

  if (
    column.dataType.includes("timestamp") ||
    column.dataType === "date"
  ) {
    return new Date(String(value));
  }

  return String(value);
}

function pickAllowedFields(
  columns: ColumnInfo[],
  data: Record<string, unknown>,
): Record<string, unknown> {
  const allowed = new Set(columns.map((column) => column.name));
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (!allowed.has(key)) {
      continue;
    }
    const column = columns.find((item) => item.name === key);
    if (!column) {
      continue;
    }
    result[key] = normalizeInputValue(column, value);
  }

  return result;
}

export async function getTableRows(
  prisma: PrismaClient,
  table: string,
  page: number,
  pageSize: number = DEFAULT_PAGE_SIZE,
): Promise<TableRowsResult> {
  await assertTableExists(prisma, table);
  const columns = await getTableColumns(prisma, table);
  const orderColumn = columns[0]?.name ?? "1";
  const safePage = Math.max(1, page);
  const safePageSize = Math.min(100, Math.max(1, pageSize));
  const offset = (safePage - 1) * safePageSize;

  const countResult = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
    `SELECT COUNT(*)::bigint AS count FROM ${quoteIdent(table)}`,
  );
  const total = Number(countResult[0]?.count ?? 0);

  const rows = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
    `SELECT * FROM ${quoteIdent(table)} ORDER BY ${quoteIdent(orderColumn)} LIMIT $1 OFFSET $2`,
    safePageSize,
    offset,
  );

  return {
    columns,
    rows: rows.map(serializeRow),
    total,
    page: safePage,
    pageSize: safePageSize,
  };
}

export async function createTableRow(
  prisma: PrismaClient,
  table: string,
  data: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  await assertTableExists(prisma, table);
  const columns = await getTableColumns(prisma, table);
  const writable = editableColumns(columns);
  const values = pickAllowedFields(writable, data);
  const keys = Object.keys(values);

  if (keys.length === 0) {
    throw new Error("Нет данных для создания записи");
  }

  const columnList = keys.map(quoteIdent).join(", ");
  const placeholders = keys.map((_, index) => `$${index + 1}`).join(", ");
  const params = keys.map((key) => values[key]);

  const inserted = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
    `INSERT INTO ${quoteIdent(table)} (${columnList}) VALUES (${placeholders}) RETURNING *`,
    ...params,
  );

  return serializeRow(inserted[0]);
}

export async function updateTableRow(
  prisma: PrismaClient,
  table: string,
  id: string,
  data: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  await assertTableExists(prisma, table);
  const columns = await getTableColumns(prisma, table);
  const pkColumn = getPrimaryKeyColumn(columns);
  const writable = editableColumns(columns).filter(
    (column) => !column.isPrimaryKey,
  );
  const values = pickAllowedFields(writable, data);
  const keys = Object.keys(values);

  if (keys.length === 0) {
    throw new Error("Нет данных для обновления");
  }

  const setClause = keys
    .map((key, index) => `${quoteIdent(key)} = $${index + 1}`)
    .join(", ");
  const params = [...keys.map((key) => values[key]), id];

  const updated = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
    `UPDATE ${quoteIdent(table)} SET ${setClause} WHERE ${quoteIdent(pkColumn)} = $${keys.length + 1} RETURNING *`,
    ...params,
  );

  if (updated.length === 0) {
    throw new Error("Запись не найдена");
  }

  return serializeRow(updated[0]);
}

export async function deleteTableRow(
  prisma: PrismaClient,
  table: string,
  id: string,
): Promise<void> {
  await assertTableExists(prisma, table);
  const columns = await getTableColumns(prisma, table);
  const pkColumn = getPrimaryKeyColumn(columns);

  const deleted = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
    `DELETE FROM ${quoteIdent(table)} WHERE ${quoteIdent(pkColumn)} = $1 RETURNING ${quoteIdent(pkColumn)}`,
    id,
  );

  if (deleted.length === 0) {
    throw new Error("Запись не найдена");
  }
}
