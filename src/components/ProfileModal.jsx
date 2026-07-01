// Модалка профиля: аватар, имя, почта, роль + выход.
export default function ProfileModal({ user, role, onClose, onSignOut }) {
  const roleLabel = role === "admin" ? "Администратор" : "Участник";
  return (
    <>
      <div className="pb-scrim" onClick={onClose} />
      <div className="pb-modal">
        <button className="x" onClick={onClose}>✕</button>
        <div className="pb-profile-head">
          {user.photoURL
            ? <img src={user.photoURL} width={56} height={56} className="pb-profile-avatar" referrerPolicy="no-referrer" />
            : <span className="pb-profile-avatar fallback">{(user.displayName || user.email || "?")[0].toUpperCase()}</span>
          }
          <div>
            <div className="pb-profile-name">{user.displayName || "Без имени"}</div>
            <div className="pb-profile-email">{user.email}</div>
          </div>
        </div>
        <span className={"pb-rolechip" + (role === "admin" ? " admin" : "")}>{roleLabel}</span>
        <div className="pb-modal-foot">
          <button className="pb-btn danger" onClick={onSignOut}>Выйти</button>
        </div>
      </div>
    </>
  );
}
