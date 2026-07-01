import UserMenu from "./UserMenu.jsx";

// Правый кластер шапки (тема + профиль) — общий для главного экрана и экрана проекта.
export default function HeaderControls({ isDark, onToggleDark, user, role, onSignOut, projects, onOpenProject, onOpenTask }) {
  return (
    <div className="pb-headctrls">
      <button className="pb-darktoggle" title="Сменить тему" onClick={onToggleDark}>
        {isDark ? "☀" : "☾"}
      </button>
      {user && (
        <UserMenu
          user={user} role={role} onSignOut={onSignOut}
          projects={projects} onOpenProject={onOpenProject} onOpenTask={onOpenTask}
        />
      )}
    </div>
  );
}
