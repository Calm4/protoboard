import { useRef, useState } from "react";
import { STATUSES, PRIORITIES, platLabel, statusColor, PRIO_UI, STATUS_UI } from "../constants.js";

// Табличный вид: задачи сгруппированы по статусу. Статус/приоритет меняются прямо
// в строке, а ещё задачу можно перетащить мышью в другую секцию (как на доске).
export default function TaskList({ tasks, onMoveTask, onSetPriority, onOpenTask }) {
  const dragId = useRef(null);
  const [dragging, setDragging] = useState(false); // тянем ли сейчас задачу
  const [dragOver, setDragOver] = useState(null);   // над какой секцией

  const startDrag = (id) => { dragId.current = id; setDragging(true); };
  const endDrag = () => { dragId.current = null; setDragging(false); setDragOver(null); };
  const onDrop = (status) => {
    if (dragId.current) onMoveTask(dragId.current, status);
    endDrag();
  };

  return (
    <div className="pb-list">
      <div className="pb-row header">
        <span>Задача</span>
        <span className="col-plat">Платформа</span>
        <span className="col-ver">Версия</span>
        <span className="col-prio">Приоритет</span>
        <span>Статус</span>
      </div>

      {tasks.length === 0 && !dragging && <div className="pb-empty">Нет задач под этот фильтр.</div>}

      {STATUSES.map((s) => {
        const items = tasks.filter((t) => t.status === s.key);
        // Пустые секции прячем, но во время перетаскивания показываем — чтобы было куда бросить.
        if (items.length === 0 && !dragging) return null;
        return (
          <div
            key={s.key}
            className={"pb-listgroup" + (dragOver === s.key ? " over" : "")}
            onDragOver={(e) => { e.preventDefault(); setDragOver(s.key); }}
            onDragLeave={() => setDragOver((d) => (d === s.key ? null : d))}
            onDrop={() => onDrop(s.key)}
          >
            <div className="pb-row group">
              <span className="gdot" style={{ background: statusColor[s.key] }} />
              <span className="gname">{s.label}</span>
              <span className="gcount">{items.length}</span>
            </div>
            {items.map((t) => (
              <div
                key={t.id}
                className="pb-row"
                draggable
                onDragStart={() => startDrag(t.id)}
                onDragEnd={endDrag}
                onClick={() => onOpenTask(t.id)}
              >
                <div className="pb-rowtitle">
                  <b>{t.title}</b>
                </div>
                <span className="col-plat">{t.platform === "both" ? <span style={{ color: "var(--soft)", fontSize: 12.5 }}>Общая</span> : <span className={"pb-plat " + t.platform}>{platLabel(t.platform)}</span>}</span>
                <span className="col-ver pb-ver">{t.version}</span>
                <span className="col-prio" onClick={(e) => e.stopPropagation()}>
                  <select
                    className="pb-select"
                    style={{ color: PRIO_UI[t.priority].fg, background: PRIO_UI[t.priority].bg, borderColor: PRIO_UI[t.priority].bd }}
                    value={t.priority}
                    onChange={(e) => onSetPriority(t.id, e.target.value)}
                  >
                    {PRIORITIES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
                  </select>
                </span>
                <span onClick={(e) => e.stopPropagation()}>
                  <select
                    className="pb-select"
                    style={{ color: STATUS_UI[t.status].fg, background: STATUS_UI[t.status].bg, borderColor: STATUS_UI[t.status].bd }}
                    value={t.status}
                    onChange={(e) => onMoveTask(t.id, e.target.value)}
                  >
                    {STATUSES.map((st) => <option key={st.key} value={st.key}>{st.label}</option>)}
                  </select>
                </span>
              </div>
            ))}
            {items.length === 0 && dragging && <div className="pb-dropzone">Перетащи сюда</div>}
          </div>
        );
      })}
    </div>
  );
}
