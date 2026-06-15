// Модальное окно создания проекта. Локально держит вводимое название;
// «Создать» (или Enter) отдаёт его наверх, «Отмена» / клик по фону — закрывает.
export default function NewProjectModal({ name, onChange, onCreate, onClose }) {
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
            value={name}
            placeholder="Напр. Neon Dash"
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onCreate()}
          />
        </div>
        <div className="pb-modalfoot">
          <button className="pb-btn" onClick={onClose}>Отмена</button>
          <button className="pb-btn primary" onClick={onCreate}>Создать</button>
        </div>
      </div>
    </>
  );
}
