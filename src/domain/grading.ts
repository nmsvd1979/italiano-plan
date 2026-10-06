export type Grade = "correct" | "almost" | "wrong";

/** Minúsculas, apóstrofos rectos y espacios colapsados. NO quita tildes: en italiano importan (è ≠ e). */
export function normalize(s: string): string {
  return s
    .normalize("NFC")
    .toLowerCase()
    .replace(/[’‘´`]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/**
 * "correct": coincide con una respuesta válida (sin importar mayúsculas ni espacios).
 * "almost": solo falta o sobra una tilde.
 */
export function gradeFill(input: string, answers: string[]): Grade {
  const given = normalize(input);
  if (!given) return "wrong";
  const valid = answers.map(normalize);
  if (valid.includes(given)) return "correct";
  const bare = stripAccents(given);
  if (valid.some((v) => stripAccents(v) === bare)) return "almost";
  return "wrong";
}

export function gradeChoice(selected: number, answer: number): Grade {
  return selected === answer ? "correct" : "wrong";
}
