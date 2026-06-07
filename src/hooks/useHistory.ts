import { useState, useCallback } from "react";

export type HistoryEntry = { version: number; text: string };

export function useHistory() {
  const [versionCounter, setVersionCounter] = useState(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const pushHistory = useCallback((text: string) => {
    setVersionCounter((c) => c + 1);
    setHistory((h) => [
      {
        version: h.length > 0 ? Math.max(...h.map((e) => e.version)) + 1 : 1,
        text,
      },
      ...h.slice(0, 19),
    ]);
  }, []);

  const handleDeleteHistory = useCallback((version: number) => {
    setHistory((h) => {
      const filtered = h.filter((e) => e.version !== version);
      if (version === Math.max(...h.map((e) => e.version))) {
        setVersionCounter((c) => c - 1);
      }
      return filtered;
    });
  }, []);

  return { history, pushHistory, handleDeleteHistory, showHistory, setShowHistory };
}
