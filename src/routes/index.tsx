import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MentorX — Entrar na plataforma de videoaulas" },
      {
        name: "description",
        content:
          "Acede às tuas videoaulas MentorX. Área exclusiva para alunos com conta ativa.",
      },
      { property: "og:title", content: "MentorX — Plataforma de videoaulas" },
      {
        property: "og:description",
        content: "Área de alunos MentorX. Entra com o teu e-mail e senha.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (error) {
      toast.error("E-mail ou senha incorretos.");
      return;
    }
    navigate({ to: "/dashboard", replace: true });
  }

  async function handleRecover() {
    if (!email.trim()) {
      toast.error("Escreve o teu e-mail primeiro.");
      return;
    }
    setRecovering(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setRecovering(false);
    if (error) {
      toast.error("Não foi possível enviar o e-mail de recuperação.");
      return;
    }
    toast.success("Enviámos um e-mail com instruções para redefinir a senha.");
  }

  return (
    <main className="page-glow flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <span className="neon-glow inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 font-display text-2xl font-bold tracking-tight text-primary-foreground">
            MentorX
          </span>
          <h1 className="mt-6 text-xl font-semibold">Área do aluno</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Entra com os dados que recebeste por e-mail.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12"
              placeholder="teu@email.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12"
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" disabled={loading} className="h-12 w-full text-base">
            {loading ? "A entrar…" : "Entrar"}
          </Button>
        </form>

        <button
          type="button"
          onClick={handleRecover}
          disabled={recovering}
          className="mx-auto mt-6 block text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-accent"
        >
          {recovering ? "A enviar…" : "Esqueci a senha"}
        </button>
      </div>
    </main>
  );
}
