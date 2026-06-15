import { useRef, useState } from "react";
import { STATUSES, PRIORITIES, PLATFORMS } from "../constants.js";
import { EditableInput, EditableTextarea } from "./Editable.jsx";

// Боковая панель редактирования задачи: статус, приоритет, платформа, версия,
// описание, доп. инфо и скриншоты. Открывается поверх затемнённого фона.
export default function TaskPanel({ task, onClose, onEdit, onMoveTask, onDelete, onAddShots, onRemoveShot }) {
  const fileRef = useRef(null);
  const [zoom, setZoom] = useState(null); // ссылка на скриншот, открытый на весь экран

  // Отдаём выбранные файлы наверх — загрузку в хранилище берёт на себя хук данных.
  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) onAddShots(files);
    e.target.value = "";
  };

  return (
    <>
      <div className="pb-scrim" onClick={onClose} />
      <div className="pb-panel">
        <button className="x" onClick={onClose}>✕</button>
        <EditableTextarea
          className="pb-titlearea"
          value={task.title}
          rows={2}
          placeholder="Что нужно сделать или что за баг…"
          onCommit={(v) => onEdit({ title: v })}
        />
        <div className="pb-field">
          <label>Статус</label>
          <div className="pb-seg">
            {STATUSES.map((s) => (
              <button key={s.key} className={(task.status === s.key ? "on s-" + s.key : "")} onClick={() => onMoveTask(s.key)}>{s.label}</button>
            ))}
          </div>
        </div>
        <div className="pb-field">
          <label>Приоритет</label>
          <div className="pb-seg">
            {PRIORITIES.map((p) => (
              <button key={p.key} className={(task.priority === p.key ? "on p-" + p.key : "")} onClick={() => onEdit({ priority: p.key })}>{p.label}</button>
            ))}
          </div>
        </div>
        <div className="pb-field">
          <label>Платформа</label>
          <div className="pb-seg">
            {PLATFORMS.map((p) => (
              <button key={p.key} className={(task.platform === p.key ? "on f-" + p.key : "")} onClick={() => onEdit({ platform: p.key })}>{p.label}</button>
            ))}
          </div>
        </div>
        <div className="pb-field">
          <label>Версия (билд)</label>
          <EditableInput className="pb-input mono" value={task.version} placeholder="v0.4" onCommit={(v) => onEdit({ version: v })} />
        </div>
        <div className="pb-field">
          <label>Доп. условия / инфо</label>
          <EditableTextarea className="pb-area" rows={2} value={task.notes} placeholder="Устройство, шаги воспроизведения…" onCommit={(v) => onEdit({ notes: v })} />
        </div>
        <div className="pb-field">
          <label>Скриншоты ({task.shots.length})</label>
          <div className="pb-shots">
            {task.shots.map((s) => (
              <div key={s.id} className="pb-shotthumb">
                <img src={s.url} alt={s.name} title="Открыть в полном размере" onClick={() => setZoom(s.url)} />
                <button onClick={() => onRemoveShot(s.id)}>✕</button>
              </div>
            ))}
            <div className="pb-shotadd" onClick={() => fileRef.current?.click()}>+ Добавить скриншот</div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleFiles} />
        </div>
        <button className="pb-paneldelete" onClick={onDelete}>Удалить задачу</button>
      </div>

      {/* Просмотр скриншота на весь экран. Клик по фону или картинке — закрыть. */}
      {zoom && (
        <div className="pb-lightbox" onClick={() => setZoom(null)}>
          <img src={zoom} alt="Скриншот" />
        </div>
      )}
    </>
  );
}
