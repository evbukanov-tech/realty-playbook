import type { DbTarget } from "./types";

export function assertViewDbEnabled(): void {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.VIEW_DB_ENABLED !== "true"
  ) {
    throw new Error("view-db отключён в production");
  }
}

function isUnsetOrPlaceholder(url: string | undefined): boolean {
  if (!url) {
    return true;
  }
  return (
    url.includes("USER:PASSWORD@") ||
    url.includes("@localhost:5432/realty_playbook")
  );
}

export function getDatabaseUrl(target: DbTarget): string {
  if (target === "local") {
    const url = !isUnsetOrPlaceholder(process.env.DATABASE_URL_LOCAL)
      ? process.env.DATABASE_URL_LOCAL
      : (process.env.DIRECT_URL ?? process.env.DATABASE_URL);
    if (!url) {
      throw new Error(
        "Локальная БД: задайте DATABASE_URL_LOCAL, DIRECT_URL или DATABASE_URL в .env",
      );
    }
    return url;
  }

  const url = !isUnsetOrPlaceholder(process.env.DATABASE_URL_WORK)
    ? process.env.DATABASE_URL_WORK
    : process.env.DATABASE_URL;
  if (!url) {
    throw new Error("Рабочая БД: задайте DATABASE_URL_WORK или DATABASE_URL в .env");
  }
  return url;
}

export function parseDbTarget(value: string | null): DbTarget {
  if (value === "work") {
    return "work";
  }
  return "local";
}
