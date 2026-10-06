const ID = /^[A-Za-z0-9_-]{11}$/;

/** Extrae el id de un link de YouTube (watch, youtu.be, embed, shorts) o de un id suelto. */
export function parseYouTubeId(input: string): string | null {
  const text = input.trim();
  if (ID.test(text)) return text;
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www|m)\./, "");
  let id: string | null = null;
  if (host === "youtu.be") id = url.pathname.split("/")[1] ?? null;
  else if (host === "youtube.com" || host === "music.youtube.com") {
    if (url.pathname === "/watch") id = url.searchParams.get("v");
    else {
      const m = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/);
      id = m ? m[1] : null;
    }
  }
  return id && ID.test(id) ? id : null;
}

export interface Segment {
  a: number;
  b: number;
}

export function isValidSegment(a: number | null, b: number | null): a is number {
  return a !== null && b !== null && b - a >= 1;
}
