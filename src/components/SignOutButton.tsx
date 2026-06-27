import { signOutAction } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SignOutButtonProps = {
  className?: string;
};

export function SignOutButton({ className }: SignOutButtonProps) {
  return (
    <form action={signOutAction}>
      <Button type="submit" variant="outline" className={cn(className)}>
        Выйти
      </Button>
    </form>
  );
}
