import UserMenu from "./UserMenu.jsx";
import { useT } from "../lib/i18n.js";

// Правый кластер шапки (тема + язык + профиль) — общий для главного экрана и экрана проекта.
export default function HeaderControls({ isDark, onToggleDark, lang, onToggleLang, user, customName, onOpenProfile }) {
  const t = useT();
  return (
    <div className="pb-headctrls">
      {onToggleLang && (
        <button className="pb-darktoggle pb-langtoggle" title={t("Сменить язык")} onClick={onToggleLang}>
          {lang === "en" ? "EN" : "RU"}
        </button>
      )}
      <button className="pb-darktoggle" title={t("Сменить тему")} onClick={onToggleDark}>
        {isDark ? "☀" : "☾"}
      </button>
      {user && <UserMenu user={user} customName={customName} onOpenProfile={onOpenProfile} />}
    </div>
  );
}
