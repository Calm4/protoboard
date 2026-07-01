import { useState } from "react";
import Board from "./Board.jsx";
import TaskList from "./TaskList.jsx";
import StatsView from "./StatsView.jsx";
import { EditableInput } from "./Editable.jsx";
import HeaderControls from "./HeaderControls.jsx";
import MembersModal from "./MembersModal.jsx";
import ProjectSettingsModal from "./ProjectSettingsModal.jsx";
import { PRIORITIES, GLOBAL_TAGS, GRADIENTS } from "../constants.js";

export default function ProjectView({
  project, view, onSetView, filters, onSetFilter, onResetFilters,
  visibleTasks, search, onSearch, onBack, onSetName, onSetColor, onSetBuild,
  onSetGradient, onAddTask, onMoveTask, onReorderTask, onSetPriority, onSetPlatform,
  onToggleClosed, onOpenTask, statusActions, onRemoveProjectTag, onDeleteTask,
  isDark, onToggleDark, user, customName, onOpenProfile,
  users, onAddMember, onRemoveMember, onAddProjectTag,
}) {
  const statuses = project.statuses;
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bannerPickerOpen, setBannerPickerOpen] = useState(false);
  const [bannerPickerPos, setBannerPickerPos] = useState({ top: 0, right: 0 });
  const [membersOpen, setMembersOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

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

  const allTags = [...new Set([
    ...GLOBAL_TAGS.filter((t) => !(project.hiddenTags || []).includes(t)),
    ...(project.customTags || []),
  ])];

  const toYmd = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const setPreset = (days) => {
    if (days == null) { onSetFilter("dateFrom", ""); onSetFilter("dateTo", ""); return; }
    const to = new Date(); const from = new Date();
    from.setDate(from.getDate() - (days - 1));
    onSetFilter("dateFrom", toYmd(from)); onSetFilter("dateTo", toYmd(to));
  };
  const dateActive = !!(f.dateFrom || f.dateTo);
  const dateLabel = !dateActive
    ? "Дата: все"
    : f.dateFrom && f.dateTo
      ? `${f.dateFrom} → ${f.dateTo}`
      : f.dateFrom ? `С ${f.dateFrom}` : `По ${f.dateTo}`;
  const toggleTagFilter = (tag) => {
    onSetFilter("tags", (cur = []) => (cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag]));
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
          <span className="pb-logo">Proto<b>board</b></span>
        </div>
        <HeaderControls
          isDark={isDark} onToggleDark={onToggleDark} user={user} customName={customName}
          onOpenProfile={onOpenProfile}
        />
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
          <span className="pb-nameedit static" title={project.name}>{project.name}</span>
          <EditableInput className="pb-buildedit" value={project.build} title="Версия проекта" onCommit={onSetBuild} />
        </div>
        <div className="pb-switch">
          <button className={view === "stats" ? "on" : ""} onClick={() => onSetView("stats")}>Статистика</button>
          <button className={view === "board" ? "on" : ""} onClick={() => onSetView("board")}>Доска</button>
          <button className={view === "list" ? "on" : ""} onClick={() => onSetView("list")}>Список</button>
        </div>
        <div className="pb-controls">
          {view !== "stats" && (
            <>
              <button
                className={"pb-btn sm" + (selectMode ? " primary" : " ghost")}
                onClick={() => { if (selectMode) exitSelect(); else setSelectMode(true); }}
              >
                {selectMode ? "Готово" : "Выбрать"}
              </button>
              <div className="pb-controls-sep" />
            </>
          )}
          <button className="pb-btn primary" onClick={() => { if (view === "stats") onSetView("board"); onAddTask(statuses[0]?.id); }}>+ Задача</button>
          <button className="pb-settingsgear" title="Настройки проекта" onClick={() => setSettingsOpen(true)}>⚙</button>
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
        <div className="pb-filterbar-inline">
          <select className="pb-select sm" value={f.platform} onChange={(e) => onSetFilter("platform", e.target.value)} title="Платформа">
            <option value="all">Платформа: все</option>
            <option value="ios">iOS</option>
            <option value="android">Android</option>
          </select>
          <select className="pb-select sm" value={f.priority} onChange={(e) => onSetFilter("priority", e.target.value)} title="Приоритет">
            <option value="all">Приоритет: все</option>
            {PRIORITIES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
          <select className="pb-select sm" value={f.status} onChange={(e) => onSetFilter("status", e.target.value)} title="Статус">
            <option value="all">Статус: все</option>
            {statuses.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <select className="pb-select sm" value={f.version} onChange={(e) => onSetFilter("version", e.target.value)} title="Версия">
            <option value="all">Версия: все</option>
            {versions.map((v) => <option key={v} value={v}>{v}</option>)}
            {hasBlankVersion && <option value="__none__">(без версии)</option>}
          </select>
          <div className="pb-taginput-wrap">
            <button
              className={"pb-selectlike" + ((f.tags || []).length ? " active" : "")}
              onClick={() => { setFiltersOpen((o) => !o); setDateOpen(false); }}
            >
              Теги{(f.tags || []).length ? ` · ${f.tags.length}` : ""} ▾
            </button>
            {filtersOpen && (
              <div className="pb-tagdrop">
                {allTags.map((tag) => (
                  <button key={tag} className={"pb-tagopt" + ((f.tags || []).includes(tag) ? " on" : "")} onMouseDown={() => toggleTagFilter(tag)}>
                    {tag}
                  </button>
                ))}
              </div>
            )}
            {filtersOpen && <div className="pb-tagscrim" onMouseDown={() => setFiltersOpen(false)} />}
          </div>
          <input className="pb-fnum" type="number" min="1" placeholder="№ задачи" value={f.num} onChange={(e) => onSetFilter("num", e.target.value)} />
          <div className="pb-taginput-wrap">
            <button
              className={"pb-selectlike" + (dateActive ? " active" : "")}
              onClick={() => { setDateOpen((o) => !o); setFiltersOpen(false); }}
            >
              {dateLabel} ▾
            </button>
            {dateOpen && (
              <div className="pb-tagdrop">
                <div className="pb-datepop">
                  <div className="pb-chips wrap">
                    <button className="pb-chip" onClick={() => setPreset(1)}>Сегодня</button>
                    <button className="pb-chip" onClick={() => setPreset(7)}>7д</button>
                    <button className="pb-chip" onClick={() => setPreset(30)}>30д</button>
                    <button className={"pb-chip" + (!dateActive ? " on" : "")} onClick={() => setPreset(null)}>Все даты</button>
                  </div>
                  <div className="pb-datepop-row">
                    <span className="pb-datepop-lbl">С</span>
                    <input type="date" className="pb-select" value={f.dateFrom} onChange={(e) => onSetFilter("dateFrom", e.target.value)} />
                  </div>
                  <div className="pb-datepop-row">
                    <span className="pb-datepop-lbl">По</span>
                    <input type="date" className="pb-select" value={f.dateTo} onChange={(e) => onSetFilter("dateTo", e.target.value)} />
                  </div>
                </div>
              </div>
            )}
            {dateOpen && <div className="pb-tagscrim" onMouseDown={() => setDateOpen(false)} />}
          </div>
          {activeCount > 0 && <button className="pb-btn ghost sm" onClick={onResetFilters}>✕ Сбросить</button>}
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
          users={users}
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
          hideEmptyGroups={activeCount > 0 || !!search.trim()}
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

      {membersOpen && (
        <MembersModal
          members={project.members || []}
          users={users}
          currentUid={user.uid}
          onAdd={(uid) => onAddMember(uid)}
          onRemove={(uid) => onRemoveMember(uid)}
          onClose={() => setMembersOpen(false)}
        />
      )}

      {settingsOpen && (
        <ProjectSettingsModal
          project={project}
          onSetName={onSetName}
          onSetColor={onSetColor}
          onSetGradient={onSetGradient}
          statusActions={statusActions}
          onAddProjectTag={onAddProjectTag}
          onRemoveProjectTag={onRemoveProjectTag}
          onOpenMembers={() => { setSettingsOpen(false); setMembersOpen(true); }}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </>
  );
}
