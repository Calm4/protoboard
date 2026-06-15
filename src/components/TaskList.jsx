import { useRef, useState } from "react";
import { PRIORITIES, platLabel, PRIO_UI } from "../constants.js";
import { hexToRgba } from "../lib/color.js";

// Табличный вид: задачи сгруппированы по статусам проекта. Показываем ВСЕ статусы,
// даже пустые (чтобы видеть полный список колонок). Статус/приоритет меняются прямо
// в строке, задачу можно перетащить в другую секцию.
export default function TaskList({ tasks, statuses, onMoveTask, onSetPriority, onOpenTask }) {
  const dragId = useRef(null);
  const [dragOver, setDragOver] = useState(null);

  const onDrop = (status) => {
    if (dragId.current) onMoveTask(dragId.current, status);
    dragId.current = null;
    setDragOver(null);
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

      {statuses.map((s) => {
        const items = tasks.filter((t) => t.status === s.id);
        return (
          <div
            key={s.id}
            className={"pb-listgroup" + (dragOver === s.id ? " over" : "")}
            onDragOver={(e) => { e.preventDefault(); setDragOver(s.id); }}
            onDragLeave={() => setDragOver((d) => (d === s.id ? null : d))}
            onDrop={() => onDrop(s.id)}
          >
            <div className="pb-row group">
              <span className="gdot" style={{ background: s.color }} />
              <span className="gname">{s.label}</span>
              <span className="gcount">{items.length}</span>
            </div>
            {items.map((t) => {
              const st = statuses.find((x) => x.id === t.status);
              return (
                <div
                  key={t.id}
                  className="pb-row"
                  draggable
                  onDragStart={() => { dragId.current = t.id; }}
                  onDragEnd={() => { dragId.current = null; setDragOver(null); }}
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
                      style={st ? { color: st.color, background: hexToRgba(st.color, 0.12), borderColor: hexToRgba(st.color, 0.4) } : undefined}
                      value={t.status}
                      onChange={(e) => onMoveTask(t.id, e.target.value)}
                    >
                      {statuses.map((st2) => <option key={st2.id} value={st2.id}>{st2.label}</option>)}
                    </select>
                  </span>
                </div>
              );
            })}
            {items.length === 0 && <div className="pb-listempty">Пусто</div>}
          </div>
        );
      })}
    </div>
  );
}
