import { GLOSS, audioFiles } from "../../content/pronunciation";
import { Icon } from "../../ui/Icon";
import { playFile } from "../../ui/audio";
import { speak } from "../../ui/speech";

export function WordButton({ word }: { word: string }) {
  const files = audioFiles(word);
  return (
    <button type="button" className="word-btn" onClick={() => (files.length > 0 ? playFile(files[Math.floor(Math.random() * files.length)]) : speak(word, 0.8))}>
      <Icon name="sound" size={18} /> {word}
      {GLOSS[word] && <span className="word-gloss">{GLOSS[word]}</span>}
    </button>
  );
}
