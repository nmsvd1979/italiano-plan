import { AppProvider, useApp } from "./app/state";
import { routeQuery, useRoute } from "./app/route";
import type { CoursePart } from "./content/course";
import { MiniTestScreen } from "./features/miniprueba/MiniTestScreen";
import { useReminder } from "./app/useReminder";
import { DialogueScreen } from "./features/dialogue/DialogueScreen";
import { DictationScreen } from "./features/dictation/DictationScreen";
import { LessonScreen } from "./features/grammar/LessonScreen";
import { PracticeScreen } from "./features/grammar/PracticeScreen";
import { LecturaScreen } from "./features/lectura/LecturaScreen";
import { SinPistaScreen } from "./features/sinpista/SinPistaScreen";
import { PlanScreen } from "./features/plan/PlanScreen";
import { UnitScreen } from "./features/plan/UnitScreen";
import { RolePlayScreen } from "./features/dialogue/RolePlayScreen";
import { PronCompareScreen } from "./features/pronunciation/PronCompareScreen";
import { PronunciationScreen } from "./features/pronunciation/PronunciationScreen";
import { OwnShadowingScreen } from "./features/shadowing/OwnShadowingScreen";
import { ShadowingScreen } from "./features/shadowing/ShadowingScreen";
import { LevelTestScreen } from "./features/checkpoint/LevelTestScreen";
import { PhaseTestScreen } from "./features/checkpoint/PhaseTestScreen";
import { DiagnosticScreen } from "./features/partida/DiagnosticScreen";
import { DirectedReview } from "./features/partida/DirectedReview";
import { StartingPoint } from "./features/partida/StartingPoint";
import { Progress } from "./features/progress/Progress";
import { Settings } from "./features/settings/Settings";
import { ReviewScreen } from "./features/srs/ReviewScreen";
import { Setup } from "./features/setup/Setup";
import { Today } from "./features/today/Today";
import { VocabScreen } from "./features/vocab/VocabScreen";
import { WritingScreen } from "./features/writing/WritingScreen";
import { GapDialogueScreen } from "./features/dialogue/GapDialogueScreen";
import { PracticeAreasScreen } from "./features/practice/PracticeAreasScreen";
import { SpeedScreen } from "./features/dictation/SpeedScreen";
import { PropiasScreen } from "./features/writing/PropiasScreen";
import { MonologueScreen } from "./features/speaking/MonologueScreen";
import { RereadScreen } from "./features/lectura/RereadScreen";
import { B1EscuchaScreen, B1LecturaScreen, PracticaB1Screen } from "./features/practicab1/PracticaB1Screen";
import { ReadyB1Screen } from "./features/progress/ReadyB1";
import { SystemVoiceHint } from "./ui/SystemVoiceHint";
import { TabBar, hasTabBar } from "./ui/TabBar";

const UNIT = "(u\\d{2})";

