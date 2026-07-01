import { useState } from "react";
import Board from "./Board.jsx";
import TaskList from "./TaskList.jsx";
import StatsView from "./StatsView.jsx";
import { EditableInput } from "./Editable.jsx";
import ColorSwatches from "./ColorSwatches.jsx";
import HeaderControls from "./HeaderControls.jsx";
import { PRIORITIES, GLOBAL_TAGS, GRADIENTS } from "../constants.js";

export default function ProjectView({
  project, view, onSetView, filters, onSetFilter, onResetFilters,
  visibleTasks, search, onSearch, onBack, onSetName, onSetColor, onSetBuild,
  onSetGradient, onAddTask, onMoveTask, onReorderTask, onSetPriority, onSetPlatform,
  onToggleClosed, onOpenTask, statusActions, onRemoveProjectTag, onDeleteTask,
  isDark, onToggleDark, user, role, onSignOut,
}) {
  const statuses = project.statuses;
  const [palette, setPalette] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bannerPickerOpen, setBannerPickerOpen] = useState(false);
  const [bannerPickerPos, setBannerPickerPos] = useState({ top: 0, right: 0 });

  const closedCount = project.tasks.filter((t) => t.closed).length;

  const f = filters;
  const versions = [...new Set(project.tasks.map((t) => t.version).filter(Boolean))]
    .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
  const hasBlankVersion = project.tasks.some((t) => !t.version);
  const activeCount = [
    f.platform !== "all", f.priority !== "all", f.status !== "all",
    f.version !== "all", f.num.trim() !== "", !!(f.dateFrom || f.dateTo),
    (f.tags || []).length > 0,
  ].filter(Boolean).length;

  const allTags = [...new Set([...GLOBAL_TAGS, ...(project.customTags || [])])];

  const toYmd = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const setPreset = (days) => {
    if (days == null) { onSetFilter("dateFrom", ""); onSetFilter("dateTo", ""); return; }
    const to = new Date(); const from = new Date();
    from.setDate(from.getDate() - (days - 1));
    onSetFilter("dateFrom", toYmd(from)); onSetFilter("dateTo", toYmd(to));
  };
  const toggleTagFilter = (tag) => {
    const cur = f.tags || [];
    onSetFilter("tags", cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag]);
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const exitSelect = () => { setSelectMode(false); setSelectedIds(new Set()); };

  const bulkMoveStatus = (statusId) => {
    selectedIds.forEach((tid) => onMoveTask(tid, statusId));
    exitSelect();
  };
  const bulkSetPriority = (priority) => {
    selectedIds.forEach((tid) => onSetPriority(tid, priority));
    exitSelect();
  };
  const bulkDelete = () => {
    if (!window.confirm(`Удалить ${selectedIds.size} задач?`)) return;
    selectedIds.forEach((tid) => onDeleteTask(tid));
    exitSelect();
  };

  return (
    <>
      <div className="pb-top">
        <div className="pb-brand pb-projectbrand" onClick={onBack} title="На главную">
          <span className="pb-back-arrow">←</span>
          <span className="pb-logo">{project.name}</span>
        </div>
        <HeaderControls isDark={isDark} onToggleDark={onToggleDark} user={user} role={role} onSignOut={onSignOut} />
      </div>

      {/* Баннер-градиент вверху проекта (как у Slack) */}
      <div
        className={"pb-proj-banner" + (project.gradient ? "" : " empty")}
        style={project.gradient ? { background: project.gradient } : {}}
      >
        <button
          className="pb-banner-edit-btn"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setBannerPickerPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
            setBannerPickerOpen((o) => !o);
          }}
        >
          🎨 {project.gradient ? "Изменить фон" : "Добавить фон"}
        </button>
      </div>
      {bannerPickerOpen && (
        <>
          <div className="pb-colorscrim" onClick={() => setBannerPickerOpen(false)} />
          <div
            className="pb-gradpop"
            style={{ top: bannerPickerPos.top, right: bannerPickerPos.right }}
            onClick={(e) => e.stopPropagation()}
          >
            {GRADIENTS.map((g) => (
              <button
                key={g.value}
                className={"pb-gradswatch" + (project.gradient === g.value ? " on" : "")}
                title={g.label}
                style={g.value ? { background: g.value } : undefined}
                onClick={() => { onSetGradient(g.value); setBannerPickerOpen(false); }}
              >
                {!g.value && "✕"}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="pb-phead">
        <div className="pb-ptitle">
          <div className="pb-colorwrap">
            <button className="pb-colordot" style={{ background: project.color }} title="Цвет проекта" onClick={() => setPalette((o) => !o)} />
            {palette && (
              <>
                <div className="pb-colorscrim" onClick={() => setPalette(false)} />
                <div className="pb-colorpop">
                  <ColorSwatches value={project.color} onChange={(c) => { onSetColor(c); setPalette(false); }} />
                </div>
              </>
            )}
          </div>
          <EditableInput className="pb-nameedit" value={project.name} autoSize title="Название проекта" onCommit={onSetName} />
          <EditableInput className="pb-buildedit" value={project.build} title="Версия проекта" onCommit={onSetBuild} />
        </div>
        <div className="pb-controls">
          <div className="pb-switch">
            <button className={view === "stats" ? "on" : ""} onClick={() => onSetView("stats")}>Статистика</button>
            <button className={view === "board" ? "on" : ""} onClick={() => onSetView("board")}>Доска</button>
            <button className={view === "list" ? "on" : ""} onClick={() => onSetView("list")}>Список</button>
          </div>
          {view !== "stats" && (
            <>
              <div className="pb-controls-sep" />
              <button
                className={"pb-btn sm" + (selectMode ? " primary" : " ghost")}
                onClick={() => { if (selectMode) exitSelect(); else setSelectMode(true); }}
              >
                {selectMode ? "Готово" : "Выбрать"}
              </button>
            </>
          )}
          <button className="pb-btn primary" onClick={() => { if (view === "stats") onSetView("board"); onAddTask(statuses[0]?.id); }}>+ Задача</button>
        </div>
      </div>

      {view !== "stats" && (
        <div className="pb-searchrow">
          <div className="pb-search">
            <span className="pb-search-ic">⌕</span>
            <input type="text" placeholder="Поиск задач…" value={search} onChange={(e) => onSearch(e.target.value)} />
            {search && <button className="pb-search-x" onClick={() => onSearch("")}>✕</button>}
          </div>
        </div>
      )}

      {view !== "stats" && (
        <div className="pb-filterbar">
          <div className="pb-filterwrap">
            <button className={"pb-btn sm" + (activeCount ? " primary" : "")} onClick={() => setFiltersOpen((o) => !o)}>
              ⚙ Фильтры{activeCount ? ` · ${activeCount}` : ""}
            </button>
            {filtersOpen && (
              <>
                <div className="pb-colorscrim" onClick={() => setFiltersOpen(false)} />
                <div className="pb-filterpop">
                  <div className="pb-frow">
                    <span className="lbl">Платформа</span>
                    <div className="pb-chips">
                      {["all", "ios", "android"].map((v) => (
                        <button key={v} className={"pb-chip" + (f.platform === v ? " on" : "")} onClick={() => onSetFilter("platform", v)}>
                          {v === "all" ? "Все" : v === "ios" ? "iOS" : "Android"}
                        </button>
                      ))}
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
                    <span className="lbl">Теги</span>
                    <div className="pb-chips wrap">
                      {allTags.map((tag) => (
                        <button key={tag} className={"pb-chip" + ((f.tags || []).includes(tag) ? " on" : "")} onClick={() => toggleTagFilter(tag)}>{tag}</button>
                      ))}
                    </div>
                  </div>
                  <div className="pb-frow">
                    <span className="lbl">№ задачи</span>
                    <input className="pb-fnum" type="number" min="1" placeholder="напр. 12" value={f.num} onChange={(e) => onSetFilter("num", e.target.value)} />
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
          {closedCount > 0 && (
            <button
              className={"pb-btn sm" + (filters.showClosed ? "" : " ghost")}
              onClick={() => onSetFilter("showClosed", !filters.showClosed)}
            >
              ✓ {filters.showClosed ? "Скрыть выполненные" : `Выполненные (${closedCount})`}
            </button>
          )}
          {activeCount > 0 && <span className="pb-fcount">Показано: {visibleTasks.length}</span>}
        </div>
      )}

      {view === "stats" ? (
        <StatsView project={project} />
      ) : view === "board" ? (
        <Board
          tasks={visibleTasks}
          statuses={statuses}
          statusActions={statusActions}
          onMoveTask={onMoveTask}
          onReorderTask={onReorderTask}
          onOpenTask={onOpenTask}
          onAddTask={onAddTask}
          selectMode={selectMode}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleClosed={onToggleClosed}
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
          selectMode={selectMode}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleClosed={onToggleClosed}
        />
      )}

      {/* Bulk action bar */}
      {selectMode && selectedIds.size > 0 && (
        <div className="pb-bulkbar">
          <span className="pb-bulk-cnt">Выбрано: {selectedIds.size}</span>
          <select className="pb-select sm" defaultValue="" onChange={(e) => { if (e.target.value) bulkMoveStatus(e.target.value); }}>
            <option value="">Статус →</option>
            {statuses.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <select className="pb-select sm" defaultValue="" onChange={(e) => { if (e.target.value) bulkSetPriority(e.target.value); }}>
            <option value="">Приоритет →</option>
            {PRIORITIES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
          <button className="pb-btn danger sm" onClick={bulkDelete}>Удалить</button>
          <button className="pb-btn ghost sm" onClick={exitSelect}>Отмена</button>
        </div>
      )}

    </>
  );
}
