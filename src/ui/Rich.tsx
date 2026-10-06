import { parseRich } from "./richText";

export function Rich({ text }: { text: string }) {
  return (
    <>
      {parseRich(text).map((seg, i) =>
        seg.bold ? <strong key={i}>{seg.text}</strong> : seg.italic ? <em key={i}>{seg.text}</em> : <span key={i}>{seg.text}</span>,
      )}
    </>
  );
}
