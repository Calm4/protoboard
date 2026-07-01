import { useState, useMemo } from "react";
import HeaderControls from "./HeaderControls.jsx";

const isHoldStatus = (label) => {
  const l = (label || "").toLowerCase();
  return (
    l.includes("hold") || l.includes("not fix") || l.includes("no fix") ||
    l.includes("won't fix") || l.includes("wontfix") || l.includes("not in build") ||
    l.includes("заморожен") || l.includes("отложен") || l.includes("на удержании") ||
    l.includes("не фикс") || l.includes("не в билде")
  );
};

export default function ProjectGrid({
  active, archived, allProjects, showArchived, onToggleArchived,
  onOpen, onArchive, onUnarchive, onNewProject, onOpenTask,
  isDark, onToggleDark, onSetGradient, onDeleteProject,
  user, customName, onOpenProfile, isAdmin, onJoinProject,
}) {
  const [gSearch, setGSearch] = useState("");
  const [gOpen, setGOpen] = useState(false);
  const [joinConfirm, setJoinConfirm] = useState(null); // проект, который спросим подтвердить

  const uid = user.uid;
  // members === undefined — старый проект, ещё не мигрирован (см. App.jsx): пока
  // считаем «своим», чтобы не мигало «0 проектов» до завершения бэкфилла.
  const isMember = (p) => (p.members === undefined ? true : p.members.includes(uid));
  const myActive = active.filter(isMember);
  const discoverable = active.filter((p) => !isMember(p));
  const myArchived = archived.filter(isMember);
  const discoverableArchived = archived.filter((p) => !isMember(p));

  const requestJoin = (p) => setJoinConfirm(p);
  const confirmJoin = () => {
    const p = joinConfirm;
    setJoinConfirm(null);
    if (p) { onJoinProject(p.id); onOpen(p.id); }
  };

  const globalStats = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    let total = 0, open = 0, week = 0;
    allProjects.forEach((p) => {
      const lastId = p.statuses[p.statuses.length - 1]?.id;
      const holdIds = new Set(p.statuses.filter((s) => isHoldStatus(s.label)).map((s) => s.id));
      p.tasks.forEach((t) => {
        total++;
        if (t.status !== lastId && !holdIds.has(t.status)) open++;
        if (t.created && new Date(t.created).getTime() >= weekAgo) week++;
      });
    });
    return { total, open, week, projects: allProjects.length };
  }, [allProjects]);

  const searchResults = useMemo(() => {
    const q = gSearch.trim().toLowerCase();
    if (!q) return [];
    const results = [];
    allProjects.forEach((p) => {
      if ((p.name || "").toLowerCase().includes(q)) {
        results.push({ type: "project", project: p });
      }
    });
    allProjects.forEach((p) => {
      p.tasks.forEach((t) => {
        if ((t.title || "").toLowerCase().includes(q)) {
          results.push({ type: "task", projectId: p.id, projectName: p.name, projectColor: p.color, task: t });
        }
      });
    });
    return results.slice(0, 24);
  }, [gSearch, allProjects]);

  const handleTaskResultClick = (pid, tid) => {
    setGSearch(""); setGOpen(false);
    onOpenTask(pid, tid);
  };
  const handleProjectResultClick = (p) => {
    setGSearch(""); setGOpen(false);
    if (!isMember(p)) requestJoin(p);
    else onOpen(p.id);
  };

  return (
    <>
      <div className="pb-top">
        <div className="pb-brand">
          <span className="pb-logo">Proto<b>board</b></span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <HeaderControls
            isDark={isDark} onToggleDark={onToggleDark} user={user} customName={customName}
            onOpenProfile={onOpenProfile}
          />
          <button className="pb-btn primary" onClick={onNewProject}>+ Новый проект</button>
        </div>
      </div>

      {/* Глобальный поиск */}
      <div className="pb-gsearch-wrap">
        <div className="pb-search" style={{ width: "100%", maxWidth: 460 }}>
          <span className="pb-search-ic">⌕</span>
          <input
            type="text"
            placeholder="Поиск по всем проектам…"
            value={gSearch}
            onChange={(e) => { setGSearch(e.target.value); setGOpen(true); }}
            onFocus={() => setGOpen(true)}
            onKeyDown={(e) => { if (e.key === "Escape") { setGSearch(""); setGOpen(false); } }}
          />
          {gSearch && <button className="pb-search-x" onClick={() => { setGSearch(""); setGOpen(false); }}>✕</button>}
        </div>
        {gOpen && gSearch.trim() && (
          <>
            <div className="pb-tagscrim" onMouseDown={() => setGOpen(false)} />
            <div className="pb-gsresults">
              {searchResults.length === 0 ? (
                <div className="pb-gsempty">Ничего не найдено</div>
              ) : (
                searchResults.map((r) =>
                  r.type === "project" ? (
                    <button key={"p" + r.project.id} className="pb-gsrow" onMouseDown={() => handleProjectResultClick(r.project)}>
                      <span className="pb-gsdot" style={{ background: r.project.color }} />
                      <span className="pb-gsproject">{r.project.name}</span>
                      <span className="pb-gsarrow">›</span>
                      <span className="pb-gstitle muted">проект</span>
                      <span className="pb-joinbadge" style={{ marginLeft: "auto" }}>
                        {isMember(r.project) ? "Участник" : "Присоединиться"}
                      </span>
                    </button>
                  ) : (
                    <button key={r.task.id} className="pb-gsrow" onMouseDown={() => handleTaskResultClick(r.projectId, r.task.id)}>
                      <span className="pb-gsdot" style={{ background: r.projectColor }} />
                      <span className="pb-gsproject">{r.projectName}</span>
                      <span className="pb-gsarrow">›</span>
                      <span className="pb-gstitle">{r.task.title}</span>
                      {r.task.num != null && <span className="pb-num" style={{ marginLeft: "auto" }}>#{r.task.num}</span>}
                    </button>
                  )
                )
              )}
            </div>
          </>
        )}
      </div>

      {/* Общая статистика */}
      {globalStats.total > 0 && (
        <div className="pb-globalstats">
          <span><b>{globalStats.projects}</b> проектов</span>
          <span className="pb-gs-sep">·</span>
          <span><b>{globalStats.total}</b> задач</span>
          <span className="pb-gs-sep">·</span>
          <span><b>{globalStats.open}</b> открытых</span>
          <span className="pb-gs-sep">·</span>
          <span><b>+{globalStats.week}</b> за неделю</span>
        </div>
      )}

      {/* Мои проекты */}
      <div className="pb-sectionhead">
        <h2>Мои проекты</h2>
        <span className="rule" />
      </div>
      <div className="pb-grid">
        {myActive.map((p) => {
          const total = p.tasks.length;
          const done = p.tasks.filter((t) => t.status === p.statuses[p.statuses.length - 1]?.id).length;
          const pct = total ? Math.round((done / total) * 100) : 0;
          const hasGrad = !!p.gradient;
          return (
            <div
              key={p.id}
              className={"pb-proj" + (hasGrad ? " has-gradient" : "")}
              style={hasGrad ? { background: p.gradient } : undefined}
              onClick={() => onOpen(p.id)}
            >
              {!hasGrad && <span className="accentbar" style={{ background: p.color }} />}
              <button className="pb-arch-btn" onClick={(e) => { e.stopPropagation(); onArchive(p.id); }}>В архив</button>
              <h3>{p.name}</h3>
              <div className="pb-meta">
                <span className="pb-build">{p.build}</span> · {total} задач
              </div>
              <div className="pb-prog"><i style={{ width: pct + "%" }} /></div>
              <div className="pb-count">{done}/{total} готово · {pct}%</div>
            </div>
          );
        })}
        {myActive.length === 0 && (
          <div className="pb-empty">
            Ты пока не состоишь ни в одном проекте — выбери проект ниже
            {discoverable.length === 0 && " или создай свой"}.
          </div>
        )}
      </div>

      {/* Все проекты (те, где я ещё не участник) — можно присоединиться */}
      {discoverable.length > 0 && (
        <>
          <div className="pb-sectionhead">
            <h2>Все проекты</h2>
            <span className="rule" />
          </div>
          <div className="pb-grid">
            {discoverable.map((p) => {
              const hasGrad = !!p.gradient;
              return (
                <div
                  key={p.id}
                  className={"pb-proj" + (hasGrad ? " has-gradient" : "")}
                  style={hasGrad ? { background: p.gradient } : undefined}
                  onClick={() => requestJoin(p)}
                >
                  {!hasGrad && <span className="accentbar" style={{ background: p.color }} />}
                  <button className="pb-arch-btn static" onClick={(e) => { e.stopPropagation(); requestJoin(p); }}>
                    Присоединиться
                  </button>
                  <h3>{p.name}</h3>
                  <div className="pb-meta">
                    <span className="pb-build">{p.build}</span> · {p.tasks.length} задач
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Архив (мои архивные проекты + чужие, к которым можно присоединиться) */}
      {(myArchived.length > 0 || discoverableArchived.length > 0) && (
        <>
          <div className="pb-sectionhead">
            <h2>Архив ({myArchived.length + discoverableArchived.length})</h2>
            <span className="rule" />
            <button className="pb-btn ghost sm" onClick={onToggleArchived}>{showArchived ? "Скрыть" : "Показать"}</button>
          </div>
          {showArchived && (
            <div className="pb-grid">
              {myArchived.map((p) => {
                const hasGrad = !!p.gradient;
                return (
                <div
                  key={p.id}
                  className={"pb-proj" + (hasGrad ? " has-gradient" : "")}
                  style={{ opacity: .68, ...(hasGrad ? { background: p.gradient } : {}) }}
                  onClick={() => onOpen(p.id)}
                >
                  {!hasGrad && <span className="accentbar" style={{ background: p.color }} />}
                  <div className="pb-arch-actions">
                    <button className="pb-arch-btn static" onClick={(e) => { e.stopPropagation(); onUnarchive(p.id); }}>Вернуть</button>
                    {isAdmin && <button className="pb-arch-del" onClick={(e) => { e.stopPropagation(); onDeleteProject(p.id); }}>Удалить</button>}
                  </div>
                  <h3>{p.name}</h3>
                  <div className="pb-meta"><span className="pb-build">{p.build}</span> · {p.tasks.length} задач</div>
                </div>
                );
              })}
              {discoverableArchived.map((p) => {
                const hasGrad = !!p.gradient;
                return (
                <div
                  key={p.id}
                  className={"pb-proj" + (hasGrad ? " has-gradient" : "")}
                  style={{ opacity: .68, ...(hasGrad ? { background: p.gradient } : {}) }}
                  onClick={() => requestJoin(p)}
                >
                  {!hasGrad && <span className="accentbar" style={{ background: p.color }} />}
                  <button className="pb-arch-btn static" onClick={(e) => { e.stopPropagation(); requestJoin(p); }}>
                    Присоединиться
                  </button>
                  <h3>{p.name}</h3>
                  <div className="pb-meta"><span className="pb-build">{p.build}</span> · {p.tasks.length} задач</div>
                </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Подтверждение присоединения к проекту */}
      {joinConfirm && (
        <>
          <div className="pb-scrim" onClick={() => setJoinConfirm(null)} />
          <div className="pb-modal">
            <button className="x" onClick={() => setJoinConfirm(null)}>✕</button>
            <h2 className="pb-modal-title">Присоединиться к проекту?</h2>
            <p className="pb-modal-desc">
              Ты пока не участник «<b>{joinConfirm.name}</b>». Присоединиться, чтобы открыть его?
            </p>
            <div className="pb-modal-foot">
              <button className="pb-btn ghost" onClick={() => setJoinConfirm(null)}>Отмена</button>
              <button className="pb-btn primary" onClick={confirmJoin}>Присоединиться</button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
