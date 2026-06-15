import { useRef, useState } from "react";
import { STATUSES, PRIORITIES, platLabel, statusColor } from "../constants.js";

// Доска: три колонки (To Do / Ready to Check / Done) с перетаскиванием карточек.
// Состояние перетаскивания локальное — нужно только здесь.
export default function Board({ tasks, onMoveTask, onOpenTask, onAddTask }) {
  const dragId = useRef(null);
  const [dragOver, setDragOver] = useState(null);

  const onDrop = (status) => {
    if (dragId.current) onMoveTask(dragId.current, status);
    dragId.current = null;
    setDragOver(null);
  };

  return (
    <div className="pb-board">
      {STATUSES.map((s) => {
        const items = tasks.filter((t) => t.status === s.key);
        return (
          <div
            key={s.key}
            className={"pb-col" + (dragOver === s.key ? " over" : "")}
            onDragOver={(e) => { e.preventDefault(); setDragOver(s.key); }}
            onDragLeave={() => setDragOver((d) => (d === s.key ? null : d))}
            onDrop={() => onDrop(s.key)}
          >
            <div className="pb-colhead">
              <span className="name"><span className="pb-dot" style={{ background: statusColor[s.key] }} />{s.label}</span>
              <span className="pb-colcount">{items.length}</span>
            </div>
            {items.map((t) => (
              <div
                key={t.id}
                className="pb-card"
                draggable
                onDragStart={() => { dragId.current = t.id; }}
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
            <button className="pb-addtask" onClick={() => onAddTask(s.key)}>+ Добавить</button>
          </div>
        );
      })}
    </div>
  );
}
