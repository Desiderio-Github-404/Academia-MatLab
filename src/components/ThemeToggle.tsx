import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const THEME_KEY = "mentorx-theme";

export function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_KEY);
    const light = savedTheme === "light";
    document.documentElement.classList.toggle("light", light);
    document.documentElement.style.colorScheme = light ? "light" : "dark";
    setIsLight(light);
  }, []);

  function toggleTheme() {
    const nextIsLight = !isLight;
    document.documentElement.classList.toggle("light", nextIsLight);
    document.documentElement.style.colorScheme = nextIsLight ? "light" : "dark";
    window.localStorage.setItem(THEME_KEY, nextIsLight ? "light" : "dark");
    setIsLight(nextIsLight);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isLight ? "Activar modo escuro" : "Activar modo claro"}
      title={isLight ? "Activar modo escuro" : "Activar modo claro"}
      className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {isLight ? <Moon className="size-4" /> : <Sun className="size-4" />}
    </button>
  );
}
