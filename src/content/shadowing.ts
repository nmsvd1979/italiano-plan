// Un video principal y uno alternativo por semana, todos de Easy Italian / Super Easy Italian
// (hablantes nativos, con subtítulos en italiano e inglés dentro del video). Verificados con oEmbed:
// existen y se pueden embeber. Las semanas 1-9 son sobre todo de "Super Easy Italian" (ritmo lento);
// de la 10 a la 12 predomina la serie principal (entrevistas, velocidad natural).

export interface Video {
  id: string;
  title: string;
}

export const SHADOWING: Record<number, { main: Video; alt: Video }> = {
  1: { main: { id: "ieyLUxtwch4", title: "Introduce Yourself in Italian" }, alt: { id: "zPTJsQT103M", title: "12 Italian Greetings" } },
  2: { main: { id: "UX8g7HONFn4", title: "C'è e Ci sono" }, alt: { id: "k8DX4yEeOMg", title: "A Walk Around Our Neighborhood" } },
  3: { main: { id: "xvvHMwfLSzo", title: "Having Breakfast in Slow Italian" }, alt: { id: "U944xGzLlJw", title: "Order Aperitivo Like an Italian" } },
  4: { main: { id: "XC_FusOaYco", title: "How to Commute in Milan" }, alt: { id: "LD4UoO1wyoM", title: "Italian 'Piacere'" } },
  5: { main: { id: "6NhdY1yIrKo", title: "A Day in the Life of Matteo" }, alt: { id: "1YMnHT8_TE4", title: "Essere and Stare" } },
  6: { main: { id: "DtkPriOj59U", title: "An Everyday Conversation in Slow Italian" }, alt: { id: "-25XLf5S1f4", title: "Our Lunch Break in Slow Italian" } },
  7: { main: { id: "_LaculyEdxA", title: "11 Minute Conversation: Vacations" }, alt: { id: "WqzvcY9XaWU", title: "Visit Como with Us" } },
  8: { main: { id: "y5Js_0-qqcQ", title: "Passato Prossimo o Imperfetto?" }, alt: { id: "qedInJ9wdYs", title: "16 Minute Conversation in Slow Italian" } },
  9: { main: { id: "W9ecfj5N0Vo", title: "Al mercato!" }, alt: { id: "cexDwGTXlnA", title: "What's in Your Suitcase?" } },
  10: { main: { id: "Q28_M_fBUT0", title: "How to Order Breakfast in Italy" }, alt: { id: "D4HLpU75LUg", title: "Tour This Beautiful Town" } },
  11: { main: { id: "hfYubttHxfM", title: "What Italians Say You Must See" }, alt: { id: "PcRKQ9fv2l4", title: "Talk About the Future" } },
  12: { main: { id: "TVNv0BJjCUA", title: "Best Places in Italy" }, alt: { id: "PwhwnFNGTDg", title: "How Italians Ask What You Do" } },
};

/** Pasos del protocolo sobre un fragmento de 30-60 s (Kadota; Hamada). */
export const STEPS = [
  { title: "Escucha sin subtítulos", text: "¿De qué habla? Solo entiende la idea general.", rate: 1, cover: true },
  { title: "Escucha leyendo", text: "Ahora con los subtítulos: une lo que oyes con lo que lees.", rate: 1, cover: false },
  { title: "Repite en voz baja", text: "A 0,75×, siguiendo el texto. Imita el ritmo.", rate: 0.75, cover: false },
  { title: "Shadowing con subtítulos", text: "A velocidad normal, repitiendo en voz alta casi a la vez.", rate: 1, cover: false },
  { title: "Shadowing sin subtítulos", text: "Lo mismo, pero con los subtítulos tapados.", rate: 1, cover: true },
] as const;
