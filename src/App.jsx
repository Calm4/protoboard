import { useCallback, useEffect, useRef, useState } from "react";
import { css } from "./styles.js";
import { DEFAULT_COLOR, EMPTY_FILTERS, GLOBAL_TAGS } from "./constants.js";
import { useProjects } from "./hooks/useProjects.js";
import { useAuth } from "./hooks/useAuth.js";
import ProjectGrid from "./components/ProjectGrid.jsx";
import ProjectView from "./components/ProjectView.jsx";
import TaskPanel from "./components/TaskPanel.jsx";
import NewProjectModal from "./components/NewProjectModal.jsx";
import LoginScreen from "./components/LoginScreen.jsx";

// Главный компонент. Держит «состояние интерфейса» (что открыто, какой вид,
// какой фильтр), а все данные и операции над ними берёт из useProjects().
export default function Protoboard() {
  // «Ворота» входа. Сейчас вход выключен (см. useAuth.js) — пропускают всех.
  const { ready, user, authRequired, signInWithEmail } = useAuth();

  // Данные и операции (на шаге 3 этот хук переехал на Supabase).
  const {
    projects, loadState, reload, createProject, setName, setColor, setArchived, setBuild,
    addStatus, renameStatus, recolorStatus, reorderStatuses, deleteStatus,
    addTask, moveTask, reorderTask, editTask, deleteTask, addShots, removeShot, loadShots,
    addTag, removeTag, removeProjectTag, loadActivity,
    undo,
  } = useProjects();

  // Состояние интерфейса.
  const [openId, setOpenId] = useState(null);       // открытый проект
  const [view, setView] = useState("board");        // "board" | "list"
  const [taskId, setTaskId] = useState(null);       // открытая задача (панель)
  const [showArchived, setShowArchived] = useState(false);
  const [newProj, setNewProj] = useState(null); // null = модалка закрыта; иначе { name, color }
  const [filters, setFilters] = useState(EMPTY_FILTERS); // см. constants.EMPTY_FILTERS
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null); // короткое уведомление внизу экрана

  // Производные значения.
  const project = projects.find((p) => p.id === openId) || null;
  const task = project?.tasks.find((t) => t.id === taskId) || null;
  const active = projects.filter((p) => !p.archived);
  const archived = projects.filter((p) => p.archived);

  const q = search.trim().toLowerCase();
  const matchSearch = (t) =>
    !q || (t.title || "").toLowerCase().includes(q) || (t.version || "").toLowerCase().includes(q);
  // Все условия фильтров. Пустые («all»/"") ничего не сужают.
  const matchFilters = (t) => {
    const f = filters;
    if (f.platform !== "all" && t.platform !== f.platform && t.platform !== "both") return false;
    if (f.priority !== "all" && t.priority !== f.priority) return false;
    if (f.status !== "all" && t.status !== f.status) return false;
    if (f.version !== "all") {
      if (f.version === "__none__") { if (t.version) return false; }
      else if (t.version !== f.version) return false;
    }
    if (f.num.trim() !== "" && String(t.num ?? "") !== f.num.trim()) return false;
    if (f.tags && f.tags.length > 0 && !f.tags.every((tag) => (t.tags || []).includes(tag))) return false;
    if (f.dateFrom || f.dateTo) {
      if (!t.created) return false;
      const c = new Date(t.created).getTime();
      if (f.dateFrom && c < new Date(f.dateFrom + "T00:00:00").getTime()) return false;
      if (f.dateTo && c > new Date(f.dateTo + "T23:59:59.999").getTime()) return false;
    }
    return true;
  };
  const visibleTasks = project ? project.tasks.filter((t) => matchFilters(t) && matchSearch(t)) : [];

  const setFilter = (key, val) => setFilters((f) => ({ ...f, [key]: val }));
  const resetFilters = () => setFilters(EMPTY_FILTERS);

  // Действия, связывающие интерфейс с данными.
  const openProject = (id) => { setOpenId(id); setView("stats"); resetFilters(); setSearch(""); };
  const handleAddTask = (status) => {
    const t = addTask(openId, status, project.build);
    setTaskId(t.id);
  };
  const handleCreateProject = () => {
    const p = createProject(newProj.name, newProj.color);
    if (p) setNewProj(null);
  };

  // ── Навигация через браузерную историю (Назад / Вперёд) ─────────────────────
  const navPrevRef = useRef(null);
  const fromPopRef = useRef(false);
  const navInitRef = useRef(false);

  // Записываем текущее состояние в историю при каждом переходе.
  useEffect(() => {
    const nav = { openId, view, taskId };
    if (fromPopRef.current) {
      // Это восстановление из popstate — не добавляем новую запись.
      fromPopRef.current = false;
      navPrevRef.current = nav;
      return;
    }
    if (!navInitRef.current) {
      // Первый рендер: replaceState (не добавляет запись в историю).
      navInitRef.current = true;
      navPrevRef.current = nav;
      window.history.replaceState(nav, "");
      return;
    }
    const prev = navPrevRef.current;
    if (prev && prev.openId === nav.openId && prev.view === nav.view && prev.taskId === nav.taskId) return;
    navPrevRef.current = nav;
    window.history.pushState(nav, "");
  }, [openId, view, taskId]);

  // Обрабатываем нажатие кнопки «Назад» / «Вперёд».
  useEffect(() => {
    const onPop = (e) => {
      fromPopRef.current = true;
      const s = e.state;
      if (!s) {
        setOpenId(null);
        setTaskId(null);
      } else {
        setOpenId(s.openId ?? null);
        setView(s.view ?? "stats");
        setTaskId(s.taskId ?? null);
        if (s.taskId && s.openId) {
          loadShots(s.openId, s.taskId);
          loadActivity(s.openId, s.taskId);
        }
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [loadShots, loadActivity]);

  // Открытие задачи по ссылке (#task=<uuid>) — у любого, кто перейдёт по ней.
  const projectsRef = useRef(projects);
  projectsRef.current = projects;
  const openTaskFromHash = useCallback(() => {
    const m = window.location.hash.match(/task=([0-9a-fA-F-]+)/);
    if (!m) return;
    const proj = projectsRef.current.find((p) => p.tasks.some((t) => t.id === m[1]));
    if (proj) {
      setOpenId(proj.id);
      setView("board");
      setFilters(EMPTY_FILTERS);
      setSearch("");
      setTaskId(m[1]);
      // Сохраняем state, только убираем хэш из адресной строки.
      window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
    }
  }, []);
  useEffect(() => { openTaskFromHash(); }, [projects, openTaskFromHash]);

  // Короткое уведомление, которое само исчезает.
  const toastTimer = useRef(null);
  const flashToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  // Ctrl+Z / ⌘+Z — отмена последнего действия. Внутри текстовых полей не мешаем:
  // там работает обычная отмена ввода браузера. Код клавиши (KeyZ) не зависит
  // от раскладки — сработает и на русской.
  useEffect(() => {
    const onKey = async (e) => {
      if (!(e.metaKey || e.ctrlKey) || e.shiftKey || e.altKey || e.code !== "KeyZ") return;
      const el = document.activeElement;
      const editable = el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
      if (editable) return;
      e.preventDefault();
      const label = await undo();
      flashToast(label ? `Отменено: ${label}` : "Нечего отменять");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, flashToast]);
  useEffect(() => {
    window.addEventListener("hashchange", openTaskFromHash);
    return () => window.removeEventListener("hashchange", openTaskFromHash);
  }, [openTaskFromHash]);

  // Пока проверяем сессию — ничего не мигаем (при выключенном входе сразу готово).
  if (!ready) return null;
  // Когда вход включат: не вошёл — показываем экран входа вместо приложения.
  if (authRequired && !user) return <LoginScreen onSignIn={signInWithEmail} />;

  // Экран первой загрузки / ошибки связи с базой (вместо пугающего пустого списка).
  const shell = (content) => (
    <div className="pb"><style>{css}</style><div className="pb-wrap">{content}</div></div>
  );
  if (loadState === "loading") return shell(<div className="pb-load">Загрузка…</div>);
  if (loadState === "error") return shell(
    <div className="pb-load">
      <div>Не удалось связаться с базой. Похоже, на секунду пропала сеть.</div>
      <button className="pb-btn primary" onClick={reload}>Повторить</button>
    </div>
  );

  return (
    <div className="pb">
      <style>{css}</style>
      <div className="pb-wrap">
        {!project ? (
          <ProjectGrid
            active={active}
            archived={archived}
            showArchived={showArchived}
            onToggleArchived={() => setShowArchived((s) => !s)}
            onOpen={openProject}
            onArchive={(id) => setArchived(id, true)}
            onUnarchive={(id) => setArchived(id, false)}
            onNewProject={() => setNewProj({ name: "", color: DEFAULT_COLOR })}
          />
        ) : (
          <ProjectView
            project={project}
            view={view}
            onSetView={setView}
            filters={filters}
            onSetFilter={setFilter}
            onResetFilters={resetFilters}
            visibleTasks={visibleTasks}
            search={search}
            onSearch={setSearch}
            onBack={() => { setOpenId(null); setTaskId(null); }}
            onSetName={(name) => setName(openId, name)}
            onSetColor={(color) => setColor(openId, color)}
            onSetBuild={(build) => setBuild(openId, build)}
            onAddTask={handleAddTask}
            onMoveTask={(tid, status) => moveTask(openId, tid, status)}
            onReorderTask={(dragId, status, beforeId) => reorderTask(openId, dragId, status, beforeId)}
            onSetPriority={(tid, priority) => editTask(openId, tid, { priority })}
            onSetPlatform={(tid, platform) => editTask(openId, tid, { platform })}
            onOpenTask={(tid) => {
              setTaskId(tid);
              if (tid && openId) { loadShots(openId, tid); loadActivity(openId, tid); }
            }}
            statusActions={{
              add: () => addStatus(openId),
              rename: (sid, label) => renameStatus(openId, sid, label),
              recolor: (sid, color) => recolorStatus(openId, sid, color),
              reorder: (ordered) => reorderStatuses(openId, ordered),
              remove: (sid) => deleteStatus(openId, sid),
            }}
            onRemoveProjectTag={(tag) => removeProjectTag(openId, tag)}
          />
        )}
      </div>

      {/* Панель задачи */}
      {task && (
        <TaskPanel
          task={task}
          statuses={project.statuses}
          onClose={() => setTaskId(null)}
          onEdit={(patch) => editTask(openId, taskId, patch)}
          onMoveTask={(status) => moveTask(openId, taskId, status)}
          onDelete={() => { deleteTask(openId, taskId); setTaskId(null); }}
          onAddShots={(files) => addShots(openId, taskId, files)}
          onRemoveShot={(shotId) => removeShot(openId, taskId, shotId)}
          onAddTag={(tag) => addTag(openId, taskId, tag)}
          onRemoveTag={(tag) => removeTag(openId, taskId, tag)}
          availableTags={[...new Set([...GLOBAL_TAGS, ...(project?.customTags || [])])]}
        />
      )}

      {/* Окно нового проекта */}
      {newProj !== null && (
        <NewProjectModal
          proj={newProj}
          onChange={setNewProj}
          onCreate={handleCreateProject}
          onClose={() => setNewProj(null)}
        />
      )}

      {/* Уведомление об отмене действия */}
      {toast && <div className="pb-toast">{toast}</div>}
    </div>
  );
}
