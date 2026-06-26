import Link from "next/link";
import { requireSession } from "@/lib/session";
import { SignOutButton } from "@/components/SignOutButton";

export default async function DashboardPage() {
  const session = await requireSession();
  const { user } = session;

  return (
    <main>
      <header className="page-header">
        <div>
          <h1>Личный кабинет</h1>
          <p className="subtitle">Добро пожаловать, {user.name ?? user.email}</p>
        </div>
        <SignOutButton />
      </header>

      {user.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.image}
          alt=""
          width={64}
          height={64}
          className="avatar"
        />
      )}

      <nav className="nav-links">
        <Link href="/my-prompts">Мои промты</Link>
      </nav>

      <dl className="user-info">
        <dt>User ID</dt>
        <dd><code>{user.id}</code></dd>
        <dt>Email</dt>
        <dd>{user.email}</dd>
      </dl>
    </main>
  );
}
