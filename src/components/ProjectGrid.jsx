import { useMemo } from "react";
import HeaderControls from "./HeaderControls.jsx";
import GlobalSearch from "./GlobalSearch.jsx";
import { useT } from "../lib/i18n.js";

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
  isDark, onToggleDark, lang, onToggleLang, onSetGradient, onDeleteProject,
  user, customName, onOpenProfile, isAdmin, onRequestJoin,
}) {
  const t = useT();
  const uid = user.uid;
  // members === undefined — старый проект, ещё не мигрирован (см. App.jsx): пока
  // считаем «своим», чтобы не мигало «0 проектов» до завершения бэкфилла.
  const isMember = (p) => (p.members === undefined ? true : p.members.includes(uid));
  const myActive = active.filter(isMember);
  const discoverable = active.filter((p) => !isMember(p));
  const myArchived = archived.filter(isMember);
  const discoverableArchived = archived.filter((p) => !isMember(p));

  const globalStats = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    let total = 0, open = 0, week = 0;
    allProjects.forEach((p) => {
      const lastId = p.statuses[p.statuses.length - 1]?.id;
      const holdIds = new Set(p.statuses.filter((s) => isHoldStatus(s.label)).map((s) => s.id));
      p.tasks.forEach((task) => {
        total++;
        if (task.status !== lastId && !holdIds.has(task.status)) open++;
        if (task.created && new Date(task.created).getTime() >= weekAgo) week++;
      });
    });
    return { total, open, week, projects: allProjects.length };
  }, [allProjects]);

  return (
    <>
      <div className="pb-top">
        <div className="pb-brand">
          <span className="pb-logo">Proto<b>board</b></span>
        </div>
        <GlobalSearch allProjects={allProjects} user={user} onOpenTask={onOpenTask} onOpenProject={onOpen} onRequestJoin={onRequestJoin} />
        <div style={{ display: "flex", gap: 8, alignItems: "center", justifySelf: "end" }}>
          <HeaderControls
            isDark={isDark} onToggleDark={onToggleDark} lang={lang} onToggleLang={onToggleLang}
            user={user} customName={customName} onOpenProfile={onOpenProfile}
          />
          <button className="pb-btn primary" onClick={onNewProject}>{t("+ Новый проект")}</button>
        </div>
      </div>

      {/* Общая статистика */}
      {globalStats.total > 0 && (
        <div className="pb-globalstats">
          <span><b>{globalStats.projects}</b> {t("проектов")}</span>
          <span className="pb-gs-sep">·</span>
          <span><b>{globalStats.total}</b> {t("задач")}</span>
          <span className="pb-gs-sep">·</span>
          <span><b>{globalStats.open}</b> {t("открытых")}</span>
          <span className="pb-gs-sep">·</span>
          <span><b>+{globalStats.week}</b> {t("за неделю")}</span>
        </div>
      )}

      {/* Мои проекты */}
      <div className="pb-sectionhead">
        <h2>{t("Мои проекты")}</h2>
        <span className="rule" />
      </div>
      <div className="pb-grid">
        {myActive.map((p) => {
          const total = p.tasks.length;
          const done = p.tasks.filter((task) => task.status === p.statuses[p.statuses.length - 1]?.id).length;
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
              <button className="pb-arch-btn" onClick={(e) => { e.stopPropagation(); onArchive(p.id); }}>{t("В архив")}</button>
              <h3>{p.name}</h3>
              <div className="pb-meta">
                <span className="pb-build">{p.build}</span> · {total} {t("задач")}
              </div>
              <div className="pb-prog"><i style={{ width: pct + "%" }} /></div>
              <div className="pb-count">{done}/{total} {t("готово")} · {pct}%</div>
            </div>
          );
        })}
        {myActive.length === 0 && (
          <div className="pb-empty">
            {t("Ты пока не состоишь ни в одном проекте — выбери проект ниже")}
            {discoverable.length === 0 && t(" или создай свой")}.
          </div>
        )}
      </div>

      {/* Все проекты (те, где я ещё не участник) — можно присоединиться */}
      {discoverable.length > 0 && (
        <>
          <div className="pb-sectionhead">
            <h2>{t("Все проекты")}</h2>
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
                  onClick={() => onRequestJoin(p)}
                >
                  {!hasGrad && <span className="accentbar" style={{ background: p.color }} />}
                  <button className="pb-arch-btn static" onClick={(e) => { e.stopPropagation(); onRequestJoin(p); }}>
                    {t("Присоединиться")}
                  </button>
                  <h3>{p.name}</h3>
                  <div className="pb-meta">
                    <span className="pb-build">{p.build}</span> · {p.tasks.length} {t("задач")}
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
            <h2>{t("Архив")} ({myArchived.length + discoverableArchived.length})</h2>
            <span className="rule" />
            <button className="pb-btn ghost sm" onClick={onToggleArchived}>{showArchived ? t("Скрыть") : t("Показать")}</button>
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
                    <button className="pb-arch-btn static" onClick={(e) => { e.stopPropagation(); onUnarchive(p.id); }}>{t("Вернуть")}</button>
                    {isAdmin && <button className="pb-arch-del" onClick={(e) => { e.stopPropagation(); onDeleteProject(p.id); }}>{t("Удалить")}</button>}
                  </div>
                  <h3>{p.name}</h3>
                  <div className="pb-meta"><span className="pb-build">{p.build}</span> · {p.tasks.length} {t("задач")}</div>
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
                  onClick={() => onRequestJoin(p)}
                >
                  {!hasGrad && <span className="accentbar" style={{ background: p.color }} />}
                  <button className="pb-arch-btn static" onClick={(e) => { e.stopPropagation(); onRequestJoin(p); }}>
                    {t("Присоединиться")}
                  </button>
                  <h3>{p.name}</h3>
                  <div className="pb-meta"><span className="pb-build">{p.build}</span> · {p.tasks.length} {t("задач")}</div>
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
