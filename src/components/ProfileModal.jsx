import { useState } from "react";

// Модалка профиля: аватар, имя, почта, роль, «мои проекты», «мои задачи» + выход.
export default function ProfileModal({ user, role, onClose, onSignOut, projects = [], onOpenProject, onOpenTask }) {
  const roleLabel = role === "admin" ? "Администратор" : "Участник";
  const [projOpen, setProjOpen] = useState(true);
  const [taskOpen, setTaskOpen] = useState(false);

  const myProjects = projects.filter((p) => !p.archived && (p.members || []).includes(user.uid));
  const myTasks = [];
  projects.forEach((p) => {
    (p.tasks || []).forEach((t) => {
      if (t.assignee === user.uid) myTasks.push({ ...t, projectId: p.id, projectName: p.name, projectColor: p.color });
    });
  });

  const goProject = (pid) => { onClose(); onOpenProject(pid); };
  const goTask = (pid, tid) => { onClose(); onOpenTask(pid, tid); };

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

        <div className="pb-field">
          <button className="pb-act-toggle" onClick={() => setProjOpen((o) => !o)}>
            {projOpen ? "▲" : "▼"} Мои проекты
            {myProjects.length > 0 && <span className="pb-act-cnt">{myProjects.length}</span>}
          </button>
          {projOpen && (
            <div className="pb-activity">
              {myProjects.length === 0 ? (
                <div className="pb-act-row muted">Пока нет своих проектов</div>
              ) : myProjects.map((p) => (
                <button key={p.id} className="pb-act-row pb-act-row-btn" onClick={() => goProject(p.id)}>
                  <span className="pb-act-action">
                    <span className="pb-gsdot" style={{ background: p.color }} /> {p.name}
                  </span>
                  <span className="pb-act-time">{p.tasks.length} задач</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pb-field">
          <button className="pb-act-toggle" onClick={() => setTaskOpen((o) => !o)}>
            {taskOpen ? "▲" : "▼"} Мои задачи
            {myTasks.length > 0 && <span className="pb-act-cnt">{myTasks.length}</span>}
          </button>
          {taskOpen && (
            <div className="pb-activity">
              {myTasks.length === 0 ? (
                <div className="pb-act-row muted">Нет назначенных задач</div>
              ) : myTasks.map((t) => (
                <button key={t.id} className="pb-act-row pb-act-row-btn" onClick={() => goTask(t.projectId, t.id)}>
                  <span className="pb-act-action">{t.title}</span>
                  <span className="pb-act-time">{t.projectName}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pb-modal-foot">
          <button className="pb-btn danger" onClick={onSignOut}>Выйти</button>
        </div>
      </div>
    </>
  );
}
