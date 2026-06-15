// Главный экран: список активных проектов карточками + сворачиваемый архив.
export default function ProjectGrid({
  active, archived, showArchived, onToggleArchived,
  onOpen, onArchive, onUnarchive, onNewProject,
}) {
  return (
    <>
      <div className="pb-top">
        <div className="pb-brand">
          <span className="pb-logo">Proto<b>board</b></span>
          <span className="pb-tag">прототип · этап 1</span>
        </div>
        <button className="pb-btn primary" onClick={onNewProject}>+ Новый проект</button>
      </div>
      <p className="pb-sub">Трекер задач и багов по прототипам мобильных игр. Каждый проект — отдельный прототип в разработке.</p>

      <div className="pb-grid">
        {active.map((p) => {
          const total = p.tasks.length;
          const done = p.tasks.filter((t) => t.status === "done").length;
          const pct = total ? Math.round((done / total) * 100) : 0;
          return (
            <div key={p.id} className="pb-proj" onClick={() => onOpen(p.id)}>
              <span className="accentbar" />
              <button className="pb-arch-btn" onClick={(e) => { e.stopPropagation(); onArchive(p.id); }}>В архив</button>
              <h3>{p.name}</h3>
              <div className="pb-meta"><span className="pb-build">{p.build}</span> · {total} задач</div>
              <div className="pb-prog"><i style={{ width: pct + "%" }} /></div>
              <div className="pb-count">{done}/{total} готово · {pct}%</div>
            </div>
          );
        })}
        {active.length === 0 && <div className="pb-empty">Пока нет активных проектов. Создай первый прототип.</div>}
      </div>

      {archived.length > 0 && (
        <>
          <div className="pb-sectionhead">
            <h2>Архив ({archived.length})</h2>
            <span className="rule" />
            <button className="pb-btn ghost sm" onClick={onToggleArchived}>{showArchived ? "Скрыть" : "Показать"}</button>
          </div>
          {showArchived && (
            <div className="pb-grid">
              {archived.map((p) => (
                <div key={p.id} className="pb-proj" style={{ opacity: .68 }} onClick={() => onOpen(p.id)}>
                  <button className="pb-arch-btn" onClick={(e) => { e.stopPropagation(); onUnarchive(p.id); }}>Вернуть</button>
                  <h3>{p.name}</h3>
                  <div className="pb-meta"><span className="pb-build">{p.build}</span> · {p.tasks.length} задач</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
