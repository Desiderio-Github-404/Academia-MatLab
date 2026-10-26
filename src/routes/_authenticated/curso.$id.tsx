import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/curso/$id")({
  head: () => ({
    meta: [
      { title: "Curso — MentorX" },
      { name: "description", content: "Assiste às videoaulas do teu curso MentorX." },
      { property: "og:title", content: "Curso — MentorX" },
      {
        property: "og:description",
        content: "Assiste às videoaulas do teu curso MentorX.",
      },
    ],
  }),
  component: CoursePage,
});

function CoursePage() {
  const { id } = Route.useParams();
  const { user } = Route.useRouteContext();
  const queryClient = useQueryClient();

  const course = useQuery({
    queryKey: ["course", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title, description")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const lessons = useQuery({
    queryKey: ["lessons", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("id, title, description, youtube_video_id, order_index")
        .eq("course_id", id)
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const progress = useQuery({
    queryKey: ["progress", id, user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lesson_progress")
        .select("lesson_id, completed")
        .eq("user_id", user.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  const doneIds = new Set(
    (progress.data ?? []).filter((p) => p.completed).map((p) => p.lesson_id),
  );
  const total = lessons.data?.length ?? 0;
  const done = (lessons.data ?? []).filter((l) => doneIds.has(l.id)).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  async function toggle(lessonId: string) {
    const completed = !doneIds.has(lessonId);
    const { error } = await supabase.from("lesson_progress").upsert(
      {
        user_id: user.id,
        lesson_id: lessonId,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      },
      { onConflict: "user_id,lesson_id" },
    );
    if (error) {
      toast.error("Não foi possível guardar o progresso.");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["progress", id, user.id] });
  }

  if (!course.isLoading && !course.data) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="mx-auto max-w-2xl px-4 py-20 text-center">
          <h1 className="text-xl font-semibold">Curso indisponível</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Não tens acesso a este curso.
          </p>
          <Button asChild className="mt-6">
            <Link to="/dashboard">Voltar ao painel</Link>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight">{course.data?.title}</h1>
        {course.data?.description ? (
          <p className="mt-1 text-sm text-muted-foreground">{course.data.description}</p>
        ) : null}

        <div className="mt-6 rounded-xl border border-border bg-surface p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">Progresso do curso</span>
            <span className="text-muted-foreground">
              {done}/{total} aulas · {pct}%
            </span>
          </div>
          <Progress value={pct} className="h-2" />
        </div>

        <ol className="mt-8 space-y-6">
          {(lessons.data ?? []).map((lesson, i) => {
            const isDone = doneIds.has(lesson.id);
            return (
              <li
                key={lesson.id}
                className="overflow-hidden rounded-xl border border-border bg-card shadow-card"
              >
                <div className="flex items-start justify-between gap-3 p-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                      Módulo {i + 1}
                    </p>
                    <h2 className="mt-1 font-semibold leading-snug">{lesson.title}</h2>
                    {lesson.description ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {lesson.description}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    aria-label={isDone ? "Marcar como não assistida" : "Marcar como assistida"}
                    onClick={() => toggle(lesson.id)}
                    className={`flex size-9 shrink-0 items-center justify-center rounded-full border transition-colors ${
                      isDone
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    <Check className="size-4" />
                  </button>
                </div>
                <div className="aspect-video w-full bg-secondary">
                  <iframe
                    className="h-full w-full"
                    src={`https://www.youtube.com/embed/${lesson.youtube_video_id}`}
                    title={lesson.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </li>
            );
          })}
        </ol>

        {!lessons.isLoading && total === 0 ? (
          <p className="mt-10 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Ainda não há aulas publicadas neste curso.
          </p>
        ) : null}
      </main>
    </div>
  );
}
