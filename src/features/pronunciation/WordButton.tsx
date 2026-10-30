import { GLOSS, audioFiles } from "../../content/pronunciation";
import { Icon } from "../../ui/Icon";
import { playFile } from "../../ui/audio";
import { speak } from "../../ui/speech";

/** `nativeOnly`: en los pares mínimos no se usa la voz sintética; sin grabación nativa solo se muestra la palabra. */
export function WordButton({ word, nativeOnly = false }: { word: string; nativeOnly?: boolean }) {
  const files = audioFiles(word);
  if (nativeOnly && files.length === 0) {
    return <span className="word-btn" aria-label={`${word} (sin grabación nativa)`}>{word}{GLOSS[word] && <span className="word-gloss">{GLOSS[word]}</span>}</span>;
  }
  return (
    <button type="button" className="word-btn" onClick={() => (files.length > 0 ? playFile(files[Math.floor(Math.random() * files.length)]) : speak(word, 0.8))}>
      <Icon name="sound" size={18} /> {word}
      {GLOSS[word] && <span className="word-gloss">{GLOSS[word]}</span>}
    </button>
  );
}
