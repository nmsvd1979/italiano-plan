import { GLOSS, audioFiles } from "../../content/pronunciation";
import { Icon } from "../../ui/Icon";
import { playFile } from "../../ui/audio";

export function WordButton({ word }: { word: string }) {
  const files = audioFiles(word);
  return (
    <button type="button" className="word-btn" disabled={files.length === 0} onClick={() => playFile(files[Math.floor(Math.random() * files.length)])}>
      <Icon name="sound" size={18} /> {word}
      {GLOSS[word] && <span className="word-gloss">{GLOSS[word]}</span>}
    </button>
  );
}
