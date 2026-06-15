import { useRef, useState } from "react";
import { PRIORITIES, platLabel } from "../constants.js";
import { EditableInput } from "./Editable.jsx";
import ColorSwatches from "./ColorSwatches.jsx";

// Доска: колонки = статусы проекта. Карточки перетаскиваются между колонками,
// сами колонки можно добавлять, переименовывать, перекрашивать, удалять и менять
// их порядок (перетаскиванием за шапку).
export default function Board({ tasks, statuses, statusActions, onMoveTask, onOpenTask, onAddTask }) {
  const cardDrag = useRef(null); // id перетаскиваемой задачи
  const colDrag = useRef(null);  // id перетаскиваемой колонки
  const [dragOver, setDragOver] = useState(null);
  const [menuFor, setMenuFor] = useState(null); // у какой колонки открыто меню

  const handleDrop = (statusId) => {
    if (cardDrag.current) {
      onMoveTask(cardDrag.current, statusId);
      cardDrag.current = null;
    } else if (colDrag.current && colDrag.current !== statusId) {
      const arr = [...statuses];
      const from = arr.findIndex((s) => s.id === colDrag.current);
      const to = arr.findIndex((s) => s.id === statusId);
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      statusActions.reorder(arr);
      colDrag.current = null;
    }
    setDragOver(null);
  };

  return (
    <div className="pb-board">
      {statuses.map((s) => {
        const items = tasks.filter((t) => t.status === s.id);
        return (
          <div
            key={s.id}
            className={"pb-col" + (dragOver === s.id ? " over" : "")}
            onDragOver={(e) => { e.preventDefault(); setDragOver(s.id); }}
            onDragLeave={() => setDragOver((d) => (d === s.id ? null : d))}
            onDrop={() => handleDrop(s.id)}
          >
            <div
              className="pb-colhead"
              draggable
              onDragStart={() => { colDrag.current = s.id; cardDrag.current = null; }}
              onDragEnd={() => { colDrag.current = null; setDragOver(null); }}
            >
              <span className="name"><span className="pb-dot" style={{ background: s.color }} /><span className="lbl">{s.label}</span></span>
              <span className="pb-colcount">{items.length}</span>
              <button
                className="pb-colmenu-btn"
                title="Настройки колонки"
                draggable={false}
                onClick={(e) => { e.stopPropagation(); setMenuFor((m) => (m === s.id ? null : s.id)); }}
              >⋯</button>
            </div>

            {menuFor === s.id && (
              <>
                <div className="pb-colmenu-scrim" onClick={() => setMenuFor(null)} />
                <div className="pb-colmenu" onClick={(e) => e.stopPropagation()}>
                  <label className="pb-colmenu-lbl">Название</label>
                  <EditableInput className="pb-input" value={s.label} onCommit={(v) => statusActions.rename(s.id, v)} />
                  <label className="pb-colmenu-lbl">Цвет</label>
                  <ColorSwatches value={s.color} onChange={(c) => statusActions.recolor(s.id, c)} />
                  {statuses.length > 1 && (
                    <button
                      className="pb-colmenu-del"
                      onClick={() => {
                        if (window.confirm(`Удалить колонку «${s.label}»? Её задачи переедут в первую колонку.`)) {
                          statusActions.remove(s.id);
                          setMenuFor(null);
                        }
                      }}
                    >Удалить колонку</button>
                  )}
                </div>
              </>
            )}

            {items.map((t) => (
              <div
                key={t.id}
                className="pb-card"
                draggable
                onDragStart={() => { cardDrag.current = t.id; colDrag.current = null; }}
                onClick={() => onOpenTask(t.id)}
              >
                <h4>{t.title}</h4>
                <div className="pb-cardfoot">
                  <span className={"pb-prio " + t.priority}>{PRIORITIES.find((p) => p.key === t.priority).label}</span>
                  {t.platform !== "both" && <span className={"pb-plat " + t.platform}>{platLabel(t.platform)}</span>}
                  <span style={{ flex: 1 }} />
                  <span className="pb-ver">{t.version}</span>
                  {t.shots.length > 0 && <span className="pb-shot">▦ {t.shots.length}</span>}
                </div>
              </div>
            ))}
            <button className="pb-addtask" onClick={() => onAddTask(s.id)}>+ Добавить</button>
          </div>
        );
      })}
      <button className="pb-addcol" onClick={statusActions.add} title="Добавить колонку">+ колонка</button>
    </div>
  );
}
