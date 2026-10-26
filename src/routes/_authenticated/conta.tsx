import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/conta")({
  head: () => ({
    meta: [
      { title: "Minha conta — MentorX" },
      { name: "description", content: "Gere a tua conta e altera a tua senha MentorX." },
      { property: "og:title", content: "Minha conta — MentorX" },
      {
        property: "og:description",
        content: "Gere a tua conta e altera a tua senha MentorX.",
      },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user } = Route.useRouteContext();
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      toast.error("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password,
      current_password: current,
    } as Parameters<typeof supabase.auth.updateUser>[0]);
    setLoading(false);
    if (error) {
      toast.error("Não foi possível alterar a senha. Verifica a senha atual.");
      return;
    }
    setCurrent("");
    setPassword("");
    setConfirm("");
    toast.success("Senha alterada com sucesso.");
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-md px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight">Minha conta</h1>

        <div className="mt-6 rounded-xl border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">E-mail</p>
          <p className="mt-1 font-medium break-all">{user.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <h2 className="font-semibold">Alterar senha</h2>
          <div className="space-y-2">
            <Label htmlFor="current">Senha atual</Label>
            <Input
              id="current"
              type="password"
              className="h-12"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new">Nova senha</Label>
            <Input
              id="new"
              type="password"
              className="h-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirmar nova senha</Label>
            <Input
              id="confirm"
              type="password"
              className="h-12"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="h-12 w-full text-base">
            {loading ? "A guardar…" : "Guardar nova senha"}
          </Button>
        </form>
      </main>
    </div>
  );
}
