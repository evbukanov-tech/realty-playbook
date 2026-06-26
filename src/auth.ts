import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

/**
 * Полная конфигурация Auth.js для серверной части.
 * - Google OAuth
 * - Server-side сессии в PostgreSQL через Prisma Adapter
 * - При первом входе пользователь создаётся в таблице User
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  // Database strategy — сессия хранится в таблице Session
  session: { strategy: "database" },
  callbacks: {
    // Пробрасываем стабильный userId в объект сессии
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});
