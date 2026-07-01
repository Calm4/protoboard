import { useRef, useState } from "react";
import { PRIORITIES, PLATFORMS } from "../constants.js";
import { EditableInput, EditableTextarea } from "./Editable.jsx";
import AssigneePicker from "./AssigneePicker.jsx";
import { downloadImage } from "../lib/image.js";
import { useT } from "../lib/i18n.js";

export default function TaskPanel({
  task, statuses, onClose, onEdit, onMoveTask, onDelete, onAddShots, onRemoveShot,
  onAddTag, onRemoveTag, availableTags = [], projectMembers = [], users = [], onToggleClosed,
}) {
  const t = useT();
  const fileRef = useRef(null);
  const [zoom, setZoom] = useState(null);
  const [copied, setCopied] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tagOpen, setTagOpen] = useState(false);
  const [actOpen, setActOpen] = useState(false);

  const copyLink = () => {
    const url = window.location.origin + window.location.pathname + "#task=" + task.id;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600); });
    } else {
      window.prompt(t("Скопируй ссылку:"), url);
    }
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) onAddShots(files);
    e.target.value = "";
  };

  const existingTags = task.tags || [];
  const filteredTags = availableTags.filter(
    (tag) => !existingTags.includes(tag) && (!tagInput.trim() || tag.toLowerCase().includes(tagInput.trim().toLowerCase()))
  );
  const canCreateNew = tagInput.trim() && !availableTags.includes(tagInput.trim()) && !existingTags.includes(tagInput.trim());

  const commitTag = (tag) => {
    onAddTag(tag);
    setTagInput("");
    setTagOpen(false);
  };

  return (
    <>
      <div className="pb-scrim" onClick={onClose} />
      <div className="pb-panel">
        <button className="x" onClick={onClose}>✕</button>
        <div className="pb-taskid">
          {task.num != null && <span className="pb-num">#{task.num}</span>}
          <button className="pb-copylink" onClick={copyLink} title={t("Ссылка на этот баг")}>
            {copied ? t("Ссылка скопирована ✓") : t("🔗 Скопировать ссылку")}
          </button>
          {onToggleClosed && (
            <button
              className={"pb-taskdone-btn" + (task.closed ? " done" : "")}
              onClick={() => onToggleClosed(task.id)}
              title={task.closed ? t("Открыть задачу") : t("Отметить выполненной")}
            >
              <span className={"pb-closebtn" + (task.closed ? " done" : "")} />
              {task.closed ? t("Выполнено") : t("Отметить выполненной")}
            </button>
          )}
        </div>
        <EditableTextarea
          className="pb-titlearea"
          value={task.title}
          rows={2}
          autoGrow
          placeholder={t("Что нужно сделать или что за баг…")}
          onCommit={(v) => onEdit({ title: v })}
        />

        {/* Свойства задачи — компактные строки label/значение, как в Asana */}
        <div className="pb-fields">
          <div className="pb-fieldrow">
            <span className="pb-fieldrow-lbl">{t("Статус")}</span>
            <div className="pb-fieldrow-val">
              <div className="pb-seg compact">
                {statuses.map((s) => (
                  <button
                    key={s.id}
                    className={task.status === s.id ? "on" : ""}
                    style={task.status === s.id ? { background: s.color, borderColor: s.color, color: "#fff" } : undefined}
                    onClick={() => onMoveTask(s.id)}
                  >{s.label}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="pb-fieldrow">
            <span className="pb-fieldrow-lbl">{t("Приоритет")}</span>
            <div className="pb-fieldrow-val">
              <div className="pb-seg compact">
                {PRIORITIES.map((p) => (
                  <button key={p.key} className={(task.priority === p.key ? "on p-" + p.key : "")} onClick={() => onEdit({ priority: p.key })}>{t(p.label)}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="pb-fieldrow">
            <span className="pb-fieldrow-lbl">{t("Платформа")}</span>
            <div className="pb-fieldrow-val">
              <div className="pb-seg compact">
                {PLATFORMS.map((p) => (
                  <button key={p.key} className={(task.platform === p.key ? "on f-" + p.key : "")} onClick={() => onEdit({ platform: p.key })}>{t(p.label)}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="pb-fieldrow">
            <span className="pb-fieldrow-lbl">{t("Версия")}</span>
            <div className="pb-fieldrow-val">
              <EditableInput className="pb-input mono" value={task.version} placeholder="v0.4" onCommit={(v) => onEdit({ version: v })} />
            </div>
          </div>

          <div className="pb-fieldrow">
            <span className="pb-fieldrow-lbl">{t("Исполнитель")}</span>
            <div className="pb-fieldrow-val">
              <AssigneePicker
                value={task.assignee || ""}
                projectMembers={projectMembers}
                users={users}
                onChange={(uid) => onEdit({ assignee: uid })}
              />
            </div>
          </div>

          <div className="pb-fieldrow">
            <span className="pb-fieldrow-lbl">{t("Дедлайн")}</span>
            <div className="pb-fieldrow-val">
              <input
                type="date"
                className={"pb-select" + (task.dueDate && new Date(task.dueDate) < new Date() ? " overdue-input" : "")}
                value={task.dueDate || ""}
                onChange={(e) => onEdit({ dueDate: e.target.value })}
              />
            </div>
          </div>

          <div className="pb-fieldrow">
            <span className="pb-fieldrow-lbl">{t("Теги")}</span>
            <div className="pb-fieldrow-val">
              <div className="pb-tagrow">
                {existingTags.map((tag) => (
                  <span key={tag} className="pb-tag">
                    {tag}
                    <button className="pb-tag-x" onClick={() => onRemoveTag(tag)}>✕</button>
                  </span>
                ))}
                <div className="pb-taginput-wrap">
                  <input
                    className="pb-taginput"
                    placeholder={t("+ Добавить тег")}
                    value={tagInput}
                    onFocus={() => setTagOpen(true)}
                    onChange={(e) => { setTagInput(e.target.value); setTagOpen(true); }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && tagInput.trim()) commitTag(tagInput.trim());
                      if (e.key === "Escape") { setTagInput(""); setTagOpen(false); }
                    }}
                  />
                  {tagOpen && (filteredTags.length > 0 || canCreateNew) && (
                    <div className="pb-tagdrop">
                      {filteredTags.map((tag) => (
                        <button key={tag} className="pb-tagopt" onMouseDown={() => commitTag(tag)}>{tag}</button>
                      ))}
                      {canCreateNew && (
                        <button className="pb-tagopt new" onMouseDown={() => commitTag(tagInput.trim())}>
                          {t("+ Создать «")}{tagInput.trim()}»
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {tagOpen && <div className="pb-tagscrim" onMouseDown={() => { setTagOpen(false); setTagInput(""); }} />}
              </div>
            </div>
          </div>
        </div>

        {/* Доп. информация — отдельная секция, визуально отделена от таблицы свойств */}
        <div className="pb-field pb-panel-section">
          <label>{t("Доп. условия / инфо")}</label>
          <EditableTextarea className="pb-area" rows={2} value={task.notes} autoGrow placeholder={t("Устройство, шаги воспроизведения…")} onCommit={(v) => onEdit({ notes: v })} />
        </div>

        <div className="pb-field pb-panel-section">
          <label>{t("Скриншоты")} {task.shotsLoaded ? `(${task.shots.length})` : ""}</label>
          <div className="pb-shots">
            {!task.shotsLoaded ? (
              <div style={{ color: "var(--c-muted)", fontSize: 13, padding: "6px 0" }}>{t("Загрузка…")}</div>
            ) : (
              <>
                {task.shots.map((s) => (
                  <div key={s.id} className={"pb-shotthumb" + (s.uploading ? " uploading" : "")}>
                    <img src={s.url} alt={s.name} title={s.uploading ? t("Загрузка…") : t("Открыть в полном размере")} onClick={() => !s.uploading && setZoom(s)} />
                    {s.uploading
                      ? <span className="pb-shotspinner">⟳</span>
                      : <button onClick={() => onRemoveShot(s.id)}>✕</button>}
                  </div>
                ))}
              </>
            )}
            <div className="pb-shotadd" onClick={() => fileRef.current?.click()}>{t("+ Добавить скриншот")}</div>
          </div>
          {task.uploadError && (
            <div style={{ color: "#B23636", fontSize: 12, marginTop: 4 }}>
              {t("Не удалось загрузить — попробуй ещё раз или выбери файл меньшего размера.")}
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleFiles} />
        </div>

        {/* История изменений */}
        <div className="pb-field pb-panel-section">
          <button
            className="pb-act-toggle"
            onClick={() => setActOpen((o) => !o)}
          >
            {actOpen ? "▲" : "▼"} {t("История изменений")}
            {(task.activity || []).length > 0 && <span className="pb-act-cnt">{task.activity.length}</span>}
          </button>
          {actOpen && (
            <div className="pb-activity">
              {!task.activityLoaded ? (
                <div className="pb-act-row muted">{t("Загрузка…")}</div>
              ) : (task.activity || []).length === 0 ? (
                <div className="pb-act-row muted">{t("Нет записей")}</div>
              ) : (task.activity || []).map((e) => (
                <div key={e.id} className="pb-act-row">
                  <span className="pb-act-action">
                    {e.action}
                    {e.authorName && <span className="pb-act-author"> — {e.authorName}</span>}
                  </span>
                  <span className="pb-act-time">{relTime(e.timestamp, t)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button className="pb-paneldelete" onClick={onDelete}>{t("Удалить задачу")}</button>
      </div>

      {zoom && (
        <div className="pb-lightbox" onClick={() => setZoom(null)}>
          <button
            className="dl"
            title={t("Скачать на компьютер")}
            onClick={(e) => { e.stopPropagation(); downloadImage(zoom.url, zoom.name); }}
          >{t("↓ Скачать")}</button>
          <img src={zoom.url} alt={zoom.name} />
        </div>
      )}
    </>
  );
}

function relTime(ts, t) {
  if (!ts) return "";
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return t("только что");
  if (m < 60) return `${m}${t(" мин. назад")}`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}${t(" ч. назад")}`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}${t(" д. назад")}`;
  return new Date(ts).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}
