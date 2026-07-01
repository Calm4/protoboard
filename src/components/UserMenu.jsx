import { useState } from "react";
import ProfileModal from "./ProfileModal.jsx";

// Кнопка с аватаром пользователя в шапке. Клик открывает профиль (просмотр + выход).
export default function UserMenu({ user, role, onSignOut, projects, onOpenProject, onOpenTask }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="pb-usermenu-btn" onClick={() => setOpen(true)} title={user.email}>
        {user.photoURL
          ? <img src={user.photoURL} width={24} height={24} className="pb-usermenu-avatar" referrerPolicy="no-referrer" />
          : <span className="pb-usermenu-avatar fallback">{(user.displayName || user.email || "?")[0].toUpperCase()}</span>
        }
        {user.displayName?.split(" ")[0] || user.email?.split("@")[0]}
      </button>
      {open && (
        <ProfileModal
          user={user} role={role} onClose={() => setOpen(false)} onSignOut={onSignOut}
          projects={projects} onOpenProject={onOpenProject} onOpenTask={onOpenTask}
        />
      )}
    </>
  );
}
