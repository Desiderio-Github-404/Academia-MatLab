import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { createStudent, listStudents } from "@/lib/admin.functions";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Administração — MentorX" },
      { name: "description", content: "Gestão de alunos, cursos e aulas da MentorX." },
      { property: "og:title", content: "Administração — MentorX" },
      {
        property: "og:description",
        content: "Gestão de alunos, cursos e aulas da MentorX.",
      },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user } = Route.useRouteContext();
  const queryClient = useQueryClient();
  const fetchStudents = useServerFn(listStudents);
  const addStudent = useServerFn(createStudent);

  const isAdmin = useQuery({
    queryKey: ["is-admin", user.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      return !!data;
    },
  });

  const students = useQuery({
    queryKey: ["admin-students"],
    queryFn: () => fetchStudents(),
    enabled: isAdmin.data === true,
  });

  const courses = useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: isAdmin.data === true,
  });

  // form states
  const [student, setStudent] = useState({ full_name: "", email: "", password: "" });
  const [access, setAccess] = useState({ user_id: "", course_id: "" });
  const [course, setCourse] = useState({
    title: "",
    description: "",
    cover_image_url: "",
  });
  const [lesson, setLesson] = useState({
    course_id: "",
    title: "",
    youtube_video_id: "",
    description: "",
    order_index: "1",
  });
  const [busy, setBusy] = useState(false);

  async function claimAdmin() {
    const { data, error } = await supabase.rpc("claim_admin");
    if (error || !data) {
      toast.error("Já existe um administrador definido.");
      return;
    }
    toast.success("Conta promovida a administrador.");
    queryClient.invalidateQueries();
  }

  if (isAdmin.isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
      </div>
    );
  }

  if (!isAdmin.data) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="mx-auto max-w-md px-4 py-20 text-center">
          <h1 className="text-xl font-semibold">Acesso restrito</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Esta área é exclusiva do administrador.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Button onClick={claimAdmin}>Sou o administrador desta plataforma</Button>
            <Button asChild variant="outline">
              <Link to="/dashboard">Voltar ao painel</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Este botão só funciona enquanto nenhuma conta for administrador.
          </p>
        </main>
      </div>
    );
  }

  async function submitStudent(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await addStudent({ data: student });
      setStudent({ full_name: "", email: "", password: "" });
      toast.success("Aluno criado com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
    } catch {
      toast.error("Não foi possível criar o aluno. Verifica os dados.");
    }
    setBusy(false);
  }

  async function submitAccess(e: React.FormEvent) {
    e.preventDefault();
    if (!access.user_id || !access.course_id) {
      toast.error("Escolhe o aluno e o curso.");
      return;
    }
    setBusy(true);
    const { error } = await supabase
      .from("course_access")
      .upsert(access, { onConflict: "user_id,course_id" });
    setBusy(false);
    if (error) {
      toast.error("Não foi possível conceder o acesso.");
      return;
    }
    toast.success("Acesso concedido.");
  }

  async function submitCourse(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.from("courses").insert({
      title: course.title,
      description: course.description || null,
      cover_image_url: course.cover_image_url || null,
    });
    setBusy(false);
    if (error) {
      toast.error("Não foi possível criar o curso.");
      return;
    }
    setCourse({ title: "", description: "", cover_image_url: "" });
    toast.success("Curso criado.");
    queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
  }

  async function submitLesson(e: React.FormEvent) {
    e.preventDefault();
    if (!lesson.course_id) {
      toast.error("Escolhe o curso da aula.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("lessons").insert({
      course_id: lesson.course_id,
      title: lesson.title,
      youtube_video_id: lesson.youtube_video_id.trim(),
      description: lesson.description || null,
      order_index: Number(lesson.order_index) || 1,
    });
    setBusy(false);
    if (error) {
      toast.error("Não foi possível criar a aula.");
      return;
    }
    setLesson({
      course_id: lesson.course_id,
      title: "",
      youtube_video_id: "",
      description: "",
      order_index: String((Number(lesson.order_index) || 1) + 1),
    });
    toast.success("Aula adicionada.");
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader isAdmin />
      <main className="mx-auto max-w-3xl space-y-10 px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight">Administração</h1>

        <Section title="Alunos registados">
          <ul className="divide-y divide-border rounded-xl border border-border">
            {(students.data ?? []).map((s) => (
              <li key={s.id} className="px-4 py-3">
                <p className="font-medium">{s.full_name ?? "Sem nome"}</p>
                <p className="text-sm text-muted-foreground break-all">{s.email}</p>
              </li>
            ))}
            {students.data?.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                Ainda não há alunos.
              </li>
            ) : null}
          </ul>
        </Section>

        <Section title="Adicionar aluno">
          <form onSubmit={submitStudent} className="space-y-4">
            <Field label="Nome">
              <Input
                className="h-12"
                value={student.full_name}
                onChange={(e) => setStudent({ ...student, full_name: e.target.value })}
                required
              />
            </Field>
            <Field label="E-mail">
              <Input
                type="email"
                className="h-12"
                value={student.email}
                onChange={(e) => setStudent({ ...student, email: e.target.value })}
                required
              />
            </Field>
            <Field label="Senha temporária">
              <Input
                className="h-12"
                value={student.password}
                onChange={(e) => setStudent({ ...student, password: e.target.value })}
                minLength={6}
                required
              />
            </Field>
            <Button type="submit" disabled={busy} className="h-12 w-full">
              Criar aluno
            </Button>
          </form>
        </Section>

        <Section title="Conceder acesso a um curso">
          <form onSubmit={submitAccess} className="space-y-4">
            <Field label="Aluno">
              <Select
                value={access.user_id}
                onValueChange={(v) => setAccess({ ...access, user_id: v })}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Escolher aluno" />
                </SelectTrigger>
                <SelectContent>
                  {(students.data ?? []).map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.full_name ?? s.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Curso">
              <Select
                value={access.course_id}
                onValueChange={(v) => setAccess({ ...access, course_id: v })}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Escolher curso" />
                </SelectTrigger>
                <SelectContent>
                  {(courses.data ?? []).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Button type="submit" disabled={busy} className="h-12 w-full">
              Conceder acesso
            </Button>
          </form>
        </Section>

        <Section title="Novo curso">
          <form onSubmit={submitCourse} className="space-y-4">
            <Field label="Título">
              <Input
                className="h-12"
                value={course.title}
                onChange={(e) => setCourse({ ...course, title: e.target.value })}
                required
              />
            </Field>
            <Field label="Descrição">
              <Textarea
                value={course.description}
                onChange={(e) => setCourse({ ...course, description: e.target.value })}
              />
            </Field>
            <Field label="URL da capa">
              <Input
                className="h-12"
                value={course.cover_image_url}
                onChange={(e) =>
                  setCourse({ ...course, cover_image_url: e.target.value })
                }
                placeholder="https://…"
              />
            </Field>
            <Button type="submit" disabled={busy} className="h-12 w-full">
              Criar curso
            </Button>
          </form>
        </Section>

        <Section title="Nova aula">
          <form onSubmit={submitLesson} className="space-y-4">
            <Field label="Curso">
              <Select
                value={lesson.course_id}
                onValueChange={(v) => setLesson({ ...lesson, course_id: v })}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Escolher curso" />
                </SelectTrigger>
                <SelectContent>
                  {(courses.data ?? []).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Título da aula">
              <Input
                className="h-12"
                value={lesson.title}
                onChange={(e) => setLesson({ ...lesson, title: e.target.value })}
                required
              />
            </Field>
            <Field label="ID do vídeo do YouTube">
              <Input
                className="h-12"
                value={lesson.youtube_video_id}
                onChange={(e) =>
                  setLesson({ ...lesson, youtube_video_id: e.target.value })
                }
                placeholder="dQw4w9WgXcQ"
                required
              />
            </Field>
            <Field label="Descrição">
              <Textarea
                value={lesson.description}
                onChange={(e) => setLesson({ ...lesson, description: e.target.value })}
              />
            </Field>
            <Field label="Ordem">
              <Input
                type="number"
                min={1}
                className="h-12"
                value={lesson.order_index}
                onChange={(e) => setLesson({ ...lesson, order_index: e.target.value })}
              />
            </Field>
            <Button type="submit" disabled={busy} className="h-12 w-full">
              Adicionar aula
            </Button>
          </form>
        </Section>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
