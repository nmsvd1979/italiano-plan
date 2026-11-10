import { useEffect, useState, useSyncExternalStore } from "react";
import { subscribeSystemVoice, systemVoiceCount } from "./speech";

/** Aviso discreto «voz del sistema» unos segundos cada vez que suena la voz del sistema en vez de un clip o una grabación. */
export function SystemVoiceHint({ raised = false }: { raised?: boolean }) {
  const count = useSyncExternalStore(subscribeSystemVoice, systemVoiceCount);
  const [shownFor, setShownFor] = useState(0);
  useEffect(() => {
    if (count === 0) return;
    setShownFor(count);
    const t = setTimeout(() => setShownFor(0), 2500);
    return () => clearTimeout(t);
  }, [count]);
  if (shownFor === 0) return null;
  return <p className={`system-voice-hint${raised ? " raised" : ""}`} role="status">voz del sistema</p>;
}
