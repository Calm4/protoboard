import { useState } from "react";
import Board from "./Board.jsx";
import TaskList from "./TaskList.jsx";
import { EditableInput } from "./Editable.jsx";
import ColorSwatches from "./ColorSwatches.jsx";

// Экран одного проекта: шапка с названием и редактируемым билдом, переключатель
// Доска/Список, фильтр по платформе и сам контент (доска или таблица).
export default function ProjectView({
  project, view, onSetView, platFilter, onSetPlatFilter,
  visibleTasks, onBack, onSetName, onSetColor, onSetBuild, onAddTask, onMoveTask, onSetPriority, onSetPlatform, onOpenTask, statusActions,
}) {
  const statuses = project.statuses;
  const [palette, setPalette] = useState(false);
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
          <div className="pb-switch">
            <button className={view === "board" ? "on" : ""} onClick={() => onSetView("board")}>Доска</button>
            <button className={view === "list" ? "on" : ""} onClick={() => onSetView("list")}>Список</button>
          </div>
          <button className="pb-btn primary" onClick={() => onAddTask(statuses[0]?.id)}>+ Задача</button>
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
          statuses={statuses}
          statusActions={statusActions}
          onMoveTask={onMoveTask}
          onOpenTask={onOpenTask}
          onAddTask={onAddTask}
        />
      ) : (
        <TaskList
          tasks={visibleTasks}
          statuses={statuses}
          statusActions={statusActions}
          onMoveTask={onMoveTask}
          onSetPriority={onSetPriority}
          onSetPlatform={onSetPlatform}
          onOpenTask={onOpenTask}
        />
      )}
    </>
  );
}
