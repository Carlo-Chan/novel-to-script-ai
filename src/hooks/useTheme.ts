import { useState, useEffect } from "react";

const getTheme = (): "light" | "dark" => {
  try {
    return (localStorage.getItem("theme") as "light" | "dark") || "light";
  } catch {
    return "light";
  }
};

const saveTheme = (t: "light" | "dark") => {
  document.documentElement.classList.toggle("dark", t === "dark");
  try { localStorage.setItem("theme", t); } catch { /* */ }
};

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(getTheme);

  useEffect(() => { saveTheme(theme); }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return { theme, toggleTheme };
}
