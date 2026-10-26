import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Painel do aluno — MentorX" },
      { name: "description", content: "Os teus cursos e videoaulas MentorX num só lugar." },
      { property: "og:title", content: "Painel do aluno — MentorX" },
      { property: "og:description", content: "Os teus cursos e videoaulas MentorX num só lugar." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = Route.useRouteContext();
  const profile = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("full_name, email").eq("id", user.id).maybeSingle();
      return data;
    },
  });
  const isAdmin = useQuery({
    queryKey: ["is-admin", user.id],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
      return !!data;
    },
  });
  const courses = useQuery({
    queryKey: ["my-courses", user.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("id, title, description, cover_image_url").order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
  const lessons = useQuery({
    queryKey: ["lessons-index", user.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("lessons").select("id, course_id");
      if (error) throw error;
      return data ?? [];
    },
  });
  const progress = useQuery({
    queryKey: ["progress-all", user.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("lesson_progress").select("lesson_id, completed").eq("user_id", user.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  const displayName = profile.data?.full_name || user.email;
  const firstName = profile.data?.full_name?.split(" ")[0];
  const doneIds = new Set((progress.data ?? []).filter((p) => p.completed).map((p) => p.lesson_id));
  const stats = new Map<string, { total: number; done: number }>();
  for (const lesson of lessons.data ?? []) {
    const entry = stats.get(lesson.course_id) ?? { total: 0, done: 0 };
    entry.total += 1;
    if (doneIds.has(lesson.id)) entry.done += 1;
    stats.set(lesson.course_id, entry);
  }
  const courseList = courses.data ?? [];
  const nextCourse = courseList.find((c) => {
    const s = stats.get(c.id);
    return s && s.done < s.total;
  }) ?? courseList[0];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader name={displayName} isAdmin={isAdmin.data} />
      <main className="mx-auto max-w-5xl px-4 pb-16">
        <section className="page-glow -mx-4 rounded-b-3xl px-4 pb-10 pt-10 text-center">
          <span className="neon-glow inline-flex items-center justify-center rounded-xl bg-neutral-950 px-4 py-2 font-display text-2xl font-bold tracking-tight text-white">MentorX</span>
          <h1 className="mt-6 text-3xl font-bold tracking-tight">Bem-vindo de volta{firstName ? `, ${firstName}` : ""}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {courses.isLoading ? "A carregar os teus cursos…" : courseList.length === 0
              ? "Os teus cursos aparecem aqui depois de o acesso ser ativado."
              : `${courseList.length} ${courseList.length === 1 ? "curso de formação" : "cursos de formação"} · do fundamento à mestria.`}
          </p>
        </section>
        {nextCourse ? (
          <Link to="/curso/$id" params={{ id: nextCourse.id }}
            className="mt-2 flex h-14 w-full items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground shadow-glow transition-[filter] hover:brightness-110">
            Continuar a aprender
          </Link>
        ) : null}
        <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.isLoading
            ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)
            : courseList.map((course, i) => {
                const s = stats.get(course.id) ?? { total: 0, done: 0 };
                const pct = s.total ? Math.round((s.done / s.total) * 100) : 0;
                return (
                  <Link key={course.id} to="/curso/$id" params={{ id: course.id }}
                    className="group overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-transform hover:-translate-y-1">
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-secondary">
                      {course.cover_image_url ? <img src={course.cover_image_url} alt={`Capa do curso ${course.title}`} loading="lazy" className="h-full w-full object-cover" />
                        : <div className="flex h-full w-full items-center justify-center bg-neutral-950 font-display text-sm font-bold text-white">MentorX</div>}
                      <span className="absolute right-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground shadow-glow">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <div className="p-4">
                      <h2 className="font-display text-base font-bold leading-snug">{course.title}</h2>
                      <p className="mt-0.5 text-xs text-muted-foreground">{lessons.isLoading ? "…" : `${s.total} ${s.total === 1 ? "aula" : "aulas"}`}</p>
                      <div className="mt-3 flex items-center gap-3">
                        <Progress value={pct} className="h-1.5 flex-1" />
                        <span className="text-xs font-semibold text-primary">{pct}%</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
        </section>
        {!courses.isLoading && courseList.length === 0 ? (
          <p className="mt-12 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Ainda não tens cursos disponíveis. O acesso é ativado após a confirmação do pagamento.
          </p>
        ) : null}
      </main>
    </div>
  );
}
