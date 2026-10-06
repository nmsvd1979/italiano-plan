import { AppProvider, useApp } from "./app/state";
import { useRoute } from "./app/route";
import { useReminder } from "./app/useReminder";
import { Progress } from "./features/progress/Progress";
import { Settings } from "./features/settings/Settings";
import { Setup } from "./features/setup/Setup";
import { Today } from "./features/today/Today";

function Screens() {
  const { startDate } = useApp();
  const route = useRoute();
  useReminder();

  if (!startDate) return <Setup />;
  if (route === "/progreso") return <Progress />;
  if (route === "/ajustes") return <Settings />;
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
