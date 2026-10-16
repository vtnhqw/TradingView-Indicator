import { useEffect, useState } from "react";
export function useTheme() {
  const [preference, setPreference] = useState(() => {
    try {
      const saved = localStorage.getItem("signal-theme");
      return ["light", "dark"].includes(saved) ? saved : null;
    } catch {
      return null;
    }
  });
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
  const theme = preference || (systemDark ? "dark" : "light");
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event) => setSystemDark(event.matches);
    media.addEventListener("change", onChange);
    const onStorage = (event) => {
      if (event.key === "signal-theme")
        setPreference(
          ["light", "dark"].includes(event.newValue) ? event.newValue : null,
        );
    };
    window.addEventListener("storage", onStorage);
    return () => {
      media.removeEventListener("change", onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === "dark" ? "#171717" : "#ffffff";
  }, [theme]);
  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setPreference(next);
    try {
      localStorage.setItem("signal-theme", next);
    } catch {
      /* Current session remains usable. */
    }
  }
  return { theme, toggleTheme };
}
