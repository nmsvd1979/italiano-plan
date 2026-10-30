// Los textos graduados y la práctica sin pista pesan ~170 KB: se importan al abrir la pantalla que los usa,
// para que el precache de la app siga bajo 2 MB (scripts/check-precache.mjs).
export const loadLectura = () => import("./lectura");
export const loadSinPistaContent = () => import("./sinpista");
