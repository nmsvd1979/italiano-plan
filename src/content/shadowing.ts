// Un video principal y uno alternativo por unidad (2–10 min). Verificados con yt-dlp en oct. 2026: oEmbed responde 200,
// se pueden incrustar y tienen pista de subtítulos en italiano (automática). Métricas por candidato en docs/videos-candidatos.md.
// No se vio ni escuchó ninguno: si alguno no te sirve, cámbialo por otro de ese documento o pega tu propio link en la app.

export interface Video {
  id: string;
  title: string;
}

export const SHADOWING: Record<string, { main: Video; alt: Video }> = {
  u01: { main: { id: "zPTJsQT103M", title: "12 Italian Greetings" }, alt: { id: "ieyLUxtwch4", title: "Introduce Yourself in Italian" } },
  u02: { main: { id: "UX8g7HONFn4", title: "C'è e Ci sono" }, alt: { id: "LD4UoO1wyoM", title: "Piacere: How to Say I Like" } },
  u03: { main: { id: "6lwJWFddzKA", title: "How to Count to 100 in Italian" }, alt: { id: "rtfAWBKzTtM", title: "Che ore sono? Leggere l'orologio" } },
  u04: { main: { id: "xvvHMwfLSzo", title: "Having Breakfast in Slow Italian" }, alt: { id: "FTC4fRWez_w", title: "How to Order a Coffee in Italy" } },
  u05: { main: { id: "XC_FusOaYco", title: "How to Commute in Milan" }, alt: { id: "sHd_fOl8VRE", title: "Scusi, sa dov'è…? Indicazioni stradali" } },
  u06: { main: { id: "D6VWpIQ4wXY", title: "Italians' Favourite Colour" }, alt: { id: "eZ_r24D5Bik", title: "Questo, Quello: This and That" } },
  u07: { main: { id: "F4XWtchHCx8", title: "How to Talk About Daily Routine" }, alt: { id: "TMI25KZL-ZQ", title: "Daily Routine: Reflexive Verbs" } },
  u08: { main: { id: "40ao6UQlx1o", title: "Slow Italian: Morning Routine" }, alt: { id: "eG2-WMF0MfU", title: "How Much Do They Earn in Milan?" } },
  u09: { main: { id: "KBFpaheWwR8", title: "Che cosa hai fatto ieri?" }, alt: { id: "9A5gTgcgQ-I", title: "Passato prossimo (ItalianoVero)" } },
  u10: { main: { id: "cHy4TgFo7L0", title: "HO vs SONO nel passato prossimo" }, alt: { id: "iHJpHgl9KLc", title: "Essere o Avere (Passato Prossimo)" } },
  u11: { main: { id: "y5Js_0-qqcQ", title: "Passato Prossimo o Imperfetto?" }, alt: { id: "8qw264NgUI0", title: "L'imperfetto (ItalianoVero)" } },
  u12: { main: { id: "pMuI9y2eAiw", title: "More and Less: Comparing Things" }, alt: { id: "czxSZUuqZt8", title: "More or Less? Comparisons in Italian" } },
  u13: { main: { id: "WZKbIksQnOU", title: "Pronomi diretti + passato prossimo" }, alt: { id: "W9ecfj5N0Vo", title: "Al mercato!" } },
  u14: { main: { id: "NQzaJDidH4Y", title: "La particella CI" }, alt: { id: "njo-GXoBx2U", title: "Come e quando usare NE" } },
  u15: { main: { id: "_XysazYZdDk", title: "Il futuro semplice" }, alt: { id: "U33uGhs2llA", title: "Il condizionale in italiano" } },
  u16: { main: { id: "ReQZ-yHoccQ", title: "Doctor and Patient Dialogue" }, alt: { id: "7nA0VIsTbQI", title: "Pharmacy and Doctor Visits" } },
  u17: { main: { id: "hjeGhJtvoOw", title: "How to Rent an Apartment in Italy" }, alt: { id: "OkDyPPoqxSM", title: "Renting a House in Italian" } },
  u18: { main: { id: "laLjbGQouig", title: "Telefonare in Italia" }, alt: { id: "Kt_4ryHKPqE", title: "Speak Italian on the Phone" } },
  u19: { main: { id: "1R4R8J71OWU", title: "Il si impersonale" }, alt: { id: "2xiqfLKL4Gw", title: "Quiz: si impersonale" } },
  u20: { main: { id: "Fa2OFE0l1So", title: "A causa di, per colpa di, grazie a" }, alt: { id: "XzaIcWBNiQQ", title: "Il discorso indiretto" } },
  u21: { main: { id: "---YbOG3n0E", title: "Come usare glielo, gliela…" }, alt: { id: "TvlqchFsgug", title: "Pronomi combinati" } },
  u22: { main: { id: "Zn31M2EMGbU", title: "Penso che… (congiuntivo)" }, alt: { id: "dpfYvT2qf3c", title: "Quando usare il congiuntivo presente" } },
  u23: { main: { id: "5LA0NEMt6OM", title: "Use the Italian 'Se'" }, alt: { id: "WGK1O7611e4", title: "Il periodo ipotetico" } },
  u24: { main: { id: "joM3YcvIVGA", title: "A Trip to Lake Como (short story)" }, alt: { id: "DGebFoumhAI", title: "Short Stories: Travel & Directions" } },
};

/**
 * Búsqueda guiada para las unidades sin video verificado: la app la muestra y tú pegas el link del video que elijas.
 * Hoy todas las unidades tienen video; si alguna vez agregas una unidad sin video, ponla aquí.
 */
export const SHADOWING_SEARCH: Record<string, string> = {};

/** Pasos del protocolo sobre un fragmento de 30-60 s (Kadota; Hamada). */
export const STEPS = [
  { title: "Escucha sin subtítulos", text: "¿De qué habla? Solo entiende la idea general.", rate: 1, cover: true },
  { title: "Escucha leyendo", text: "Ahora con los subtítulos: une lo que oyes con lo que lees.", rate: 1, cover: false },
  { title: "Repite en voz baja", text: "A 0,75×, siguiendo el texto. Imita el ritmo.", rate: 0.75, cover: false },
  { title: "Shadowing con subtítulos", text: "A velocidad normal, repitiendo en voz alta casi a la vez.", rate: 1, cover: false },
  { title: "Shadowing sin subtítulos", text: "Lo mismo, pero con los subtítulos tapados.", rate: 1, cover: true },
] as const;
