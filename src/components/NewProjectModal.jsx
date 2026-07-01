import ColorSwatches from "./ColorSwatches.jsx";

// Модальное окно создания проекта: название + цвет (полоска/кружок проекта).
// proj — { name, color }; onChange отдаёт обновлённый объект наверх.
export default function NewProjectModal({ proj, onChange, onCreate, onClose }) {
  const canCreate = proj.name.trim().length > 0;
  return (
    <>
      <div className="pb-scrim" onClick={onClose} />
      <div className="pb-modal pb-newproj-modal">
        <button className="x" onClick={onClose}>✕</button>
        <div className="pb-newproj-preview" style={{ background: proj.color }}>
          {(proj.name.trim()[0] || "P").toUpperCase()}
        </div>
        <h3>Новый прототип</h3>
        <p className="pb-modal-desc">Название и цвет всегда можно поменять позже — в настройках проекта.</p>
        <div className="pb-field">
          <label>Название</label>
          <input
            className="pb-input lg"
            autoFocus
            value={proj.name}
            placeholder="Напр. Neon Dash"
            onChange={(e) => onChange({ ...proj, name: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && canCreate && onCreate()}
          />
        </div>
        <div className="pb-field">
          <label>Цвет</label>
          <ColorSwatches value={proj.color} onChange={(color) => onChange({ ...proj, color })} />
        </div>
        <div className="pb-modal-foot">
          <button className="pb-btn ghost" onClick={onClose}>Отмена</button>
          <button className="pb-btn primary" disabled={!canCreate} onClick={onCreate}>Создать проект</button>
        </div>
      </div>
    </>
  );
}
