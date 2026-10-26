// Un video principal y uno alternativo por unidad, todos de Easy Italian / Super Easy Italian
// (hablantes nativos, con subtítulos en italiano e inglés dentro del video). Verificados con oEmbed:
// existen y se pueden embeber. Las primeras unidades son sobre todo de "Super Easy Italian" (ritmo lento);
// las últimas tienen más la serie principal (entrevistas, velocidad natural).

export interface Video {
  id: string;
  title: string;
}

export const SHADOWING: Record<string, { main: Video; alt: Video }> = {
  u01: { main: { id: "ieyLUxtwch4", title: "Introduce Yourself in Italian" }, alt: { id: "zPTJsQT103M", title: "12 Italian Greetings" } },
  u02: { main: { id: "UX8g7HONFn4", title: "C'è e Ci sono" }, alt: { id: "k8DX4yEeOMg", title: "A Walk Around Our Neighborhood" } },
  u03: { main: { id: "6lwJWFddzKA", title: "How to Count to 100 in Italian" }, alt: { id: "9QPSPm4k_gQ", title: "Telling Time in Italian" } },
  u04: { main: { id: "xvvHMwfLSzo", title: "Having Breakfast in Slow Italian" }, alt: { id: "U944xGzLlJw", title: "Order Aperitivo Like an Italian" } },
  u05: { main: { id: "XC_FusOaYco", title: "How to Commute in Milan" }, alt: { id: "G6wlTPQEvlk", title: "23 Italian Places Names" } },
  u06: { main: { id: "Wc8S8uDBPG8", title: "Clothes and Accessories" }, alt: { id: "eZ_r24D5Bik", title: "Questo, Quello: This and That" } },
  u07: { main: { id: "6NhdY1yIrKo", title: "A Day in the Life of Matteo" }, alt: { id: "1YMnHT8_TE4", title: "Essere and Stare" } },
  u08: { main: { id: "F4XWtchHCx8", title: "How to Talk About Daily Routine" }, alt: { id: "pKeiV3Ipddw", title: "Are Italians Always Late?" } },
  u09: { main: { id: "DtkPriOj59U", title: "An Everyday Conversation in Slow Italian" }, alt: { id: "-25XLf5S1f4", title: "Our Lunch Break in Slow Italian" } },
  u10: { main: { id: "_LaculyEdxA", title: "11 Minute Conversation: Vacations" }, alt: { id: "WqzvcY9XaWU", title: "Visit Como with Us" } },
  u11: { main: { id: "y5Js_0-qqcQ", title: "Passato Prossimo o Imperfetto?" }, alt: { id: "qedInJ9wdYs", title: "16 Minute Conversation in Slow Italian" } },
  u12: { main: { id: "pMuI9y2eAiw", title: "More and Less: Comparing Things" }, alt: { id: "66NqQLxX7xo", title: "What Can You Buy with 5€ in Milan?" } },
  u13: { main: { id: "W9ecfj5N0Vo", title: "Al mercato!" }, alt: { id: "cexDwGTXlnA", title: "What's in Your Suitcase?" } },
  u14: { main: { id: "Q28_M_fBUT0", title: "How to Order Breakfast in Italy" }, alt: { id: "D4HLpU75LUg", title: "Tour This Beautiful Town" } },
  u15: { main: { id: "hfYubttHxfM", title: "What Italians Say You Must See" }, alt: { id: "PcRKQ9fv2l4", title: "Talk About the Future" } },
  u20: { main: { id: "TVNv0BJjCUA", title: "Best Places in Italy" }, alt: { id: "PwhwnFNGTDg", title: "How Italians Ask What You Do" } },
};

/**
 * Unidades sin video verificado todavía: la app muestra una búsqueda guiada en YouTube y tú pegas el link
 * del video que elijas. Cuando verifiques un video (oEmbed), agrégalo a SHADOWING y quita la unidad de aquí.
 */
export const SHADOWING_SEARCH: Record<string, string> = {
  u16: "Easy Italian dal medico farmacia",
  u17: "Easy Italian cercare casa affitto appartamento",
  u18: "Easy Italian telefonare conversazione al telefono",
  u19: "Easy Italian da quanto tempo studi italiano",
  u21: "Easy Italian pronomi combinati glielo",
  u22: "Easy Italian congiuntivo penso che",
  u23: "Easy Italian periodo ipotetico se fossi",
  u24: "Super Easy Italian conversazione viaggio",
};

/** Pasos del protocolo sobre un fragmento de 30-60 s (Kadota; Hamada). */
export const STEPS = [
  { title: "Escucha sin subtítulos", text: "¿De qué habla? Solo entiende la idea general.", rate: 1, cover: true },
  { title: "Escucha leyendo", text: "Ahora con los subtítulos: une lo que oyes con lo que lees.", rate: 1, cover: false },
  { title: "Repite en voz baja", text: "A 0,75×, siguiendo el texto. Imita el ritmo.", rate: 0.75, cover: false },
  { title: "Shadowing con subtítulos", text: "A velocidad normal, repitiendo en voz alta casi a la vez.", rate: 1, cover: false },
  { title: "Shadowing sin subtítulos", text: "Lo mismo, pero con los subtítulos tapados.", rate: 1, cover: true },
] as const;
