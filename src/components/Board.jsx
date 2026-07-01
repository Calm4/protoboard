import { useRef, useState, useEffect } from "react";
import { PRIORITIES, platLabel } from "../constants.js";
import { personName, personPosition } from "../lib/people.js";
import { useT } from "../lib/i18n.js";
import StatusMenu from "./StatusMenu.jsx";

const dueBadge = (dueDate) => {
  if (!dueDate) return null;
  const diff = (new Date(dueDate) - new Date()) / 86400000;
  if (diff < 0) return { label: fmtDate(dueDate), cls: "overdue" };
  if (diff <= 3) return { label: fmtDate(dueDate), cls: "soon" };
  return { label: fmtDate(dueDate), cls: "" };
};
const fmtDate = (s) => {
  const d = new Date(s);
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
};

export default function Board({ tasks, statuses, statusActions, onMoveTask, onReorderTask, onOpenTask, onAddTask, selectMode, selectedIds = new Set(), onToggleSelect, onToggleClosed, users = [] }) {
  const t = useT();
  const usersByUid = new Map(users.map((u) => [u.uid, u]));
  const assigneeLabel = (assignee) => {
    if (!assignee) return "";
    const u = usersByUid.get(assignee);
    return u ? personName(u) : assignee;
  };
  const assigneeTitle = (assignee) => {
    const u = usersByUid.get(assignee);
    const pos = u && personPosition(u);
    return pos ? `${personName(u)} — ${pos}` : "";
  };
  const cardDrag = useRef(null);
  const colDrag = useRef(null);
  const [dragOver, setDragOver] = useState(null);
  const [menuFor, setMenuFor] = useState(null);
  const [hoverCard, setHoverCard] = useState(null);

  const boardRef = useRef(null);
  const topRef = useRef(null);
  const syncing = useRef(false);
  const [scrollW, setScrollW] = useState(0);

  useEffect(() => {
    const b = boardRef.current;
    if (!b) return;
    const update = () => setScrollW(b.scrollWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(b);
    window.addEventListener("resize", update);
    return () => { ro.disconnect(); window.removeEventListener("resize", update); };
  }, [statuses.length]);

  const syncFrom = (src, dst) => {
    if (syncing.current) return;
    syncing.current = true;
    dst.scrollLeft = src.scrollLeft;
    syncing.current = false;
  };

  const handleColDrop = (statusId) => {
    if (cardDrag.current) {
      onReorderTask(cardDrag.current, statusId, null);
      cardDrag.current = null;
    } else if (colDrag.current && colDrag.current !== statusId) {
      const arr = [...statuses];
      const from = arr.findIndex((s) => s.id === colDrag.current);
      const to = arr.findIndex((s) => s.id === statusId);
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      statusActions.reorder(arr);
      colDrag.current = null;
    }
    setDragOver(null);
    setHoverCard(null);
  };

  const handleCardDrop = (card) => {
    if (cardDrag.current && cardDrag.current !== card.id) {
      onReorderTask(cardDrag.current, card.status, card.id);
    }
    cardDrag.current = null;
    setDragOver(null);
    setHoverCard(null);
  };
  const endDrag = () => { cardDrag.current = null; colDrag.current = null; setDragOver(null); setHoverCard(null); };

  return (
    <>
      <div className="pb-board-topscroll" ref={topRef} onScroll={() => syncFrom(topRef.current, boardRef.current)}>
        <div style={{ width: scrollW }} />
      </div>
      <div className="pb-board" ref={boardRef} onScroll={() => syncFrom(boardRef.current, topRef.current)}>
        {statuses.map((s) => {
          const items = tasks.filter((t) => t.status === s.id).sort((a, b) => a.order - b.order);
          return (
            <div
              key={s.id}
              className={"pb-col" + (dragOver === s.id ? " over" : "")}
              onDragOver={(e) => { e.preventDefault(); setDragOver(s.id); }}
              onDragLeave={() => setDragOver((d) => (d === s.id ? null : d))}
              onDrop={() => handleColDrop(s.id)}
            >
              <div className="pb-colhead" draggable onDragStart={() => { colDrag.current = s.id; cardDrag.current = null; }} onDragEnd={() => { colDrag.current = null; setDragOver(null); }}>
                <span className="name"><span className="pb-dot" style={{ background: s.color }} /><span className="lbl">{s.label}</span></span>
                <span className="pb-colcount">{items.length}</span>
                <button className="pb-colmenu-btn" draggable={false} onClick={(e) => { e.stopPropagation(); setMenuFor((m) => (m === s.id ? null : s.id)); }}>⋯</button>
              </div>

              {menuFor === s.id && (
                <StatusMenu status={s} canDelete={statuses.length > 1} statusActions={statusActions} onClose={() => setMenuFor(null)} />
              )}

              {items.map((task) => {
                const due = dueBadge(task.dueDate);
                const selected = selectedIds.has(task.id);
                return (
                  <div
                    key={task.id}
                    className={"pb-card" + (hoverCard === task.id ? " dropbefore" : "") + (selected ? " selected" : "") + (task.closed ? " closed" : "")}
                    draggable={!selectMode}
                    onDragStart={() => { if (!selectMode) { cardDrag.current = task.id; colDrag.current = null; } }}
                    onDragEnd={endDrag}
                    onDragOver={(e) => {
                      if (!cardDrag.current) return;
                      e.preventDefault(); e.stopPropagation();
                      setDragOver(s.id);
                      if (hoverCard !== task.id) setHoverCard(task.id);
                    }}
                    onDrop={(e) => { e.stopPropagation(); handleCardDrop(task); }}
                    onClick={() => selectMode ? onToggleSelect(task.id) : onOpenTask(task.id)}
                  >
                    {selectMode && (
                      <span className={"pb-check" + (selected ? " on" : "")} />
                    )}
                    <div className="pb-card-titlerow">
                      {!selectMode && onToggleClosed && (
                        <button
                          className={"pb-closebtn" + (task.closed ? " done" : "")}
                          title={task.closed ? t("Открыть задачу") : t("Отметить выполненной")}
                          onClick={(e) => { e.stopPropagation(); onToggleClosed(task.id); }}
                        />
                      )}
                      <h4>{task.title || <span className="muted">{t("Без названия")}</span>}</h4>
                    </div>
                    {(task.tags || []).length > 0 && (
                      <div className="pb-cardtags">
                        {task.tags.slice(0, 3).map((tag) => <span key={tag} className="pb-tag-sm">{tag}</span>)}
                        {task.tags.length > 3 && <span className="pb-tag-sm more">+{task.tags.length - 3}</span>}
                      </div>
                    )}
                    <div className="pb-cardfoot">
                      {task.num != null && <span className="pb-num">#{task.num}</span>}
                      <span className={"pb-prio " + task.priority}>{t(PRIORITIES.find((p) => p.key === task.priority).label)}</span>
                      {task.platform !== "both" && <span className={"pb-plat " + task.platform}>{t(platLabel(task.platform))}</span>}
                      <span style={{ flex: 1 }} />
                      {task.assignee && <span className="pb-assignee" title={assigneeTitle(task.assignee)}>@{assigneeLabel(task.assignee)}</span>}
                      {due && <span className={"pb-due " + due.cls}>{due.label}</span>}
                      {task.version && <span className="pb-verchip">{task.version}</span>}
                      {task.shots.length > 0 && <span className="pb-shot">▦ {task.shots.length}</span>}
                    </div>
                  </div>
                );
              })}
              <button className="pb-addtask" onClick={() => onAddTask(s.id)}>{t("+ Добавить")}</button>
            </div>
          );
        })}
        <button className="pb-addcol" onClick={statusActions.add} title={t("Добавить колонку")}>{t("+ колонка")}</button>
      </div>
    </>
  );
}
