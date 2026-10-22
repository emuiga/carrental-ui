"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const active = mounted ? (theme === "system" ? resolvedTheme : theme) : undefined;

  return (
    <div className="flex items-center gap-0.5 rounded-md bg-muted p-0.5">
      <button
        type="button"
        aria-label="Light mode"
        onClick={() => setTheme("light")}
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded transition-colors",
          active === "light" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Sun className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        aria-label="Dark mode"
        onClick={() => setTheme("dark")}
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded transition-colors",
          active === "dark" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Moon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
