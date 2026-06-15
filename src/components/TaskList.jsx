import { STATUSES, PRIORITIES, platLabel } from "../constants.js";

// Табличный вид тех же задач: строка на задачу, статус меняется выпадающим списком.
export default function TaskList({ tasks, onMoveTask, onOpenTask }) {
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
      {tasks.map((t) => (
        <div key={t.id} className="pb-row" onClick={() => onOpenTask(t.id)}>
          <div className="pb-rowtitle">
            <b>{t.title}</b>
            {t.desc && <span className="sub">{t.desc}</span>}
          </div>
          <span className="col-plat">{t.platform === "both" ? <span style={{ color: "var(--soft)", fontSize: 12.5 }}>Общая</span> : <span className={"pb-plat " + t.platform}>{platLabel(t.platform)}</span>}</span>
          <span className="col-ver pb-ver">{t.version}</span>
          <span className="col-prio"><span className={"pb-prio " + t.priority}>{PRIORITIES.find((p) => p.key === t.priority).label}</span></span>
          <span onClick={(e) => e.stopPropagation()}>
            <select className="pb-select" value={t.status} onChange={(e) => onMoveTask(t.id, e.target.value)}>
              {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </span>
        </div>
      ))}
    </div>
  );
}
