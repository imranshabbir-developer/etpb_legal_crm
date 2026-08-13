import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={cn(
        "relative grid size-9 place-items-center rounded-full border border-border/70 bg-card/90 text-muted-foreground shadow-soft transition-all hover:border-primary/30 hover:text-primary",
        className,
      )}
    >
      <Sun className={cn("size-4 transition-all", isDark ? "scale-0 opacity-0 absolute" : "scale-100 opacity-100")} />
      <Moon className={cn("size-4 transition-all", isDark ? "scale-100 opacity-100" : "scale-0 opacity-0 absolute")} />
    </button>
  );
}
