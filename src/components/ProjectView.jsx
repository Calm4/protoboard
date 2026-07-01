import { useState } from "react";
import Board from "./Board.jsx";
import TaskList from "./TaskList.jsx";
import StatsView from "./StatsView.jsx";
import { EditableInput } from "./Editable.jsx";
import HeaderControls from "./HeaderControls.jsx";
import GlobalSearch from "./GlobalSearch.jsx";
import Logo from "./Logo.jsx";
import ProjectSettingsModal from "./ProjectSettingsModal.jsx";
import { PRIORITIES, PLATFORMS, GLOBAL_TAGS, GRADIENTS } from "../constants.js";
import { useT } from "../lib/i18n.js";

export default function ProjectView({
  project, view, onSetView, filters, onSetFilter, onResetFilters,
  visibleTasks, search, onSearch, onBack, onSetName, onSetColor, onSetBuild,
  onSetGradient, onAddTask, onMoveTask, onReorderTask, onSetPriority, onSetPlatform,
  onToggleClosed, onOpenTask, statusActions, onRemoveProjectTag, onDeleteTask,
  isDark, onToggleDark, lang, onToggleLang, user, customName, onOpenProfile,
  users, onAddMember, onRemoveMember, onAddProjectTag, isAdmin,
  allProjects, onOpenTaskGlobal, onOpenProjectGlobal, onRequestJoin,
}) {
  const t = useT();
  const statuses = project.statuses;
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);
  const [versionFilterOpen, setVersionFilterOpen] = useState(false);
  const [platformFilterOpen, setPlatformFilterOpen] = useState(false);
  const [priorityFilterOpen, setPriorityFilterOpen] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bannerPickerOpen, setBannerPickerOpen] = useState(false);
  const [bannerPickerPos, setBannerPickerPos] = useState({ top: 0, right: 0 });
  const [settingsOpen, setSettingsOpen] = useState(false);

  const closedCount = project.tasks.filter((task) => task.closed).length;

  const f = filters;
  const versions = [...new Set(project.tasks.map((t) => t.version).filter(Boolean))]
    .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
  const hasBlankVersion = project.tasks.some((t) => !t.version);
  const activeCount = [
    f.platform.length > 0, f.priority.length > 0, f.status.length > 0,
    f.version.length > 0, f.num.trim() !== "", !!(f.dateFrom || f.dateTo),
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
    ? t("Дата: все")
    : f.dateFrom && f.dateTo
      ? `${f.dateFrom} → ${f.dateTo}`
      : f.dateFrom ? `${t("С")} ${f.dateFrom}` : `${t("По")} ${f.dateTo}`;
  const toggleTagFilter = (tag) => {
    onSetFilter("tags", (cur = []) => (cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag]));
  };
  const toggleStatusFilter = (id) => {
    onSetFilter("status", (cur = []) => (cur.includes(id) ? cur.filter((s) => s !== id) : [...cur, id]));
  };
  const toggleVersionFilter = (v) => {
    onSetFilter("version", (cur = []) => (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]));
  };
  const togglePlatformFilter = (k) => {
    onSetFilter("platform", (cur = []) => (cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k]));
  };
  const togglePriorityFilter = (k) => {
    onSetFilter("priority", (cur = []) => (cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k]));
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
    if (!window.confirm(t("Удалить {n} задач?").replace("{n}", selectedIds.size))) return;
    selectedIds.forEach((tid) => onDeleteTask(tid));
    exitSelect();
  };

  return (
    <>
      <div className="pb-top">
        <div className="pb-brand pb-projectbrand" onClick={onBack} title={t("На главную")}>
          <Logo />
        </div>
        <GlobalSearch allProjects={allProjects} user={user} onOpenTask={onOpenTaskGlobal} onOpenProject={onOpenProjectGlobal} onRequestJoin={onRequestJoin} />
        <div style={{ justifySelf: "end" }}>
          <HeaderControls
            isDark={isDark} onToggleDark={onToggleDark} lang={lang} onToggleLang={onToggleLang}
            user={user} customName={customName} onOpenProfile={onOpenProfile}
          />
        </div>
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
          🎨 {project.gradient ? t("Изменить фон") : t("Добавить фон")}
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
          <EditableInput className="pb-buildedit" value={project.build} title={t("Версия проекта")} onCommit={onSetBuild} />
        </div>
        <div className="pb-switch">
          <button className={view === "stats" ? "on" : ""} onClick={() => onSetView("stats")}>{t("Статистика")}</button>
          <button className={view === "board" ? "on" : ""} onClick={() => onSetView("board")}>{t("Доска")}</button>
          <button className={view === "list" ? "on" : ""} onClick={() => onSetView("list")}>{t("Список")}</button>
        </div>
        <div className="pb-controls">
          {view !== "stats" && (
            <>
              <button
                className={"pb-btn sm" + (selectMode ? " primary" : " ghost")}
                onClick={() => { if (selectMode) exitSelect(); else setSelectMode(true); }}
              >
                {selectMode ? t("Готово") : t("Выбрать")}
              </button>
              <div className="pb-controls-sep" />
            </>
          )}
          <button className="pb-btn primary" onClick={() => { if (view === "stats") onSetView("board"); onAddTask(statuses[0]?.id); }}>{t("+ Задача")}</button>
          <button className="pb-settingsgear" title={t("Настройки проекта")} onClick={() => setSettingsOpen(true)}>⚙</button>
        </div>
      </div>

      {view !== "stats" && (
        <div className="pb-searchrow">
          <div className="pb-search">
            <span className="pb-search-ic">⌕</span>
            <input type="text" placeholder={t("Поиск задач…")} value={search} onChange={(e) => onSearch(e.target.value)} />
            {search && <button className="pb-search-x" onClick={() => onSearch("")}>✕</button>}
          </div>
        </div>
      )}

      {view !== "stats" && (
        <div className="pb-filterbar-inline">
          <div className="pb-taginput-wrap">
            <button
              className={"pb-selectlike" + (f.platform.length ? " active" : "")}
              onClick={() => { setPlatformFilterOpen((o) => !o); setPriorityFilterOpen(false); setFiltersOpen(false); setDateOpen(false); setStatusFilterOpen(false); setVersionFilterOpen(false); }}
            >
              {t("Платформа")}{f.platform.length ? ` · ${f.platform.length}` : `: ${t("все")}`} ▾
            </button>
            {platformFilterOpen && (
              <div className="pb-tagdrop">
                {PLATFORMS.filter((p) => p.key !== "both").map((p) => (
                  <button key={p.key} className={"pb-tagopt" + (f.platform.includes(p.key) ? " on" : "")} onMouseDown={() => togglePlatformFilter(p.key)}>
                    {p.label}
                  </button>
                ))}
              </div>
            )}
            {platformFilterOpen && <div className="pb-tagscrim" onMouseDown={() => setPlatformFilterOpen(false)} />}
          </div>
          <div className="pb-taginput-wrap">
            <button
              className={"pb-selectlike" + (f.priority.length ? " active" : "")}
              onClick={() => { setPriorityFilterOpen((o) => !o); setPlatformFilterOpen(false); setFiltersOpen(false); setDateOpen(false); setStatusFilterOpen(false); setVersionFilterOpen(false); }}
            >
              {t("Приоритет")}{f.priority.length ? ` · ${f.priority.length}` : `: ${t("все")}`} ▾
            </button>
            {priorityFilterOpen && (
              <div className="pb-tagdrop">
                {PRIORITIES.map((p) => (
                  <button key={p.key} className={"pb-tagopt" + (f.priority.includes(p.key) ? " on" : "")} onMouseDown={() => togglePriorityFilter(p.key)}>
                    {t(p.label)}
                  </button>
                ))}
              </div>
            )}
            {priorityFilterOpen && <div className="pb-tagscrim" onMouseDown={() => setPriorityFilterOpen(false)} />}
          </div>
          <div className="pb-taginput-wrap">
            <button
              className={"pb-selectlike" + (f.status.length ? " active" : "")}
              onClick={() => { setStatusFilterOpen((o) => !o); setFiltersOpen(false); setDateOpen(false); setVersionFilterOpen(false); setPlatformFilterOpen(false); setPriorityFilterOpen(false); }}
            >
              {t("Статус")}{f.status.length ? ` · ${f.status.length}` : `: ${t("все")}`} ▾
            </button>
            {statusFilterOpen && (
              <div className="pb-tagdrop">
                {statuses.map((s) => (
                  <button key={s.id} className={"pb-tagopt" + (f.status.includes(s.id) ? " on" : "")} onMouseDown={() => toggleStatusFilter(s.id)}>
                    {s.label}
                  </button>
                ))}
              </div>
            )}
            {statusFilterOpen && <div className="pb-tagscrim" onMouseDown={() => setStatusFilterOpen(false)} />}
          </div>
          <div className="pb-taginput-wrap">
            <button
              className={"pb-selectlike" + (f.version.length ? " active" : "")}
              onClick={() => { setVersionFilterOpen((o) => !o); setFiltersOpen(false); setDateOpen(false); setStatusFilterOpen(false); setPlatformFilterOpen(false); setPriorityFilterOpen(false); }}
            >
              {t("Версия")}{f.version.length ? ` · ${f.version.length}` : `: ${t("все")}`} ▾
            </button>
            {versionFilterOpen && (
              <div className="pb-tagdrop">
                {versions.map((v) => (
                  <button key={v} className={"pb-tagopt" + (f.version.includes(v) ? " on" : "")} onMouseDown={() => toggleVersionFilter(v)}>
                    {v}
                  </button>
                ))}
                {hasBlankVersion && (
                  <button className={"pb-tagopt" + (f.version.includes("__none__") ? " on" : "")} onMouseDown={() => toggleVersionFilter("__none__")}>
                    {t("(без версии)")}
                  </button>
                )}
              </div>
            )}
            {versionFilterOpen && <div className="pb-tagscrim" onMouseDown={() => setVersionFilterOpen(false)} />}
          </div>
          <div className="pb-taginput-wrap">
            <button
              className={"pb-selectlike" + ((f.tags || []).length ? " active" : "")}
              onClick={() => { setFiltersOpen((o) => !o); setDateOpen(false); setStatusFilterOpen(false); setVersionFilterOpen(false); setPlatformFilterOpen(false); setPriorityFilterOpen(false); }}
            >
              {t("Теги")}{(f.tags || []).length ? ` · ${f.tags.length}` : ""} ▾
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
          <input
            className="pb-fnum"
            type="text"
            inputMode="numeric"
            placeholder={t("№ задачи (через запятую)")}
            value={f.num}
            onChange={(e) => onSetFilter("num", e.target.value)}
          />
          <div className="pb-taginput-wrap">
            <button
              className={"pb-selectlike" + (dateActive ? " active" : "")}
              onClick={() => { setDateOpen((o) => !o); setFiltersOpen(false); setStatusFilterOpen(false); setVersionFilterOpen(false); setPlatformFilterOpen(false); setPriorityFilterOpen(false); }}
            >
              {dateLabel} ▾
            </button>
            {dateOpen && (
              <div className="pb-tagdrop">
                <div className="pb-datepop">
                  <div className="pb-chips wrap">
                    <button className="pb-chip" onClick={() => setPreset(1)}>{t("Сегодня")}</button>
                    <button className="pb-chip" onClick={() => setPreset(7)}>{t("7д")}</button>
                    <button className="pb-chip" onClick={() => setPreset(30)}>{t("30д")}</button>
                    <button className={"pb-chip" + (!dateActive ? " on" : "")} onClick={() => setPreset(null)}>{t("Все даты")}</button>
                  </div>
                  <div className="pb-datepop-row">
                    <span className="pb-datepop-lbl">{t("С")}</span>
                    <input type="date" className="pb-select" value={f.dateFrom} onChange={(e) => onSetFilter("dateFrom", e.target.value)} />
                  </div>
                  <div className="pb-datepop-row">
                    <span className="pb-datepop-lbl">{t("По")}</span>
                    <input type="date" className="pb-select" value={f.dateTo} onChange={(e) => onSetFilter("dateTo", e.target.value)} />
                  </div>
                </div>
              </div>
            )}
            {dateOpen && <div className="pb-tagscrim" onMouseDown={() => setDateOpen(false)} />}
          </div>
          {activeCount > 0 && <button className="pb-btn ghost sm" onClick={onResetFilters}>{t("✕ Сбросить")}</button>}
          {closedCount > 0 && (
            <button
              className={"pb-btn sm" + (filters.showClosed ? "" : " ghost")}
              onClick={() => onSetFilter("showClosed", !filters.showClosed)}
            >
              ✓ {filters.showClosed ? t("Скрыть выполненные") : `${t("Выполненные (")}${closedCount})`}
            </button>
          )}
          {activeCount > 0 && <span className="pb-fcount">{t("Показано: ")}{visibleTasks.length}</span>}
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
          <span className="pb-bulk-cnt">{t("Выбрано: ")}{selectedIds.size}</span>
          <select className="pb-select sm" defaultValue="" onChange={(e) => { if (e.target.value) bulkMoveStatus(e.target.value); }}>
            <option value="">{t("Статус →")}</option>
            {statuses.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <select className="pb-select sm" defaultValue="" onChange={(e) => { if (e.target.value) bulkSetPriority(e.target.value); }}>
            <option value="">{t("Приоритет →")}</option>
            {PRIORITIES.map((p) => <option key={p.key} value={p.key}>{t(p.label)}</option>)}
          </select>
          <button className="pb-btn danger sm" onClick={bulkDelete}>{t("Удалить")}</button>
          <button className="pb-btn ghost sm" onClick={exitSelect}>{t("Отмена")}</button>
        </div>
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
          users={users}
          currentUid={user.uid}
          onAddMember={onAddMember}
          onRemoveMember={onRemoveMember}
          isAdmin={isAdmin}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </>
  );
}
