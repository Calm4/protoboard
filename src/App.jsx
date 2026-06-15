import { useState } from "react";
import { css } from "./styles.js";
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
    projects, createProject, setName, setArchived, setBuild,
    addTask, moveTask, editTask, deleteTask, addShots, removeShot,
  } = useProjects();

  // Состояние интерфейса.
  const [openId, setOpenId] = useState(null);       // открытый проект
  const [view, setView] = useState("board");        // "board" | "list"
  const [taskId, setTaskId] = useState(null);       // открытая задача (панель)
  const [showArchived, setShowArchived] = useState(false);
  const [newProjName, setNewProjName] = useState(null); // null = модалка закрыта
  const [platFilter, setPlatFilter] = useState("all");

  // Производные значения.
  const project = projects.find((p) => p.id === openId) || null;
  const task = project?.tasks.find((t) => t.id === taskId) || null;
  const active = projects.filter((p) => !p.archived);
  const archived = projects.filter((p) => p.archived);

  const matchPlat = (t) =>
    platFilter === "all" || t.platform === platFilter || t.platform === "both";
  const visibleTasks = project ? project.tasks.filter(matchPlat) : [];

  // Действия, связывающие интерфейс с данными.
  const openProject = (id) => { setOpenId(id); setView("board"); setPlatFilter("all"); };
  const handleAddTask = (status) => {
    const t = addTask(openId, status, project.build);
    setTaskId(t.id);
  };
  const handleCreateProject = () => {
    const p = createProject(newProjName);
    if (p) setNewProjName(null);
  };

  // Пока проверяем сессию — ничего не мигаем (при выключенном входе сразу готово).
  if (!ready) return null;
  // Когда вход включат: не вошёл — показываем экран входа вместо приложения.
  if (authRequired && !user) return <LoginScreen onSignIn={signInWithEmail} />;

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
            onNewProject={() => setNewProjName("")}
          />
        ) : (
          <ProjectView
            project={project}
            view={view}
            onSetView={setView}
            platFilter={platFilter}
            onSetPlatFilter={setPlatFilter}
            visibleTasks={visibleTasks}
            onBack={() => { setOpenId(null); setTaskId(null); }}
            onSetName={(name) => setName(openId, name)}
            onSetBuild={(build) => setBuild(openId, build)}
            onAddTask={handleAddTask}
            onMoveTask={(tid, status) => moveTask(openId, tid, status)}
            onSetPriority={(tid, priority) => editTask(openId, tid, { priority })}
            onOpenTask={setTaskId}
          />
        )}
      </div>

      {/* Панель задачи */}
      {task && (
        <TaskPanel
          task={task}
          onClose={() => setTaskId(null)}
          onEdit={(patch) => editTask(openId, taskId, patch)}
          onMoveTask={(status) => moveTask(openId, taskId, status)}
          onDelete={() => { deleteTask(openId, taskId); setTaskId(null); }}
          onAddShots={(files) => addShots(openId, taskId, files)}
          onRemoveShot={(shotId) => removeShot(openId, taskId, shotId)}
        />
      )}

      {/* Окно нового проекта */}
      {newProjName !== null && (
        <NewProjectModal
          name={newProjName}
          onChange={setNewProjName}
          onCreate={handleCreateProject}
          onClose={() => setNewProjName(null)}
        />
      )}
    </div>
  );
}
