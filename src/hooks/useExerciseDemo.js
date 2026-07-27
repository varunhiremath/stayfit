import { useEffect, useState } from 'react';

// Looks up a demonstration image for an exercise from the wger open database.
// Offline-first by nature: if the lookup fails (no network, no match) it simply
// returns null and callers fall back to the how-to video link. Results are
// runtime-cached by the service worker, so an exercise you've already seen keeps
// its picture at the gym with no signal.
const cache = new Map();

const abs = (u) => (u && u.startsWith('/') ? `https://wger.de${u}` : u);

export function useExerciseDemo(name) {
  const [url, setUrl] = useState(() => cache.get(name) ?? null);

  useEffect(() => {
    if (!name) return undefined;
    if (cache.has(name)) {
      setUrl(cache.get(name));
      return undefined;
    }

    const ctrl = new AbortController();
    let live = true;

    (async () => {
      try {
        const term = name.replace(/[^a-zA-Z0-9 ]/g, '').trim();
        const res = await fetch(
          `https://wger.de/api/v2/exercise/search/?term=${encodeURIComponent(term)}&language=english&format=json`,
          { signal: ctrl.signal }
        );
        const data = await res.json();
        const top = data.suggestions?.[0]?.data;
        let found = null;

        if (top?.image) {
          found = abs(top.image);
        } else if (top?.base_id) {
          const r2 = await fetch(
            `https://wger.de/api/v2/exerciseimage/?exercise_base=${top.base_id}&format=json`,
            { signal: ctrl.signal }
          );
          const d2 = await r2.json();
          const main = d2.results?.find((x) => x.is_main) ?? d2.results?.[0];
          if (main?.image) found = abs(main.image);
        }

        cache.set(name, found);
        if (live) setUrl(found);
      } catch {
        /* offline or not found — the video link still works */
      }
    })();

    return () => { live = false; ctrl.abort(); };
  }, [name]);

  return url;
}

// The YouTube search a "watch how-to" button should open.
export function howToVideoUrl(name) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${name} proper form tutorial`)}`;
}
