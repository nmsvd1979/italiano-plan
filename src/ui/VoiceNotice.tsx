import { useEffect, useState } from "react";
import { Icon } from "./Icon";
import { useItalianVoice } from "./speech";

export const INSTALL_VOICE_HELP = "En iPhone: Ajustes → Accesibilidad → Contenido leído → Voces → Italiano.";

/** Aviso cuando el dispositivo no tiene voz italiana (o no entrega ninguna voz). */
export function VoiceNotice({ needed }: { needed?: string }) {
  const voice = useItalianVoice();
  const [waited, setWaited] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setWaited(true), 3000);
    return () => clearTimeout(t);
  }, []);
  if (voice === "yes" || (voice === "unknown" && !waited)) return null;
  return (
    <p className="note" role="status">
      <Icon name="info" size={16} />
      <span>
        {voice === "no"
          ? "Este dispositivo no tiene una voz italiana."
          : "El navegador no entregó ninguna voz del sistema."}{" "}
        {INSTALL_VOICE_HELP} {needed ?? "Sin voz italiana, los parlantes de los ejemplos no suenan."}{" "}
        Las palabras con grabación nativa sí suenan, pero necesitan internet la primera vez (o el audio descargado en Ajustes).
      </span>
    </p>
  );
}
