import { href, useRoute } from "../app/route";
import { Icon, type IconName } from "./Icon";

const TABS: { to: string; label: string; icon: IconName }[] = [
  { to: "/", label: "Hoy", icon: "home" },
  { to: "/practicar-area", label: "Practicar", icon: "target" },
  { to: "/plan", label: "Plan", icon: "map" },
  { to: "/progreso", label: "Progreso", icon: "chart" },
];

/** Las rutas donde se muestra la barra: solo las cuatro pestañas (los ejercicios necesitan foco). */
export const hasTabBar = (route: string) => TABS.some((t) => t.to === route);

export function TabBar({ visible }: { visible: boolean }) {
  const route = useRoute();
  if (!visible) return null;
  return (
    <nav className="tabbar" aria-label="Secciones">
      {TABS.map((t) => (
        <a key={t.to} href={href(t.to)} className="tab" aria-current={route === t.to ? "page" : undefined}>
          <Icon name={t.icon} size={22} />
          <span>{t.label}</span>
        </a>
      ))}
    </nav>
  );
}
