import { useEffect, useState } from "react";

export type TimeOfDay = "morning" | "day" | "evening" | "night";

/**
 * useTimeOfDay
 *
 * Gibt die aktuelle Tageszeit zurück und setzt CSS Custom Properties
 * auf :root für die Tageszeit-Stimmung der App.
 *
 * Zeiträume (Regelwerk):
 *   Morgens  (6–10):  Warme Sonnenstrahlen – Gold-Hauch
 *   Tagsüber (10–17): Klares, helles Licht – Standard
 *   Abends   (17–21): Goldene Stimmung – Gold-Akzente stärker
 *   Nachts   (21–6):  Dunkles Grün mit Lichtpunkten
 */
function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 6 && hour < 10)  return "morning";
  if (hour >= 10 && hour < 17) return "day";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

const TOD_CLASSES: Record<TimeOfDay, string> = {
  morning: "tod-morning",
  day:     "tod-day",
  evening: "tod-evening",
  night:   "tod-night",
};

export function useTimeOfDay(): TimeOfDay {
  const [tod, setTod] = useState<TimeOfDay>(() =>
    getTimeOfDay(new Date().getHours())
  );

  useEffect(() => {
    // Tageszeit-Klasse auf body setzen
    const applyTod = (t: TimeOfDay) => {
      const body = document.body;
      // Alle alten TOD-Klassen entfernen
      Object.values(TOD_CLASSES).forEach((cls) => body.classList.remove(cls));
      // Neue setzen
      body.classList.add(TOD_CLASSES[t]);
      setTod(t);
    };

    applyTod(getTimeOfDay(new Date().getHours()));

    // Jede Minute prüfen ob sich die Tageszeit geändert hat
    const interval = setInterval(() => {
      const current = getTimeOfDay(new Date().getHours());
      setTod((prev) => {
        if (prev !== current) {
          applyTod(current);
          return current;
        }
        return prev;
      });
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  return tod;
}
