import { AppProvider, useApp } from "./app/state";
import { useRoute } from "./app/route";
import { useReminder } from "./app/useReminder";
import { DialogueScreen } from "./features/dialogue/DialogueScreen";
import { DictationScreen } from "./features/dictation/DictationScreen";
import { LessonScreen } from "./features/grammar/LessonScreen";
import { PracticeScreen } from "./features/grammar/PracticeScreen";
import { PlanScreen } from "./features/plan/PlanScreen";
import { UnitScreen } from "./features/plan/UnitScreen";
import { PronunciationScreen } from "./features/pronunciation/PronunciationScreen";
import { ShadowingScreen } from "./features/shadowing/ShadowingScreen";
import { PhaseTestScreen } from "./features/checkpoint/PhaseTestScreen";
import { Progress } from "./features/progress/Progress";
import { Settings } from "./features/settings/Settings";
import { Setup } from "./features/setup/Setup";
import { Today } from "./features/today/Today";
import { VocabScreen } from "./features/vocab/VocabScreen";
import { WritingScreen } from "./features/writing/WritingScreen";

const UNIT = "(u\\d{2})";

function Screens() {
  const { startDate } = useApp();
  const route = useRoute();
  useReminder();

  if (!startDate) return <Setup />;
  if (route === "/progreso") return <Progress />;
  if (route === "/ajustes") return <Settings />;
  if (route === "/plan") return <PlanScreen />;
  const unit = route.match(new RegExp(`^/unidad/${UNIT}$`));
  if (unit) return <UnitScreen key={unit[1]} id={unit[1]} />;
  const lesson = route.match(new RegExp(`^/gramatica/${UNIT}$`));
  if (lesson) return <LessonScreen key={`lesson-${lesson[1]}`} unit={lesson[1]} />;
  const practice = route.match(new RegExp(`^/practica/${UNIT}$`));
  if (practice) return <PracticeScreen key={`practice-${practice[1]}`} mode="practice" unit={practice[1]} />;
  const pron = route.match(new RegExp(`^/pronunciacion/${UNIT}$`));
  if (pron) return <PronunciationScreen key={`pron-${pron[1]}`} unit={pron[1]} />;
  const shadow = route.match(new RegExp(`^/shadowing/${UNIT}$`));
  if (shadow) return <ShadowingScreen key={`shadow-${shadow[1]}`} unit={shadow[1]} />;
  const vocab = route.match(new RegExp(`^/vocabulario/${UNIT}$`));
  if (vocab) return <VocabScreen key={`vocab-${vocab[1]}`} unit={vocab[1]} />;
  const writing = route.match(new RegExp(`^/escritura/${UNIT}$`));
  if (writing) return <WritingScreen key={`writing-${writing[1]}`} unit={writing[1]} />;
  const dictation = route.match(new RegExp(`^/dictado/${UNIT}$`));
  if (dictation) return <DictationScreen key={`dictation-${dictation[1]}`} unit={dictation[1]} />;
  const dialogue = route.match(new RegExp(`^/dialogo/${UNIT}$`));
  if (dialogue) return <DialogueScreen key={`dialogue-${dialogue[1]}`} unit={dialogue[1]} />;
  const test = route.match(/^\/test\/([1-6])$/);
  if (test) return <PhaseTestScreen key={`test-${test[1]}`} phase={Number(test[1])} />;
  if (route === "/repaso") return <PracticeScreen key="review" mode="review" />;
  if (route === "/repaso-pendiente") return <PracticeScreen key="due" mode="due" />;
  return <Today />;
}

export function App() {
  return (
    <AppProvider>
      <main className="app">
        <Screens />
      </main>
    </AppProvider>
  );
}
