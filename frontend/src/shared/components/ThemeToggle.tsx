"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { MoonIcon, Sun } from "lucide-react";
import Tooltip from "./Tooltip";


interface ThemeToggleProps {
  position?: "top" | "bottom" | "left" | "right";
}

export default function ThemeToggle({position}: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="p-2 w-9 h-9" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Tooltip content={isDark ? "switch to light" : "switch to dark"} position={position} >
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground outline-none"
        aria-label="Toggle Theme"
      >
        {isDark ? (
          <Sun size={20} className="animate-in fade-in zoom-in duration-300" />
        ) : (
          <MoonIcon
            size={20}
            className="animate-in fade-in zoom-in duration-300"
          />
        )}
      </button>
    </Tooltip>
  );
}
