import { useState } from "react";
import { useT } from "../lib/i18n.js";

// Модальное окно удаления проекта: требует ввести слово DELETE для подтверждения.
export default function DeleteProjectModal({ projectName, onConfirm, onClose }) {
  const t = useT();
  const [word, setWord] = useState("");
  const ok = word.trim().toUpperCase() === "DELETE";
  return (
    <>
      <div className="pb-scrim" onClick={onClose} />
      <div className="pb-modal">
        <button className="x" onClick={onClose}>✕</button>
        <h2 className="pb-modal-title">{t("Удалить проект?")}</h2>
        <p className="pb-modal-desc">
          <b>«{projectName}»</b> {t("и все его задачи, скриншоты и история будут удалены безвозвратно.")}
        </p>
        <p className="pb-modal-hint">
          {t("Введи ")}<b>DELETE</b>{t(" для подтверждения:")}
        </p>
        <input
          className="pb-input"
          autoFocus
          placeholder="DELETE"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && ok) onConfirm(); }}
        />
        <div className="pb-modal-foot">
          <button className="pb-btn ghost" onClick={onClose}>{t("Отмена")}</button>
          <button className="pb-btn danger" disabled={!ok} onClick={onConfirm}>
            {t("Удалить навсегда")}
          </button>
        </div>
      </div>
    </>
  );
}
