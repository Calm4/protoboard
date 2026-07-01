import { EditableInput } from "./Editable.jsx";
import ColorSwatches from "./ColorSwatches.jsx";
import { useT } from "../lib/i18n.js";

// Меню статуса (колонки): переименовать, сменить цвет, удалить.
// Используется и на доске, и в списке. className — для подстройки позиции.
export default function StatusMenu({ status, canDelete, statusActions, onClose, className = "" }) {
  const t = useT();
  return (
    <>
      <div className="pb-colmenu-scrim" onClick={onClose} />
      <div className={"pb-colmenu " + className} onClick={(e) => e.stopPropagation()}>
        <label className="pb-colmenu-lbl">{t("Название")}</label>
        <EditableInput className="pb-input" value={status.label} onCommit={(v) => statusActions.rename(status.id, v)} />
        <label className="pb-colmenu-lbl">{t("Цвет")}</label>
        <ColorSwatches value={status.color} onChange={(c) => statusActions.recolor(status.id, c)} />
        {canDelete && (
          <button
            className="pb-colmenu-del"
            onClick={() => {
              if (window.confirm(t("Удалить статус «{label}»? Его задачи переедут в первую колонку.").replace("{label}", status.label))) {
                statusActions.remove(status.id);
                onClose();
              }
            }}
          >{t("Удалить статус")}</button>
        )}
      </div>
    </>
  );
}
