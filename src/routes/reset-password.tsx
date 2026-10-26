import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Definir nova senha — MentorX" },
      {
        name: "description",
        content: "Define uma nova senha para a tua conta MentorX.",
      },
      { property: "og:title", content: "Definir nova senha — MentorX" },
      {
        property: "og:description",
        content: "Define uma nova senha para a tua conta MentorX.",
      },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      toast.error("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error("Não foi possível atualizar a senha. Pede um novo link.");
      return;
    }
    toast.success("Senha atualizada com sucesso.");
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <main className="page-glow flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="neon-glow inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 font-display text-2xl font-bold tracking-tight text-primary-foreground">
            MentorX
          </span>
          <h1 className="mt-6 text-center text-xl font-semibold">Definir nova senha</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
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
            <Label htmlFor="confirm">Confirmar senha</Label>
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
      </div>
    </main>
  );
}
