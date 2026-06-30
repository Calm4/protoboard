import { useState, useMemo, useRef } from "react";

function UserBadge({ user, onSignOut }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{ display:"flex", alignItems:"center", gap:7, padding:"4px 8px 4px 4px",
          borderRadius:8, border:"1.5px solid var(--line)", background:"var(--surface)",
          cursor:"pointer", color:"var(--text)", fontSize:13.5, fontWeight:500 }}
        title={user.email}
      >
        {user.photoURL
          ? <img src={user.photoURL} width={24} height={24}
              style={{ borderRadius:"50%", display:"block" }} referrerPolicy="no-referrer" />
          : <span style={{ width:24, height:24, borderRadius:"50%", background:"var(--accent)",
              color:"#fff", fontSize:12, fontWeight:700, display:"flex",
              alignItems:"center", justifyContent:"center" }}>
              {(user.displayName || user.email || "?")[0].toUpperCase()}
            </span>
        }
        {user.displayName?.split(" ")[0] || user.email?.split("@")[0]}
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)}
            style={{ position:"fixed", inset:0, zIndex:99 }} />
          <div style={{ position:"absolute", right:0, top:"calc(100% + 6px)", zIndex:100,
            background:"var(--surface)", border:"1px solid var(--line)", borderRadius:10,
            boxShadow:"0 8px 24px rgba(0,0,0,.12)", minWidth:180, padding:"6px 0" }}>
            <div style={{ padding:"8px 14px 6px", fontSize:12, color:"var(--soft)",
              borderBottom:"1px solid var(--line)", marginBottom:4 }}>
              {user.email}
            </div>
            <button onClick={() => { setOpen(false); onSignOut(); }}
              style={{ display:"block", width:"100%", textAlign:"left",
                padding:"8px 14px", background:"none", border:"none",
                cursor:"pointer", fontSize:13.5, color:"var(--text)" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--hover)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "none"}
            >
              Выйти
            </button>
          </div>
        </>
      )}
    </div>
  );
}

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
  user, onSignOut, isAdmin,
}) {
  const [gSearch, setGSearch] = useState("");
  const [gOpen, setGOpen] = useState(false);

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
      p.tasks.forEach((t) => {
        if ((t.title || "").toLowerCase().includes(q)) {
          results.push({ projectId: p.id, projectName: p.name, projectColor: p.color, task: t });
        }
      });
    });
    return results.slice(0, 24);
  }, [gSearch, allProjects]);

  const handleResultClick = (pid, tid) => {
    setGSearch(""); setGOpen(false);
    onOpenTask(pid, tid);
  };

  return (
    <>
      <div className="pb-top">
        <div className="pb-brand">
          <span className="pb-logo">Proto<b>board</b></span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="pb-darktoggle" title="Сменить тему" onClick={onToggleDark}>
            {isDark ? "☀" : "☾"}
          </button>
          {user && <UserBadge user={user} onSignOut={onSignOut} />}
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
                searchResults.map(({ projectId, projectName, projectColor, task }) => (
                  <button key={task.id} className="pb-gsrow" onMouseDown={() => handleResultClick(projectId, task.id)}>
                    <span className="pb-gsdot" style={{ background: projectColor }} />
                    <span className="pb-gsproject">{projectName}</span>
                    <span className="pb-gsarrow">›</span>
                    <span className="pb-gstitle">{task.title}</span>
                    {task.num != null && <span className="pb-num" style={{ marginLeft: "auto" }}>#{task.num}</span>}
                  </button>
                ))
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

      {/* Активные проекты */}
      <div className="pb-grid">
        {active.map((p) => {
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
        {active.length === 0 && <div className="pb-empty">Пока нет активных проектов. Создай первый прототип.</div>}
      </div>


      {/* Архив */}
      {archived.length > 0 && (
        <>
          <div className="pb-sectionhead">
            <h2>Архив ({archived.length})</h2>
            <span className="rule" />
            <button className="pb-btn ghost sm" onClick={onToggleArchived}>{showArchived ? "Скрыть" : "Показать"}</button>
          </div>
          {showArchived && (
            <div className="pb-grid">
              {archived.map((p) => {
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
            </div>
          )}
        </>
      )}
    </>
  );
}
