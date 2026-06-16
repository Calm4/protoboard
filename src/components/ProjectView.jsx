import { useState } from "react";
import Board from "./Board.jsx";
import TaskList from "./TaskList.jsx";
import { EditableInput } from "./Editable.jsx";
import ColorSwatches from "./ColorSwatches.jsx";
import { PRIORITIES } from "../constants.js";

// Экран одного проекта: шапка с названием и редактируемым билдом, переключатель
// Доска/Список, панель фильтров и сам контент (доска или таблица).
export default function ProjectView({
  project, view, onSetView, filters, onSetFilter, onResetFilters,
  visibleTasks, search, onSearch, onBack, onSetName, onSetColor, onSetBuild, onAddTask, onMoveTask, onReorderTask, onSetPriority, onSetPlatform, onOpenTask, statusActions,
}) {
  const statuses = project.statuses;
  const [palette, setPalette] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Для выпадашки версий — список реально встречающихся версий проекта.
  const f = filters;
  // От новых к старым (умное сравнение чисел: v1.10 выше v1.9).
  const versions = [...new Set(project.tasks.map((t) => t.version).filter(Boolean))]
    .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
  const hasBlankVersion = project.tasks.some((t) => !t.version);
  // Сколько фильтров сейчас активно (для счётчика на кнопке).
  const activeCount = [
    f.platform !== "all", f.priority !== "all", f.status !== "all",
    f.version !== "all", f.num.trim() !== "", !!(f.dateFrom || f.dateTo),
  ].filter(Boolean).length;

  // Дата → строка YYYY-MM-DD (для полей type=date и пресетов).
  const toYmd = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  // Быстрый пресет «последние N дней» (days=null — очистить даты).
  const setPreset = (days) => {
    if (days == null) { onSetFilter("dateFrom", ""); onSetFilter("dateTo", ""); return; }
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - (days - 1));
    onSetFilter("dateFrom", toYmd(from));
    onSetFilter("dateTo", toYmd(to));
  };

  return (
    <>
      <div className="pb-back" onClick={onBack}>← Все проекты</div>
      <div className="pb-phead">
        <div className="pb-ptitle">
          <div className="pb-colorwrap">
            <button
              className="pb-colordot"
              style={{ background: project.color }}
              title="Цвет проекта"
              onClick={() => setPalette((o) => !o)}
            />
            {palette && (
              <>
                <div className="pb-colorscrim" onClick={() => setPalette(false)} />
                <div className="pb-colorpop">
                  <ColorSwatches value={project.color} onChange={(c) => { onSetColor(c); setPalette(false); }} />
                </div>
              </>
            )}
          </div>
          <EditableInput
            className="pb-nameedit"
            value={project.name}
            autoSize
            title="Название проекта — Enter, чтобы сохранить"
            onCommit={onSetName}
          />
          <EditableInput
            className="pb-buildedit"
            value={project.build}
            title="Версия проекта — Enter, чтобы сохранить"
            onCommit={onSetBuild}
          />
        </div>
        <div className="pb-controls">
          <div className="pb-search">
            <span className="pb-search-ic">⌕</span>
            <input
              type="text"
              placeholder="Поиск задач…"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
            />
            {search && <button className="pb-search-x" title="Очистить" onClick={() => onSearch("")}>✕</button>}
          </div>
          <div className="pb-switch">
            <button className={view === "board" ? "on" : ""} onClick={() => onSetView("board")}>Доска</button>
            <button className={view === "list" ? "on" : ""} onClick={() => onSetView("list")}>Список</button>
          </div>
          <button className="pb-btn primary" onClick={() => onAddTask(statuses[0]?.id)}>+ Задача</button>
        </div>
      </div>

      <div className="pb-filterbar">
        <div className="pb-filterwrap">
          <button
            className={"pb-btn sm" + (activeCount ? " primary" : "")}
            onClick={() => setFiltersOpen((o) => !o)}
            title="Фильтры задач"
          >
            ⚙ Фильтры{activeCount ? ` · ${activeCount}` : ""}
          </button>
          {filtersOpen && (
            <>
              <div className="pb-colorscrim" onClick={() => setFiltersOpen(false)} />
              <div className="pb-filterpop">
                <div className="pb-frow">
                  <span className="lbl">Платформа</span>
                  <div className="pb-chips">
                    <button className={"pb-chip" + (f.platform === "all" ? " on" : "")} onClick={() => onSetFilter("platform", "all")}>Все</button>
                    <button className={"pb-chip" + (f.platform === "ios" ? " on" : "")} onClick={() => onSetFilter("platform", "ios")}>iOS</button>
                    <button className={"pb-chip" + (f.platform === "android" ? " on" : "")} onClick={() => onSetFilter("platform", "android")}>Android</button>
                  </div>
                </div>
                <div className="pb-frow">
                  <span className="lbl">Приоритет</span>
                  <select className="pb-select" value={f.priority} onChange={(e) => onSetFilter("priority", e.target.value)}>
                    <option value="all">Все</option>
                    {PRIORITIES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
                  </select>
                </div>
                <div className="pb-frow">
                  <span className="lbl">Статус</span>
                  <select className="pb-select" value={f.status} onChange={(e) => onSetFilter("status", e.target.value)}>
                    <option value="all">Все</option>
                    {statuses.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
                <div className="pb-frow">
                  <span className="lbl">Версия</span>
                  <select className="pb-select" value={f.version} onChange={(e) => onSetFilter("version", e.target.value)}>
                    <option value="all">Все</option>
                    {versions.map((v) => <option key={v} value={v}>{v}</option>)}
                    {hasBlankVersion && <option value="__none__">(без версии)</option>}
                  </select>
                </div>
                <div className="pb-frow">
                  <span className="lbl">№ задачи</span>
                  <input
                    className="pb-fnum"
                    type="number"
                    min="1"
                    placeholder="напр. 12"
                    value={f.num}
                    onChange={(e) => onSetFilter("num", e.target.value)}
                  />
                </div>
                <div className="pb-frow col">
                  <span className="lbl">Дата создания</span>
                  <div className="pb-chips">
                    <button className="pb-chip" onClick={() => setPreset(1)}>Сегодня</button>
                    <button className="pb-chip" onClick={() => setPreset(7)}>7 дней</button>
                    <button className="pb-chip" onClick={() => setPreset(30)}>30 дней</button>
                    <button className={"pb-chip" + (!f.dateFrom && !f.dateTo ? " on" : "")} onClick={() => setPreset(null)}>Всё</button>
                  </div>
                  <div className="pb-daterow">
                    <input type="date" className="pb-select" value={f.dateFrom} onChange={(e) => onSetFilter("dateFrom", e.target.value)} />
                    <span className="dash">—</span>
                    <input type="date" className="pb-select" value={f.dateTo} onChange={(e) => onSetFilter("dateTo", e.target.value)} />
                  </div>
                </div>
                <div className="pb-ffoot">
                  <button className="pb-btn ghost sm" disabled={!activeCount} onClick={onResetFilters}>Сбросить</button>
                  <button className="pb-btn sm" onClick={() => setFiltersOpen(false)}>Готово</button>
                </div>
              </div>
            </>
          )}
        </div>
        {activeCount > 0 && <span className="pb-fcount">Показано: {visibleTasks.length}</span>}
      </div>

      {view === "board" ? (
        <Board
          tasks={visibleTasks}
          statuses={statuses}
          statusActions={statusActions}
          onMoveTask={onMoveTask}
          onReorderTask={onReorderTask}
          onOpenTask={onOpenTask}
          onAddTask={onAddTask}
        />
      ) : (
        <TaskList
          tasks={visibleTasks}
          statuses={statuses}
          statusActions={statusActions}
          onMoveTask={onMoveTask}
          onReorderTask={onReorderTask}
          onSetPriority={onSetPriority}
          onSetPlatform={onSetPlatform}
          onOpenTask={onOpenTask}
        />
      )}
    </>
  );
}