function Screens() {
  const { startDate } = useApp();
  const route = useRoute();
  useReminder();

  if (!startDate) return <Setup />;
  const q = routeQuery();
  const part: CoursePart | null = q.get("part") === "A" ? "A" : q.get("part") === "B" ? "B" : null;
  const size = Number(q.get("n")) > 0 ? Number(q.get("n")) : undefined;
  const partKey = part ?? "";
  if (route === "/progreso") return <Progress />;
  if (route === "/ajustes") return <Settings />;
  if (route === "/plan") return <PlanScreen />;
  if (route === "/punto-de-partida") return <StartingPoint />;
  if (route === "/punto-de-partida/diagnostico") return <DiagnosticScreen key={`diagnostico-${q.get("s")}`} />;
  const directed = route.match(new RegExp(`^/punto-de-partida/repaso/${UNIT}$`));
  if (directed) return <DirectedReview key={`repaso-${directed[1]}`} unit={directed[1]} />;
  const unit = route.match(new RegExp(`^/unidad/${UNIT}$`));
  if (unit) return <UnitScreen key={unit[1]} id={unit[1]} />;
  const lesson = route.match(new RegExp(`^/gramatica/${UNIT}$`));
  if (lesson) return <LessonScreen key={`lesson-${lesson[1]}${partKey}`} unit={lesson[1]} part={part} />;
  const practice = route.match(new RegExp(`^/practica/${UNIT}$`));
  if (practice) return <PracticeScreen key={`practice-${practice[1]}${partKey}${size ?? ""}`} mode="practice" unit={practice[1]} part={part} size={size} />;
  const varied = route.match(new RegExp(`^/variada/${UNIT}$`));
  if (varied) return <SinPistaScreen key={`variada-${varied[1]}${partKey}${size ?? ""}`} unit={varied[1]} part={part} size={size} />;
  const lectura = route.match(new RegExp(`^/lectura/${UNIT}$`));
  if (lectura) {
    const mode = q.get("mode") === "preguntas" ? "preguntas" : "texto";
    return <LecturaScreen key={`lectura-${lectura[1]}${partKey}${mode}`} unit={lectura[1]} part={part} mode={mode} />;
  }
  const pron = route.match(new RegExp(`^/pronunciacion/${UNIT}$`));
  if (pron) {
    return q.get("mode") === "comparar"
      ? <PronCompareScreen key={`pron-cmp-${pron[1]}${partKey}`} unit={pron[1]} part={part} />
      : <PronunciationScreen key={`pron-${pron[1]}${partKey}`} unit={pron[1]} part={part} />;
  }
  const own = route.match(new RegExp(`^/shadowing-propio/${UNIT}$`));
  if (own) return <OwnShadowingScreen key={`shadow-own-${own[1]}${partKey}`} unit={own[1]} part={part} />;
  const shadow = route.match(new RegExp(`^/shadowing/${UNIT}$`));
  if (shadow) return <ShadowingScreen key={`shadow-${shadow[1]}`} unit={shadow[1]} />;
  const vocab = route.match(new RegExp(`^/vocabulario/${UNIT}$`));
  if (vocab) return <VocabScreen key={`vocab-${vocab[1]}${partKey}`} unit={vocab[1]} part={part} />;
  const writing = route.match(new RegExp(`^/escritura/${UNIT}$`));
  if (writing) return <WritingScreen key={`writing-${writing[1]}${partKey}${q.get("reescribir") ?? ""}`} unit={writing[1]} part={part} rewrite={q.get("reescribir") === "1"} />;
  const mono = route.match(new RegExp(`^/monologo/${UNIT}$`));
  if (mono) return <MonologueScreen key={`mono-${mono[1]}${partKey}`} unit={mono[1]} part={part} />;
  const speed = route.match(new RegExp(`^/numeros/${UNIT}$`));
  if (speed) return <SpeedScreen key={`numeros-${speed[1]}${partKey}`} unit={speed[1]} part={part} />;
  const own2 = route.match(new RegExp(`^/frases/${UNIT}$`));
  if (own2) return <PropiasScreen key={`frases-${own2[1]}${partKey}`} unit={own2[1]} part={part} />;
  const reread = route.match(new RegExp(`^/releer/${UNIT}$`));
  if (reread) return <RereadScreen key={`releer-${reread[1]}${partKey}`} unit={reread[1]} part={part} />;
  if (route === "/listo-b1") return <ReadyB1Screen key="listo-b1" />;
  if (route === "/practica-b1") return <PracticaB1Screen key="b1" />;
  const b1 = route.match(/^\/practica-b1\/(lectura|escucha)\/(b1-\d+)$/);
  if (b1) return b1[1] === "lectura" ? <B1LecturaScreen key={`b1l-${b1[2]}`} id={b1[2]} /> : <B1EscuchaScreen key={`b1e-${b1[2]}`} id={b1[2]} />;
  const dictation = route.match(new RegExp(`^/dictado/${UNIT}$`));
  if (dictation) return <DictationScreen key={`dictation-${dictation[1]}${partKey}`} unit={dictation[1]} part={part} />;
  const dialogue = route.match(new RegExp(`^/dialogo/${UNIT}$`));
  if (dialogue) {
    if (q.get("mode") === "huecos") return <GapDialogueScreen key={`huecos-${dialogue[1]}`} unit={dialogue[1]} />;
    return q.get("mode") === "rol"
      ? <RolePlayScreen key={`rol-${dialogue[1]}${partKey}`} unit={dialogue[1]} part={part} />
      : <DialogueScreen key={`dialogue-${dialogue[1]}`} unit={dialogue[1]} />;
  }
  const mini = route.match(new RegExp(`^/miniprueba/${UNIT}$`));
  if (mini) return <MiniTestScreen key={`mini-${mini[1]}${q.get("step")}${q.get("a")}`} unit={mini[1]} />;
  const test = route.match(/^\/test\/([1-6])$/);
  if (test) return <PhaseTestScreen key={`test-${test[1]}`} phase={Number(test[1])} />;
  if (route === "/prueba-nivel") return <LevelTestScreen key="level" />;
  if (route === "/tarjetas") return <ReviewScreen key="srs" />;
  if (route === "/repaso") return <PracticeScreen key="review" mode="review" />;
  if (route === "/practicar-area") return <PracticeAreasScreen key={`areas-${q.get("area") ?? ""}`} />;
  if (route === "/practicar") return <PracticeScreen key={`more-${q.get("t") ?? ""}`} mode="more" batch={q.get("t") ?? ""} />;
  if (route === "/repaso-pendiente") return <PracticeScreen key="due" mode="due" />;
  return <Today />;
}

function Shell() {
  const route = useRoute();
  const { startDate } = useApp();
  const tabs = !!startDate && hasTabBar(route);
  return (
    <>
      <main className={`app${tabs ? " has-tabs" : ""}`}>
        <Screens />
      </main>
      <TabBar />
      <SystemVoiceHint raised={tabs} />
    </>
  );
}

export function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
