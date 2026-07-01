import { useEffect, useState } from "react";
import { POSITIONS } from "../constants.js";
import { personName } from "../lib/people.js";

// Полноэкранная страница профиля (не поп-ап): аватар, редактируемые имя/должность,
// роль, «мои проекты» и «мои задачи» на всю ширину, выход.
export default function ProfilePage({
  user, role, customName, position, onSaveProfile, onSignOut, onBack,
  isDark, onToggleDark, projects = [], onOpenProject, onOpenTask,
}) {
  const roleLabel = role === "admin" ? "Администратор" : "Участник";
  const [name, setName] = useState(customName || "");
  const [pos, setPos] = useState(position || "");
  useEffect(() => { setName(customName || ""); }, [customName]);
  useEffect(() => { setPos(position || ""); }, [position]);
  const dirty = name.trim() !== (customName || "") || pos !== (position || "");

  const displayName = personName({ customName, displayName: user.displayName, email: user.email });

  const myProjects = projects.filter((p) => !p.archived && (p.members || []).includes(user.uid));
  const myTasks = [];
  projects.forEach((p) => {
    (p.tasks || []).forEach((t) => {
      if (t.assignee === user.uid) myTasks.push({ ...t, projectId: p.id, projectName: p.name, projectColor: p.color });
    });
  });

  const goProject = (pid) => onOpenProject(pid);
  const goTask = (pid, tid) => onOpenTask(pid, tid);

  return (
    <>
      <div className="pb-top">
        <div className="pb-brand pb-projectbrand" onClick={onBack} title="На главную">
          <span className="pb-logo">Proto<b>board</b></span>
        </div>
        <button className="pb-darktoggle" title="Сменить тему" onClick={onToggleDark}>
          {isDark ? "☀" : "☾"}
        </button>
      </div>

      <div className="pb-profilepage">
        <div className="pb-profile-head">
          {user.photoURL
            ? <img src={user.photoURL} width={72} height={72} className="pb-profile-avatar" referrerPolicy="no-referrer" />
            : <span className="pb-profile-avatar fallback" style={{ fontSize: 28 }}>{(displayName || "?")[0].toUpperCase()}</span>
          }
          <div>
            <div className="pb-profile-name">{displayName}</div>
            <div className="pb-profile-email">{user.email}</div>
            <span className={"pb-rolechip" + (role === "admin" ? " admin" : "")} style={{ marginTop: 8 }}>{roleLabel}</span>
          </div>
        </div>

        <div className="pb-field">
          <label>Имя</label>
          <input
            className="pb-input"
            placeholder={user.displayName || "Имя"}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="pb-field">
          <label>Должность</label>
          <div className="pb-poschips">
            {POSITIONS.map((p) => (
              <button
                key={p}
                type="button"
                className={"pb-chip" + (pos === p ? " on" : "")}
                onClick={() => setPos(pos === p ? "" : p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        {dirty && (
          <button
            className="pb-btn primary"
            onClick={() => onSaveProfile({ customName: name.trim(), position: pos })}
          >
            Сохранить
          </button>
        )}

        <div className="pb-field" style={{ marginTop: 28 }}>
          <label>Мои проекты ({myProjects.length})</label>
          <div className="pb-profilelist">
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
        </div>

        <div className="pb-field">
          <label>Мои задачи ({myTasks.length})</label>
          <div className="pb-profilelist">
            {myTasks.length === 0 ? (
              <div className="pb-act-row muted">Нет назначенных задач</div>
            ) : myTasks.map((t) => (
              <button key={t.id} className="pb-act-row pb-act-row-btn" onClick={() => goTask(t.projectId, t.id)}>
                <span className="pb-act-action">{t.title}</span>
                <span className="pb-act-time">{t.projectName}</span>
              </button>
            ))}
          </div>
        </div>

        <button className="pb-btn danger" style={{ marginTop: 24 }} onClick={onSignOut}>Выйти</button>
      </div>
    </>
  );
}
