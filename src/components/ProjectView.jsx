import Board from "./Board.jsx";
import TaskList from "./TaskList.jsx";
import { EditableInput } from "./Editable.jsx";

// Экран одного проекта: шапка с названием и редактируемым билдом, переключатель
// Доска/Список, фильтр по платформе и сам контент (доска или таблица).
export default function ProjectView({
  project, view, onSetView, platFilter, onSetPlatFilter,
  visibleTasks, onBack, onSetName, onSetBuild, onAddTask, onMoveTask, onSetPriority, onOpenTask,
}) {
  return (
    <>
      <div className="pb-back" onClick={onBack}>← Все проекты</div>
      <div className="pb-phead">
        <div className="pb-ptitle">
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
          <div className="pb-switch">
            <button className={view === "board" ? "on" : ""} onClick={() => onSetView("board")}>Доска</button>
            <button className={view === "list" ? "on" : ""} onClick={() => onSetView("list")}>Список</button>
          </div>
          <button className="pb-btn primary" onClick={() => onAddTask("todo")}>+ Задача</button>
        </div>
      </div>

      <div className="pb-filterbar">
        <span className="lbl">Платформа</span>
        <div className="pb-chips">
          <button className={"pb-chip" + (platFilter === "all" ? " on" : "")} onClick={() => onSetPlatFilter("all")}>Все</button>
          <button className={"pb-chip" + (platFilter === "ios" ? " on" : "")} onClick={() => onSetPlatFilter("ios")}>iOS</button>
          <button className={"pb-chip" + (platFilter === "android" ? " on" : "")} onClick={() => onSetPlatFilter("android")}>Android</button>
        </div>
      </div>

      {view === "board" ? (
        <Board
          tasks={visibleTasks}
          onMoveTask={onMoveTask}
          onOpenTask={onOpenTask}
          onAddTask={onAddTask}
        />
      ) : (
        <TaskList
          tasks={visibleTasks}
          onMoveTask={onMoveTask}
          onSetPriority={onSetPriority}
          onOpenTask={onOpenTask}
        />
      )}
    </>
  );
}
