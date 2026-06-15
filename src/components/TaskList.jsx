import { Fragment } from "react";
import { STATUSES, PRIORITIES, platLabel, statusColor, PRIO_UI, STATUS_UI } from "../constants.js";

// Табличный вид: задачи сгруппированы по статусу (To Do / Ready to Check / Done).
// Статус и приоритет можно менять прямо в строке, не открывая задачу.
export default function TaskList({ tasks, onMoveTask, onSetPriority, onOpenTask }) {
  return (
    <div className="pb-list">
      <div className="pb-row header">
        <span>Задача</span>
        <span className="col-plat">Платформа</span>
        <span className="col-ver">Версия</span>
        <span className="col-prio">Приоритет</span>
        <span>Статус</span>
      </div>

      {tasks.length === 0 && <div className="pb-empty">Нет задач под этот фильтр.</div>}

      {STATUSES.map((s) => {
        const items = tasks.filter((t) => t.status === s.key);
        if (items.length === 0) return null;
        return (
          <Fragment key={s.key}>
            <div className="pb-row group">
              <span className="gdot" style={{ background: statusColor[s.key] }} />
              <span className="gname">{s.label}</span>
              <span className="gcount">{items.length}</span>
            </div>
            {items.map((t) => (
              <div key={t.id} className="pb-row" onClick={() => onOpenTask(t.id)}>
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
          </Fragment>
        );
      })}
    </div>
  );
}
