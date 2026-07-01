import { useState } from "react";
import { EditableInput } from "./Editable.jsx";
import ColorSwatches from "./ColorSwatches.jsx";
import { GRADIENTS, GLOBAL_TAGS } from "../constants.js";
import { useT } from "../lib/i18n.js";

// Все настройки проекта в одном месте: название, фон, статусы, теги, участники.
// Название — осознанно с явной кнопкой «Сохранить», а не авто-коммит по blur.
export default function ProjectSettingsModal({
  project, onSetName, onSetColor, onSetGradient, statusActions,
  onAddProjectTag, onRemoveProjectTag, onOpenMembers, onClose,
}) {
  const t = useT();
  const [name, setNameDraft] = useState(project.name);
  const [tagInput, setTagInput] = useState("");
  const [colorForStatus, setColorForStatus] = useState(null);

  const nameChanged = name.trim() && name.trim() !== project.name;
  const saveName = () => { if (nameChanged) onSetName(name.trim()); };

  const moveStatus = (idx, dir) => {
    const arr = [...project.statuses];
    const j = idx + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[idx], arr[j]] = [arr[j], arr[idx]];
    statusActions.reorder(arr);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t) onAddProjectTag(t);
    setTagInput("");
  };

  return (
    <>
      <div className="pb-scrim" onClick={onClose} />
      <div className="pb-modal pb-settings-modal">
        <button className="x" onClick={onClose}>✕</button>
        <h3>{t("Настройки проекта")}</h3>

        <div className="pb-field">
          <label>{t("Название")}</label>
          <div className="pb-settingsrow">
            <input className="pb-input" value={name} onChange={(e) => setNameDraft(e.target.value)} />
            <button className="pb-btn sm" disabled={!nameChanged} onClick={saveName}>{t("Сохранить")}</button>
          </div>
        </div>

        <div className="pb-field">
          <label>{t("Акцентный цвет")}</label>
          <ColorSwatches value={project.color} onChange={onSetColor} />
        </div>

        <div className="pb-field">
          <label>{t("Градиент фона")}</label>
          <div className="pb-chips wrap">
            {GRADIENTS.map((g) => (
              <button
                key={g.value}
                type="button"
                className={"pb-gradswatch" + (project.gradient === g.value ? " on" : "")}
                title={g.label}
                style={g.value ? { background: g.value } : undefined}
                onClick={() => onSetGradient(g.value)}
              >
                {!g.value && "✕"}
              </button>
            ))}
          </div>
        </div>

        <div className="pb-field">
          <label>{t("Статусы")}</label>
          <div className="pb-settingslist">
            {project.statuses.map((s, i) => (
              <div key={s.id} className="pb-statusrow">
                <div className="pb-colorwrap">
                  <button type="button" className="pb-colordot" style={{ background: s.color }}
                    onClick={() => setColorForStatus(colorForStatus === s.id ? null : s.id)} />
                  {colorForStatus === s.id && (
                    <>
                      <div className="pb-colorscrim" onClick={() => setColorForStatus(null)} />
                      <div className="pb-colorpop">
                        <ColorSwatches value={s.color} onChange={(c) => { statusActions.recolor(s.id, c); setColorForStatus(null); }} />
                      </div>
                    </>
                  )}
                </div>
                <EditableInput className="pb-input sm" value={s.label} onCommit={(v) => statusActions.rename(s.id, v)} />
                <button className="pb-iconbtn" disabled={i === 0} onClick={() => moveStatus(i, -1)} title={t("Выше")}>▲</button>
                <button className="pb-iconbtn" disabled={i === project.statuses.length - 1} onClick={() => moveStatus(i, 1)} title={t("Ниже")}>▼</button>
                {project.statuses.length > 1 && (
                  <button className="pb-iconbtn danger" onClick={() => statusActions.remove(s.id)} title={t("Удалить")}>✕</button>
                )}
              </div>
            ))}
          </div>
          <button className="pb-btn ghost sm" style={{ marginTop: 8 }} onClick={statusActions.add}>{t("+ Добавить статус")}</button>
        </div>

        <div className="pb-field">
          <label>{t("Теги проекта")}</label>
          <div className="pb-tagrow">
            {GLOBAL_TAGS.filter((tag) => !(project.hiddenTags || []).includes(tag)).map((tag) => (
              <span key={tag} className="pb-tag">
                {tag}
                <button className="pb-tag-x" onClick={() => onRemoveProjectTag(tag)}>✕</button>
              </span>
            ))}
            {(project.customTags || []).map((tag) => (
              <span key={tag} className="pb-tag">
                {tag}
                <button className="pb-tag-x" onClick={() => onRemoveProjectTag(tag)}>✕</button>
              </span>
            ))}
            {GLOBAL_TAGS.length === (project.hiddenTags || []).length && (project.customTags || []).length === 0 && (
              <span className="pb-act-row muted">{t("Тегов не осталось")}</span>
            )}
          </div>
          <div className="pb-settingsrow" style={{ marginTop: 8 }}>
            <input
              className="pb-input"
              placeholder={t("Новый тег…")}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addTag(); }}
            />
            <button className="pb-btn sm" disabled={!tagInput.trim()} onClick={addTag}>{t("Добавить")}</button>
          </div>
        </div>

        <div className="pb-modal-foot">
          <button className="pb-btn ghost" onClick={onOpenMembers}>
            👥 {t("Участники")} ({(project.members || []).length})
          </button>
        </div>
      </div>
    </>
  );
}
