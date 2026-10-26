import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function AppHeader({
  name,
  isAdmin,
}: {
  name?: string | null | undefined;
  isAdmin?: boolean | undefined;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link
          to="/dashboard"
          className="font-display text-lg font-bold tracking-tight text-primary neon-text"
        >
          MentorX
        </Link>
        <div className="flex items-center gap-2">
          {name ? (
            <span className="hidden max-w-[140px] truncate text-sm text-muted-foreground sm:block">
              {name}
            </span>
          ) : null}
          {isAdmin ? (
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin">Admin</Link>
            </Button>
          ) : null}
          <Button asChild variant="ghost" size="sm">
            <Link to="/conta">Conta</Link>
          </Button>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}
