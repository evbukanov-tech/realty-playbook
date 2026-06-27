import Link from "next/link";
import { requireUserId } from "@/lib/session";
import { getMyPrompts } from "@/lib/prompts";
import { SignOutButton } from "@/components/SignOutButton";

export default async function MyPromptsPage() {
  const userId = await requireUserId();
  const prompts = await getMyPrompts(userId);

  return (
    <main>
      <header className="page-header">
        <div>
          <h1>Мои документы</h1>
          <p className="subtitle">
            Приватные документы видны только вам
          </p>
        </div>
        <SignOutButton />
      </header>

      <nav className="nav-links">
        <Link href="/dashboard">← Личный кабинет</Link>
      </nav>

      {prompts.length === 0 ? (
        <p className="empty">У вас пока нет документов</p>
      ) : (
        <ul>
          {prompts.map((prompt) => (
            <li key={prompt.id}>
              <strong>{prompt.title}</strong>
              <span className={`badge badge-${prompt.visibility.toLowerCase()}`}>
                {prompt.visibility === "PRIVATE" ? "Приватный" : "Публичный"}
              </span>
              {prompt.description && <p>{prompt.description}</p>}
              <time dateTime={prompt.updatedAt.toISOString()}>
                Обновлён: {prompt.updatedAt.toLocaleDateString("ru-RU")}
              </time>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
