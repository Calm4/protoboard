import { useRef, useState } from "react";
import { PRIORITIES, PLATFORMS, PRIO_UI, PLAT_UI } from "../constants.js";
import { hexToRgba } from "../lib/color.js";
import { useT } from "../lib/i18n.js";
import StatusMenu from "./StatusMenu.jsx";

// Табличный вид. По умолчанию задачи сгруппированы по статусам, но клик по заголовку
// колонки (Платформа / Версия / Приоритет / Статус) перегруппировывает список по этому
// полю; повторный клик по той же колонке меняет порядок групп (▲/▼).
// Перетаскивание задач работает только в группировке по статусу (там это перенос между
// колонками); в остальных группировках строки не таскаются — это режим просмотра.
export default function TaskList({ tasks, statuses, statusActions, onMoveTask, onReorderTask, onSetPriority, onSetPlatform, onOpenTask, selectMode, selectedIds = new Set(), onToggleSelect, onToggleClosed, hideEmptyGroups = false }) {
  const t = useT();
  const dragId = useRef(null);
  const [dragOver, setDragOver] = useState(null);
  const [dropRow, setDropRow] = useState(null);
  const [menuFor, setMenuFor] = useState(null);
  const [groupBy, setGroupBy] = useState("status"); // status | priority | platform | version
  const [dir, setDir] = useState("asc");             // порядок групп: asc | desc

  const byStatus = groupBy === "status";

  const endDrag = () => { dragId.current = null; setDragOver(null); setDropRow(null); };
  const dropOnGroup = (status) => { if (dragId.current) onReorderTask(dragId.current, status, null); endDrag(); };
  const dropOnRow = (task) => { if (dragId.current && dragId.current !== task.id) onReorderTask(dragId.current, task.status, task.id); endDrag(); };

  // Клик по заголовку колонки: новая колонка — группируем по ней; та же — меняем порядок.
  const clickHeader = (field) => {
    if (groupBy === field) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setGroupBy(field); setDir("asc"); }
  };

  // Собираем группы по выбранному полю. Каждая: { key, label, color?, status?, items }.
  const buildGroups = () => {
    let groups;
    if (groupBy === "priority") {
      groups = PRIORITIES.map((p) => ({ key: p.key, label: t(p.label), items: tasks.filter((tk) => tk.priority === p.key) }));
    } else if (groupBy === "platform") {
      groups = PLATFORMS.map((p) => ({ key: p.key, label: t(p.label), items: tasks.filter((tk) => tk.platform === p.key) }));
    } else if (groupBy === "version") {
      const versions = [...new Set(tasks.map((tk) => tk.version).filter(Boolean))].sort();
      groups = versions.map((v) => ({ key: v, label: v, items: tasks.filter((tk) => tk.version === v) }));
      const blank = tasks.filter((tk) => !tk.version);
      if (blank.length) groups.push({ key: "__none__", label: t("(без версии)"), items: blank });
    } else {
      groups = statuses.map((s) => ({ key: s.id, label: s.label, color: s.color, status: s, items: tasks.filter((tk) => tk.status === s.id) }));
    }
    groups.forEach((g) => g.items.sort((a, b) => a.order - b.order));
    if (dir === "desc") groups = [...groups].reverse();
    return groups;
  };
  const groups = buildGroups();
  const visibleGroups = hideEmptyGroups ? groups.filter((g) => g.items.length > 0) : groups;

  // Кликабельный заголовок колонки со стрелкой направления.
  const hdr = (field, label, cls) => (
    <span
      className={(cls ? cls + " " : "") + "pb-sortable" + (groupBy === field ? " active" : "")}
      title={t("Сгруппировать по этой колонке")}
      onClick={() => clickHeader(field)}
    >
      {label}{groupBy === field ? (dir === "asc" ? " ▲" : " ▼") : ""}
    </span>
  );

  return (
    <div className="pb-list">
      <div className="pb-row header">
        <span className="pb-close-col" />
        <span>{t("Задача")}</span>
        {hdr("platform", t("Платформа"), "col-plat")}
        {hdr("version", t("Версия"), "col-ver")}
        {hdr("priority", t("Приоритет"), "col-prio")}
        {hdr("status", t("Статус"))}
      </div>

      {visibleGroups.map((g) => (
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
              <button className="pb-colmenu-btn" title={t("Настройки статуса")} onClick={() => setMenuFor((m) => (m === g.key ? null : g.key))}>⋯</button>
            )}
          </div>

          {byStatus && menuFor === g.key && (
            <StatusMenu status={g.status} canDelete={statuses.length > 1} statusActions={statusActions} onClose={() => setMenuFor(null)} className="inlist" />
          )}

          {g.items.map((task) => {
            const st = statuses.find((x) => x.id === task.status);
            return (
              <div
                key={task.id}
                className={"pb-row" + (dropRow === task.id ? " dropbefore" : "") + (selectedIds.has(task.id) ? " selected" : "") + (task.closed ? " closed" : "")}
                style={{ "--tint": st ? hexToRgba(st.color, 0.1) : "transparent" }}
                draggable={byStatus && !selectMode}
                onDragStart={byStatus && !selectMode ? () => { dragId.current = task.id; } : undefined}
                onDragEnd={byStatus ? endDrag : undefined}
                onDragOver={byStatus && !selectMode ? (e) => { if (!dragId.current) return; e.preventDefault(); e.stopPropagation(); setDragOver(task.status); if (dropRow !== task.id) setDropRow(task.id); } : undefined}
                onDrop={byStatus && !selectMode ? (e) => { e.stopPropagation(); dropOnRow(task); } : undefined}
                onClick={() => selectMode ? onToggleSelect(task.id) : onOpenTask(task.id)}
              >
                <div className="pb-close-col" onClick={(e) => e.stopPropagation()}>
                  {selectMode
                    ? <span className={"pb-check" + (selectedIds.has(task.id) ? " on" : "")} />
                    : onToggleClosed && (
                        <button
                          className={"pb-closebtn" + (task.closed ? " done" : "")}
                          title={task.closed ? t("Открыть задачу") : t("Отметить выполненной")}
                          onClick={(e) => { e.stopPropagation(); onToggleClosed(task.id); }}
                        />
                      )
                  }
                </div>
                <div className="pb-rowtitle">
                  {task.num != null && <span className="pb-num">#{task.num}</span>}
                  <b>{task.title || <span className="muted">{t("Без названия")}</span>}</b>
                </div>
                <span className="col-plat" onClick={(e) => e.stopPropagation()}>
                  <select
                    className="pb-select"
                    style={{ color: PLAT_UI[task.platform].fg, background: PLAT_UI[task.platform].bg, borderColor: PLAT_UI[task.platform].bd }}
                    value={task.platform}
                    onChange={(e) => onSetPlatform(task.id, e.target.value)}
                  >
                    {PLATFORMS.map((p) => <option key={p.key} value={p.key}>{t(p.label)}</option>)}
                  </select>
                </span>
                <span className="col-ver">{task.version && <span className="pb-verchip">{task.version}</span>}</span>
                <span className="col-prio" onClick={(e) => e.stopPropagation()}>
                  <select
                    className="pb-select"
                    style={{ color: PRIO_UI[task.priority].fg, background: PRIO_UI[task.priority].bg, borderColor: PRIO_UI[task.priority].bd }}
                    value={task.priority}
                    onChange={(e) => onSetPriority(task.id, e.target.value)}
                  >
                    {PRIORITIES.map((p) => <option key={p.key} value={p.key}>{t(p.label)}</option>)}
                  </select>
                </span>
                <span onClick={(e) => e.stopPropagation()}>
                  <select
                    className="pb-select"
                    style={st ? { color: st.color, background: hexToRgba(st.color, 0.12), borderColor: hexToRgba(st.color, 0.4) } : undefined}
                    value={task.status}
                    onChange={(e) => onMoveTask(task.id, e.target.value)}
                  >
                    {statuses.map((st2) => <option key={st2.id} value={st2.id}>{st2.label}</option>)}
                  </select>
                </span>
              </div>
            );
          })}
          {g.items.length === 0 && <div className="pb-listempty">{t("Пусто")}</div>}
        </div>
      ))}

      {byStatus && <button className="pb-addstatus" onClick={statusActions.add}>{t("+ статус")}</button>}
    </div>
  );
}
