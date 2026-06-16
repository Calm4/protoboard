import { useRef, useState } from "react";
import { PRIORITIES, PLATFORMS, PRIO_UI, PLAT_UI } from "../constants.js";
import { hexToRgba } from "../lib/color.js";
import StatusMenu from "./StatusMenu.jsx";

// Табличный вид. По умолчанию задачи сгруппированы по статусам, но клик по заголовку
// колонки (Платформа / Версия / Приоритет / Статус) перегруппировывает список по этому
// полю; повторный клик по той же колонке меняет порядок групп (▲/▼).
// Перетаскивание задач работает только в группировке по статусу (там это перенос между
// колонками); в остальных группировках строки не таскаются — это режим просмотра.
export default function TaskList({ tasks, statuses, statusActions, onMoveTask, onReorderTask, onSetPriority, onSetPlatform, onOpenTask }) {
  const dragId = useRef(null);
  const [dragOver, setDragOver] = useState(null);
  const [dropRow, setDropRow] = useState(null);
  const [menuFor, setMenuFor] = useState(null);
  const [groupBy, setGroupBy] = useState("status"); // status | priority | platform | version
  const [dir, setDir] = useState("asc");             // порядок групп: asc | desc

  const byStatus = groupBy === "status";

  const endDrag = () => { dragId.current = null; setDragOver(null); setDropRow(null); };
  const dropOnGroup = (status) => { if (dragId.current) onReorderTask(dragId.current, status, null); endDrag(); };
  const dropOnRow = (t) => { if (dragId.current && dragId.current !== t.id) onReorderTask(dragId.current, t.status, t.id); endDrag(); };

  // Клик по заголовку колонки: новая колонка — группируем по ней; та же — меняем порядок.
  const clickHeader = (field) => {
    if (groupBy === field) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setGroupBy(field); setDir("asc"); }
  };

  // Собираем группы по выбранному полю. Каждая: { key, label, color?, status?, items }.
  const buildGroups = () => {
    let groups;
    if (groupBy === "priority") {
      groups = PRIORITIES.map((p) => ({ key: p.key, label: p.label, items: tasks.filter((t) => t.priority === p.key) }));
    } else if (groupBy === "platform") {
      groups = PLATFORMS.map((p) => ({ key: p.key, label: p.label, items: tasks.filter((t) => t.platform === p.key) }));
    } else if (groupBy === "version") {
      const versions = [...new Set(tasks.map((t) => t.version).filter(Boolean))].sort();
      groups = versions.map((v) => ({ key: v, label: v, items: tasks.filter((t) => t.version === v) }));
      const blank = tasks.filter((t) => !t.version);
      if (blank.length) groups.push({ key: "__none__", label: "(без версии)", items: blank });
    } else {
      groups = statuses.map((s) => ({ key: s.id, label: s.label, color: s.color, status: s, items: tasks.filter((t) => t.status === s.id) }));
    }
    groups.forEach((g) => g.items.sort((a, b) => a.order - b.order));
    if (dir === "desc") groups = [...groups].reverse();
    return groups;
  };
  const groups = buildGroups();

  // Кликабельный заголовок колонки со стрелкой направления.
  const hdr = (field, label, cls) => (
    <span
      className={(cls ? cls + " " : "") + "pb-sortable" + (groupBy === field ? " active" : "")}
      title="Сгруппировать по этой колонке"
      onClick={() => clickHeader(field)}
    >
      {label}{groupBy === field ? (dir === "asc" ? " ▲" : " ▼") : ""}
    </span>
  );

  return (
    <div className="pb-list">
      <div className="pb-row header">
        <span>Задача</span>
        {hdr("platform", "Платформа", "col-plat")}
        {hdr("version", "Версия", "col-ver")}
        {hdr("priority", "Приоритет", "col-prio")}
        {hdr("status", "Статус")}
      </div>

      {groups.map((g) => (
        <div
          key={g.key}
          className={"pb-listgroup" + (byStatus && dragOver === g.key ? " over" : "")}
          onDragOver={byStatus ? (e) => { e.preventDefault(); setDragOver(g.key); } : undefined}
          onDragLeave={byStatus ? () => setDragOver((d) => (d === g.key ? null : d)) : undefined}
          onDrop={byStatus ? () => dropOnGroup(g.key) : undefined}
        >
          <div className="pb-row group">
            <span className="gdot" style={{ background: g.color || "var(--line)" }} />
            <span className="gname">{g.label}</span>
            <span className="gcount">{g.items.length}</span>
            {byStatus && (
              <button className="pb-colmenu-btn" title="Настройки статуса" onClick={() => setMenuFor((m) => (m === g.key ? null : g.key))}>⋯</button>
            )}
          </div>

          {byStatus && menuFor === g.key && (
            <StatusMenu status={g.status} canDelete={statuses.length > 1} statusActions={statusActions} onClose={() => setMenuFor(null)} className="inlist" />
          )}

          {g.items.map((t) => {
            const st = statuses.find((x) => x.id === t.status);
            return (
              <div
                key={t.id}
                className={"pb-row" + (dropRow === t.id ? " dropbefore" : "")}
                style={{ "--tint": st ? hexToRgba(st.color, 0.1) : "transparent" }}
                draggable={byStatus}
                onDragStart={byStatus ? () => { dragId.current = t.id; } : undefined}
                onDragEnd={byStatus ? endDrag : undefined}
                onDragOver={byStatus ? (e) => { if (!dragId.current) return; e.preventDefault(); e.stopPropagation(); setDragOver(t.status); if (dropRow !== t.id) setDropRow(t.id); } : undefined}
                onDrop={byStatus ? (e) => { e.stopPropagation(); dropOnRow(t); } : undefined}
                onClick={() => onOpenTask(t.id)}
              >
                <div className="pb-rowtitle">
                  {t.num != null && <span className="pb-num">#{t.num}</span>}
                  <b>{t.title}</b>
                </div>
                <span className="col-plat" onClick={(e) => e.stopPropagation()}>
                  <select
                    className="pb-select"
                    style={{ color: PLAT_UI[t.platform].fg, background: PLAT_UI[t.platform].bg, borderColor: PLAT_UI[t.platform].bd }}
                    value={t.platform}
                    onChange={(e) => onSetPlatform(t.id, e.target.value)}
                  >
                    {PLATFORMS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
                  </select>
                </span>
                <span className="col-ver">{t.version && <span className="pb-verchip">{t.version}</span>}</span>
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
          {g.items.length === 0 && <div className="pb-listempty">Пусто</div>}
        </div>
      ))}

      {byStatus && <button className="pb-addstatus" onClick={statusActions.add}>+ статус</button>}
    </div>
  );
}
