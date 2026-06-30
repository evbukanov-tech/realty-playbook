import Link from "next/link";
import { auth, signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SignOutButton } from "@/components/SignOutButton";
import { HeaderMobileNav } from "@/components/layout/HeaderMobileNav";
import { HeaderUserMenu } from "@/components/layout/HeaderUserMenu";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Главная" },
  { href: "/catalog", label: "Каталог" },
] as const;

export async function Header() {
  const session = await auth();
  const user = session?.user;
  const myPromptsHref = user
    ? "/dashboard"
    : "/login?callbackUrl=%2Fdashboard";

  return (
    <header className="sticky top-0 z-50 border-b bg-card">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:h-16 sm:px-6">
        <Link
          href="/"
          className="shrink-0 text-lg font-bold tracking-tight text-foreground"
        >
          Realty Playbook
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={myPromptsHref}
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Мои промты
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <HeaderUserMenu
                name={user.name}
                email={user.email}
                image={user.image}
              />
              <SignOutButton className="hidden sm:inline-flex" />
            </>
          ) : (
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/" });
              }}
            >
              <Button type="submit" size="sm">
                Войти
              </Button>
            </form>
          )}

          <HeaderMobileNav
            isLoggedIn={!!user}
            className={cn("md:hidden")}
          />
        </div>
      </div>
      <Separator />
    </header>
  );
}
