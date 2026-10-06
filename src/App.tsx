import { AppProvider, useApp } from "./app/state";
import { useRoute } from "./app/route";
import { useReminder } from "./app/useReminder";
import { LessonScreen } from "./features/grammar/LessonScreen";
import { PracticeScreen } from "./features/grammar/PracticeScreen";
import { PronunciationScreen } from "./features/pronunciation/PronunciationScreen";
import { ShadowingScreen } from "./features/shadowing/ShadowingScreen";
import { PhaseTestScreen } from "./features/checkpoint/PhaseTestScreen";
import { Progress } from "./features/progress/Progress";
import { Settings } from "./features/settings/Settings";
import { Setup } from "./features/setup/Setup";
import { Today } from "./features/today/Today";

function Screens() {
  const { startDate, plan } = useApp();
  const route = useRoute();
  useReminder();

  if (!startDate) return <Setup />;
  if (route === "/progreso") return <Progress />;
  if (route === "/ajustes") return <Settings />;
  const lesson = route.match(/^\/gramatica\/(\d+)$/);
  if (lesson) return <LessonScreen key={`lesson-${lesson[1]}`} week={Number(lesson[1])} />;
  const practice = route.match(/^\/practica\/(\d+)$/);
  if (practice) return <PracticeScreen key={`practice-${practice[1]}`} mode="practice" week={Number(practice[1])} />;
  const pron = route.match(/^\/pronunciacion\/(\d+)$/);
  if (pron) return <PronunciationScreen key={`pron-${pron[1]}`} week={Number(pron[1])} />;
  const shadow = route.match(/^\/shadowing\/(\d+)$/);
  if (shadow) return <ShadowingScreen key={`shadow-${shadow[1]}`} week={Number(shadow[1])} />;
  const test = route.match(/^\/test\/([123])$/);
  if (test) return <PhaseTestScreen key={`test-${test[1]}`} phase={Number(test[1])} />;
  if (route === "/repaso") return <PracticeScreen key="review" mode="review" week={plan?.weekNumber ?? 1} />;
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
