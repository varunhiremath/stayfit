// Forgiving search over the exercise/stretch catalogue.
//
// A bare `name.includes(query)` is unusably strict on a phone: a stray space,
// a hyphen, the words in the other order, or one fat-fingered letter all return
// nothing. This normalises both sides, matches every word independently, and
// tolerates a single typo per word.

// Lowercase, strip accents, turn anything that isn't a letter or digit into a
// space, then collapse. "Farmer's Walk" and "Push-Up" become "farmer s walk"
// and "push up", so punctuation stops mattering either way round.
export function normalize(s) {
  return String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function tokenize(s) {
  const n = normalize(s);
  return n ? n.split(' ') : [];
}

// True when `a` and `b` are within one insert/delete/substitution. Bounded, so
// it bails as soon as a second difference shows up.
export function withinOneEdit(a, b) {
  if (a === b) return true;
  const [short, long] = a.length <= b.length ? [a, b] : [b, a];
  if (long.length - short.length > 1) return false;

  let i = 0;
  let j = 0;
  let slack = 1;
  while (i < short.length && j < long.length) {
    if (short[i] === long[j]) { i += 1; j += 1; continue; }
    if (slack === 0) return false;
    slack -= 1;
    if (short.length === long.length) { i += 1; j += 1; } // substitution
    else j += 1;                                          // deletion from `long`
  }
  return true;
}

// A token matches a haystack word if it is a prefix of it, or (for tokens long
// enough that a typo is likelier than a genuinely different word) within one
// edit of it. Short tokens stay strict — otherwise "abs" would match "arms".
function tokenMatches(token, words) {
  for (const w of words) {
    if (w.startsWith(token)) return true;
    if (token.length >= 4 && withinOneEdit(token, w)) return true;
  }
  return false;
}

// Lower is better; null means no match at all.
export function scoreExercise(exercise, query) {
  const tokens = tokenize(query);
  if (!tokens.length) return 0;

  const name = normalize(exercise?.name);
  const nameWords = name ? name.split(' ') : [];
  const extra = normalize(`${exercise?.muscleGroup ?? ''} ${exercise?.equipment ?? ''} ${exercise?.bodyArea ?? ''} ${exercise?.type ?? ''}`);
  const extraWords = extra ? extra.split(' ') : [];
  const joined = tokens.join(' ');

  // Whole-query hits on the name rank above word-by-word ones. The squashed
  // comparison is what lets "pushup" find "Push-Up" — spaces are noise here.
  const squashedName = name.replace(/ /g, '');
  const squashedQuery = joined.replace(/ /g, '');
  if (name.startsWith(joined) || squashedName.startsWith(squashedQuery)) return 0;
  if (name.includes(joined) || squashedName.includes(squashedQuery)) return 1;

  const inName = tokens.every((t) => tokenMatches(t, nameWords));
  if (inName) return tokens.every((t) => nameWords.some((w) => w.startsWith(t))) ? 2 : 4;

  // Fall back to the tags — "cable chest" or "machine abductors" should work.
  const allWords = [...nameWords, ...extraWords];
  if (tokens.every((t) => tokenMatches(t, allWords))) return 5;

  return null;
}

// Filter + rank. Ties fall back to alphabetical, so results stay stable.
export function searchExercises(list = [], query = '') {
  if (!normalize(query)) return list;
  return list
    .map((e) => ({ e, score: scoreExercise(e, query) }))
    .filter((r) => r.score != null)
    .sort((a, b) => a.score - b.score || String(a.e.name).localeCompare(String(b.e.name)))
    .map((r) => r.e);
}
