import { EditableInput } from "./Editable.jsx";
import ColorSwatches from "./ColorSwatches.jsx";

// Меню статуса (колонки): переименовать, сменить цвет, удалить.
// Используется и на доске, и в списке. className — для подстройки позиции.
export default function StatusMenu({ status, canDelete, statusActions, onClose, className = "" }) {
  return (
    <>
      <div className="pb-colmenu-scrim" onClick={onClose} />
      <div className={"pb-colmenu " + className} onClick={(e) => e.stopPropagation()}>
        <label className="pb-colmenu-lbl">Название</label>
        <EditableInput className="pb-input" value={status.label} onCommit={(v) => statusActions.rename(status.id, v)} />
        <label className="pb-colmenu-lbl">Цвет</label>
        <ColorSwatches value={status.color} onChange={(c) => statusActions.recolor(status.id, c)} />
        {canDelete && (
          <button
            className="pb-colmenu-del"
            onClick={() => {
              if (window.confirm(`Удалить статус «${status.label}»? Его задачи переедут в первую колонку.`)) {
                statusActions.remove(status.id);
                onClose();
              }
            }}
          >Удалить статус</button>
        )}
      </div>
    </>
  );
}
