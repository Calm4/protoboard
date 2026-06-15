import ColorSwatches from "./ColorSwatches.jsx";

// Модальное окно создания проекта: название + цвет (полоска/кружок проекта).
// proj — { name, color }; onChange отдаёт обновлённый объект наверх.
export default function NewProjectModal({ proj, onChange, onCreate, onClose }) {
  return (
    <>
      <div className="pb-scrim" onClick={onClose} />
      <div className="pb-modal">
        <h3>Новый прототип</h3>
        <div className="pb-field">
          <label>Название</label>
          <input
            className="pb-input"
            autoFocus
            value={proj.name}
            placeholder="Напр. Neon Dash"
            onChange={(e) => onChange({ ...proj, name: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && onCreate()}
          />
        </div>
        <div className="pb-field">
          <label>Цвет</label>
          <ColorSwatches value={proj.color} onChange={(color) => onChange({ ...proj, color })} />
        </div>
        <div className="pb-modalfoot">
          <button className="pb-btn" onClick={onClose}>Отмена</button>
          <button className="pb-btn primary" onClick={onCreate}>Создать</button>
        </div>
      </div>
    </>
  );
}
