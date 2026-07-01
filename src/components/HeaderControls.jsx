import UserMenu from "./UserMenu.jsx";

// Правый кластер шапки (тема + профиль) — общий для главного экрана и экрана проекта.
export default function HeaderControls({ isDark, onToggleDark, user, customName, onOpenProfile }) {
  return (
    <div className="pb-headctrls">
      <button className="pb-darktoggle" title="Сменить тему" onClick={onToggleDark}>
        {isDark ? "☀" : "☾"}
      </button>
      {user && <UserMenu user={user} customName={customName} onOpenProfile={onOpenProfile} />}
    </div>
  );
}
