import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t bg-card">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6">
        <p>© ProStore {year}</p>
        <nav className="flex items-center gap-4">
          <Link
            href="/policy"
            className="transition-colors hover:text-foreground"
          >
            Политика
          </Link>
          <Link
            href="/contacts"
            className="transition-colors hover:text-foreground"
          >
            Контакты
          </Link>
        </nav>
      </div>
      <Separator />
    </footer>
  );
}
