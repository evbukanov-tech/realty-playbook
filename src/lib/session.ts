import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * Возвращает текущую сессию или null.
 * Используйте в Server Components и Server Actions.
 */
export async function getSession() {
  return auth();
}

/**
 * Возвращает userId авторизованного пользователя.
 * Редиректит на /login, если сессии нет.
 */
export async function requireUserId(): Promise<string> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return session.user.id;
}

/**
 * Возвращает полную сессию с обязательным userId.
 * Редиректит на /login, если пользователь не авторизован.
 */
export async function requireSession() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return session;
}
