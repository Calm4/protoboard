import { useState, useRef } from "react";

// ── Protoboard — прототип таск-трекера для прототипов мобильных игр ──
// Макет интерфейса: данные живут в памяти и сбрасываются при перезагрузке.
// Живое обновление для команды и хранение скриншотов появятся на этапе 2 (Supabase).

const uid = () =>
  (crypto.randomUUID ? crypto.randomUUID() : String(Math.random())).slice(0, 8);

const STATUSES = [
  { key: "todo", label: "To Do" },
  { key: "check", label: "Ready to Check" },
  { key: "done", label: "Done" },
];

const PRIORITIES = [
  { key: "high", label: "Высокий" },
  { key: "med", label: "Средний" },
  { key: "low", label: "Низкий" },
];

const PLATFORMS = [
  { key: "both", label: "Общая" },
  { key: "ios", label: "iOS" },
  { key: "android", label: "Android" },
];
const platLabel = (k) => PLATFORMS.find((p) => p.key === k).label;

const seed = () => [
  {
    id: uid(), name: "Neon Dash", build: "v0.4", archived: false,
    tasks: [
      { id: uid(), title: "Игрок проваливается сквозь пол на 3 уровне", desc: "Воспроизводится при быстром двойном прыжке у левой стены.", priority: "high", status: "todo", platform: "android", version: "v0.3", notes: "Билд 412, устройство Pixel 6.", shots: [] },
      { id: uid(), title: "Настроить кривую сложности 1–5 уровней", desc: "Слишком резкий скачок между 2 и 3.", priority: "med", status: "todo", platform: "both", version: "v0.4", notes: "", shots: [] },
      { id: uid(), title: "Кнопка паузы перекрывает счёт", desc: "На узких экранах HUD наезжает.", priority: "med", status: "check", platform: "ios", version: "v0.4", notes: "", shots: [] },
      { id: uid(), title: "Звук прыжка обрезается", desc: "", priority: "low", status: "done", platform: "both", version: "v0.2", notes: "", shots: [] },
      { id: uid(), title: "Туториал: первые 30 секунд", desc: "Подсказки управления при первом запуске.", priority: "high", status: "todo", platform: "both", version: "v0.4", notes: "", shots: [] },
    ],
  },
  {
    id: uid(), name: "Tiny Kingdoms", build: "v0.2", archived: false,
    tasks: [
      { id: uid(), title: "Сохранение слетает при перезапуске", desc: "Прогресс не пишется на диск.", priority: "high", status: "todo", platform: "ios", version: "v0.2", notes: "Критично перед плейтестом.", shots: [] },
      { id: uid(), title: "Баланс золота на раннем этапе", desc: "", priority: "med", status: "check", platform: "both", version: "v0.2", notes: "", shots: [] },
      { id: uid(), title: "Иконки зданий не влезают в HUD", desc: "", priority: "low", status: "todo", platform: "android", version: "v0.1", notes: "", shots: [] },
    ],
  },
  {
    id: uid(), name: "Pixel Racer", build: "v0.1", archived: true,
    tasks: [
      { id: uid(), title: "Прототип заморожен", desc: "Вернёмся после Neon Dash.", priority: "low", status: "done", platform: "both", version: "v0.1", notes: "", shots: [] },
    ],
  },
];

const css = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap');

.pb, .pb * { box-sizing: border-box; }
.pb {
  --bg:#EEF0F5; --surface:#FFFFFF; --surface2:#F6F7FB; --ink:#14161F; --soft:#646B7E;
  --line:#E3E6EF; --accent:#5B4BE0; --accent-soft:#ECEAFD;
  --todo:#7C8499; --check:#D67E1E; --done:#16A06A;
  font-family:'Inter',system-ui,sans-serif; color:var(--ink); background:var(--bg);
  min-height:100%; -webkit-font-smoothing:antialiased;
}
.pb-wrap { max-width:1180px; margin:0 auto; padding:26px 22px 80px; }

.pb-top { display:flex; align-items:center; justify-content:space-between; gap:14px; margin-bottom:8px; }
.pb-brand { display:flex; align-items:baseline; gap:10px; }
.pb-logo { font-family:'Space Grotesk'; font-weight:700; font-size:22px; letter-spacing:-.02em; }
.pb-logo b { color:var(--accent); }
.pb-tag { font-family:'Space Mono'; font-size:11px; color:var(--soft); letter-spacing:.02em; padding:3px 7px; border:1px solid var(--line); border-radius:6px; background:var(--surface); }
.pb-sub { color:var(--soft); font-size:13.5px; margin:2px 0 24px; }

.pb-btn { font-family:'Inter'; font-weight:600; font-size:13.5px; border:1px solid var(--line); background:var(--surface); color:var(--ink); padding:9px 14px; border-radius:9px; cursor:pointer; transition:transform .12s ease, box-shadow .12s ease, background .12s ease; }
.pb-btn:hover { transform:translateY(-1px); box-shadow:0 4px 14px rgba(20,22,31,.08); }
.pb-btn.primary { background:var(--accent); color:#fff; border-color:var(--accent); }
.pb-btn.ghost { background:transparent; border-color:transparent; padding:8px 10px; color:var(--soft); }
.pb-btn.ghost:hover { color:var(--ink); box-shadow:none; transform:none; background:var(--surface2); }
.pb-btn.sm { padding:6px 10px; font-size:12.5px; }

.pb-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:14px; }
.pb-proj { position:relative; background:var(--surface); border:1px solid var(--line); border-radius:14px; padding:16px 16px 14px; cursor:pointer; transition:transform .14s ease, box-shadow .14s ease; overflow:hidden; }
.pb-proj:hover { transform:translateY(-3px); box-shadow:0 10px 26px rgba(20,22,31,.10); }
.pb-proj .accentbar { position:absolute; left:0; top:0; bottom:0; width:4px; background:var(--accent); }
.pb-proj h3 { font-family:'Space Grotesk'; font-weight:600; font-size:17px; margin:0 0 3px; letter-spacing:-.01em; }
.pb-meta { font-size:12px; color:var(--soft); display:flex; align-items:center; gap:8px; margin-bottom:14px; }
.pb-build { font-family:'Space Mono'; font-size:11px; color:var(--accent); background:var(--accent-soft); padding:2px 6px; border-radius:5px; }
.pb-prog { height:6px; background:var(--surface2); border-radius:99px; overflow:hidden; margin-bottom:7px; }
.pb-prog i { display:block; height:100%; background:var(--done); border-radius:99px; transition:width .3s ease; }
.pb-count { font-family:'Space Mono'; font-size:11px; color:var(--soft); }
.pb-arch-btn { position:absolute; top:10px; right:10px; opacity:0; border:none; background:var(--surface2); color:var(--soft); font-size:11px; padding:4px 8px; border-radius:7px; cursor:pointer; transition:opacity .12s; font-family:'Inter'; }
.pb-proj:hover .pb-arch-btn { opacity:1; }
.pb-arch-btn:hover { color:var(--ink); }

.pb-sectionhead { display:flex; align-items:center; gap:10px; margin:34px 0 14px; }
.pb-sectionhead h2 { font-family:'Space Grotesk'; font-weight:600; font-size:13px; text-transform:uppercase; letter-spacing:.08em; color:var(--soft); margin:0; }
.pb-sectionhead .rule { flex:1; height:1px; background:var(--line); }

/* project view */
.pb-back { display:inline-flex; align-items:center; gap:7px; color:var(--soft); cursor:pointer; font-size:13px; font-weight:500; margin-bottom:14px; }
.pb-back:hover { color:var(--ink); }
.pb-phead { display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap; margin-bottom:16px; }
.pb-ptitle { display:flex; align-items:center; gap:11px; }
.pb-ptitle h1 { font-family:'Space Grotesk'; font-weight:700; font-size:26px; margin:0; letter-spacing:-.02em; }
.pb-buildedit { font-family:'Space Mono'; font-size:12px; color:var(--accent); background:var(--accent-soft); border:1px solid transparent; padding:4px 8px; border-radius:6px; width:62px; cursor:text; }
.pb-buildedit:hover { border-color:var(--accent); }
.pb-buildedit:focus { outline:none; border-color:var(--accent); background:#fff; }
.pb-switch { display:inline-flex; background:var(--surface2); border:1px solid var(--line); border-radius:10px; padding:3px; gap:2px; }
.pb-switch button { border:none; background:transparent; font-family:'Inter'; font-weight:600; font-size:13px; color:var(--soft); padding:7px 14px; border-radius:7px; cursor:pointer; }
.pb-switch button.on { background:var(--surface); color:var(--ink); box-shadow:0 1px 3px rgba(20,22,31,.10); }
.pb-controls { display:flex; align-items:center; gap:10px; }

/* filter bar */
.pb-filterbar { display:flex; align-items:center; gap:10px; margin:0 0 18px; }
.pb-filterbar .lbl { font-family:'Space Mono'; font-size:11px; text-transform:uppercase; letter-spacing:.05em; color:var(--soft); }
.pb-chips { display:inline-flex; gap:6px; }
.pb-chip { border:1px solid var(--line); background:var(--surface); color:var(--soft); font-size:12.5px; font-weight:600; padding:5px 12px; border-radius:99px; cursor:pointer; font-family:'Inter'; }
.pb-chip.on { background:var(--ink); color:#fff; border-color:var(--ink); }

/* board */
.pb-board { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; align-items:start; }
.pb-col { background:var(--surface2); border:1px solid var(--line); border-radius:14px; padding:12px; min-height:120px; transition:background .12s, border-color .12s; }
.pb-col.over { background:var(--accent-soft); border-color:var(--accent); }
.pb-colhead { display:flex; align-items:center; justify-content:space-between; margin:2px 4px 12px; }
.pb-colhead .name { display:flex; align-items:center; gap:8px; font-family:'Space Grotesk'; font-weight:600; font-size:13.5px; }
.pb-dot { width:9px; height:9px; border-radius:99px; }
.pb-colcount { font-family:'Space Mono'; font-size:11px; color:var(--soft); }
.pb-card { background:var(--surface); border:1px solid var(--line); border-radius:11px; padding:11px 12px; margin-bottom:9px; cursor:grab; transition:transform .12s ease, box-shadow .12s ease; }
.pb-card:hover { transform:translateY(-2px); box-shadow:0 6px 16px rgba(20,22,31,.09); }
.pb-card:active { cursor:grabbing; }
.pb-card h4 { font-size:13.5px; font-weight:600; margin:0 0 7px; line-height:1.35; }
.pb-cardfoot { display:flex; align-items:center; gap:7px; }
.pb-prio { font-size:11px; font-weight:600; padding:2px 8px; border-radius:99px; }
.pb-prio.high { color:#B23636; background:#FBE7E7; }
.pb-prio.med { color:#9A6711; background:#FBF1DC; }
.pb-prio.low { color:#4B5566; background:#EDEFF5; }
.pb-plat { font-size:10.5px; font-weight:700; padding:2px 7px; border-radius:5px; font-family:'Space Mono'; letter-spacing:.01em; }
.pb-plat.ios { color:#2C5BB5; background:#E5ECF9; }
.pb-plat.android { color:#1C7A4A; background:#E1F2E8; }
.pb-ver { font-family:'Space Mono'; font-size:10.5px; color:var(--soft); }
.pb-shot { font-family:'Space Mono'; font-size:11px; color:var(--soft); display:inline-flex; align-items:center; gap:3px; }
.pb-addtask { width:100%; border:1px dashed var(--line); background:transparent; color:var(--soft); padding:9px; border-radius:10px; cursor:pointer; font-family:'Inter'; font-size:13px; font-weight:500; }
.pb-addtask:hover { color:var(--accent); border-color:var(--accent); }

/* list */
.pb-list { background:var(--surface); border:1px solid var(--line); border-radius:14px; overflow:hidden; }
.pb-row { display:grid; grid-template-columns:1fr 96px 72px 116px 150px; align-items:center; gap:12px; padding:13px 16px; border-bottom:1px solid var(--line); cursor:pointer; transition:background .1s; }
.pb-row:last-child { border-bottom:none; }
.pb-row:hover { background:var(--surface2); }
.pb-row.header { background:var(--surface2); font-family:'Space Mono'; font-size:11px; letter-spacing:.04em; color:var(--soft); text-transform:uppercase; cursor:default; }
.pb-row.header:hover { background:var(--surface2); }
.pb-rowtitle b { font-weight:600; font-size:13.5px; }
.pb-rowtitle .sub { display:block; font-size:12px; color:var(--soft); margin-top:2px; }
.pb-select { font-family:'Inter'; font-size:12.5px; font-weight:600; border:1px solid var(--line); border-radius:8px; padding:5px 7px; background:var(--surface); color:var(--ink); cursor:pointer; }

/* panel */
.pb-scrim { position:fixed; inset:0; background:rgba(15,17,26,.32); z-index:40; animation:pbfade .15s ease; }
@keyframes pbfade { from { opacity:0 } to { opacity:1 } }
.pb-panel { position:fixed; top:0; right:0; bottom:0; width:min(440px,92vw); background:var(--surface); z-index:50; box-shadow:-12px 0 40px rgba(15,17,26,.18); padding:24px; overflow-y:auto; animation:pbslide .2s ease; }
@keyframes pbslide { from { transform:translateX(30px); opacity:.4 } to { transform:translateX(0); opacity:1 } }
.pb-panel .x { float:right; border:none; background:var(--surface2); width:30px; height:30px; border-radius:8px; cursor:pointer; color:var(--soft); font-size:15px; }
.pb-field { margin-bottom:18px; }
.pb-field label { display:block; font-family:'Space Mono'; font-size:11px; text-transform:uppercase; letter-spacing:.05em; color:var(--soft); margin-bottom:7px; }
.pb-input, .pb-area { width:100%; font-family:'Inter'; font-size:14px; border:1px solid var(--line); border-radius:9px; padding:10px 11px; color:var(--ink); background:var(--surface); resize:vertical; }
.pb-input:focus, .pb-area:focus { outline:none; border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-soft); }
.pb-input.mono { font-family:'Space Mono'; width:120px; }
.pb-titleinput { font-family:'Space Grotesk'; font-weight:600; font-size:18px; border:none; width:100%; padding:0; margin:6px 0 16px; color:var(--ink); }
.pb-titleinput:focus { outline:none; }
.pb-seg { display:flex; gap:6px; flex-wrap:wrap; }
.pb-seg button { border:1px solid var(--line); background:var(--surface); padding:7px 12px; border-radius:8px; font-family:'Inter'; font-weight:600; font-size:12.5px; color:var(--soft); cursor:pointer; }
.pb-seg button.on { color:#fff; }
.pb-seg button.on.s-todo { background:var(--todo); border-color:var(--todo); }
.pb-seg button.on.s-check { background:var(--check); border-color:var(--check); }
.pb-seg button.on.s-done { background:var(--done); border-color:var(--done); }
.pb-seg button.on.p-high { background:#B23636; border-color:#B23636; }
.pb-seg button.on.p-med { background:#C7891C; border-color:#C7891C; }
.pb-seg button.on.p-low { background:#5B6373; border-color:#5B6373; }
.pb-seg button.on.f-both { background:var(--ink); border-color:var(--ink); }
.pb-seg button.on.f-ios { background:#2C5BB5; border-color:#2C5BB5; }
.pb-seg button.on.f-android { background:#1C7A4A; border-color:#1C7A4A; }
.pb-shots { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
.pb-shotthumb { position:relative; aspect-ratio:4/3; border-radius:9px; overflow:hidden; border:1px solid var(--line); background:var(--surface2); }
.pb-shotthumb img { width:100%; height:100%; object-fit:cover; }
.pb-shotthumb button { position:absolute; top:4px; right:4px; border:none; background:rgba(15,17,26,.6); color:#fff; width:20px; height:20px; border-radius:6px; cursor:pointer; font-size:12px; }
.pb-shotadd { border:1px dashed var(--line); border-radius:9px; aspect-ratio:4/3; display:flex; align-items:center; justify-content:center; color:var(--soft); cursor:pointer; font-size:12px; text-align:center; padding:6px; }
.pb-shotadd:hover { color:var(--accent); border-color:var(--accent); }
.pb-paneldelete { color:#B23636; background:transparent; border:none; font-family:'Inter'; font-weight:600; font-size:13px; cursor:pointer; margin-top:6px; }

/* modal */
.pb-modal { position:fixed; z-index:50; top:50%; left:50%; transform:translate(-50%,-50%); width:min(380px,92vw); background:var(--surface); border-radius:16px; padding:22px; box-shadow:0 20px 60px rgba(15,17,26,.28); animation:pbpop .16s ease; }
@keyframes pbpop { from { transform:translate(-50%,-46%); opacity:.5 } to { transform:translate(-50%,-50%); opacity:1 } }
.pb-modal h3 { font-family:'Space Grotesk'; font-weight:700; font-size:17px; margin:0 0 16px; }
.pb-modalfoot { display:flex; justify-content:flex-end; gap:8px; margin-top:18px; }

.pb-empty { text-align:center; color:var(--soft); padding:40px 16px; font-size:13.5px; }

@media (max-width:720px){
  .pb-board{ grid-template-columns:1fr; }
  .pb-row{ grid-template-columns:1fr 130px; }
  .pb-row .col-plat,.pb-row .col-ver,.pb-row .col-prio{ display:none; }
}
@media (prefers-reduced-motion: reduce){ .pb *,.pb *::before { animation:none!important; transition:none!important; } }
`;

const statusColor = { todo: "var(--todo)", check: "var(--check)", done: "var(--done)" };

export default function Protoboard() {
  const [projects, setProjects] = useState(seed);
  const [openId, setOpenId] = useState(null);
  const [view, setView] = useState("board");
  const [taskId, setTaskId] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [newProj, setNewProj] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [platFilter, setPlatFilter] = useState("all");
  const dragId = useRef(null);
  const fileRef = useRef(null);

  const project = projects.find((p) => p.id === openId) || null;
  const task = project?.tasks.find((t) => t.id === taskId) || null;

  const updateProject = (id, fn) =>
    setProjects((ps) => ps.map((p) => (p.id === id ? fn(p) : p)));
  const updateTask = (pid, tid, fn) =>
    updateProject(pid, (p) => ({ ...p, tasks: p.tasks.map((t) => (t.id === tid ? fn(t) : t)) }));

  const addTask = (status = "todo") => {
    const t = { id: uid(), title: "Новая задача", desc: "", priority: "med", status, platform: "both", version: project.build, notes: "", shots: [] };
    updateProject(openId, (p) => ({ ...p, tasks: [...p.tasks, t] }));
    setTaskId(t.id);
  };

  const moveTask = (tid, status) => updateTask(openId, tid, (t) => ({ ...t, status }));
  const deleteTask = (tid) => {
    updateProject(openId, (p) => ({ ...p, tasks: p.tasks.filter((t) => t.id !== tid) }));
    setTaskId(null);
  };

  const onDrop = (status) => {
    if (dragId.current) moveTask(dragId.current, status);
    dragId.current = null;
    setDragOver(null);
  };

  const onAddShots = (e) => {
    const files = Array.from(e.target.files || []);
    const shots = files.map((f) => ({ id: uid(), name: f.name, url: URL.createObjectURL(f) }));
    updateTask(openId, taskId, (t) => ({ ...t, shots: [...t.shots, ...shots] }));
    e.target.value = "";
  };

  const createProject = () => {
    const name = (newProj.name || "").trim();
    if (!name) return;
    const p = { id: uid(), name, build: "v0.1", archived: false, tasks: [] };
    setProjects((ps) => [p, ...ps]);
    setNewProj(null);
  };

  const matchPlat = (t) => platFilter === "all" || t.platform === platFilter || t.platform === "both";

  const active = projects.filter((p) => !p.archived);
  const archived = projects.filter((p) => p.archived);
  const visible = project ? project.tasks.filter(matchPlat) : [];

  return (
    <div className="pb">
      <style>{css}</style>
      <div className="pb-wrap">
        {!project ? (
          <>
            <div className="pb-top">
              <div className="pb-brand">
                <span className="pb-logo">Proto<b>board</b></span>
                <span className="pb-tag">прототип · этап 1</span>
              </div>
              <button className="pb-btn primary" onClick={() => setNewProj({ name: "" })}>+ Новый проект</button>
            </div>
            <p className="pb-sub">Трекер задач и багов по прототипам мобильных игр. Каждый проект — отдельный прототип в разработке.</p>

            <div className="pb-grid">
              {active.map((p) => {
                const total = p.tasks.length;
                const done = p.tasks.filter((t) => t.status === "done").length;
                const pct = total ? Math.round((done / total) * 100) : 0;
                return (
                  <div key={p.id} className="pb-proj" onClick={() => { setOpenId(p.id); setView("board"); setPlatFilter("all"); }}>
                    <span className="accentbar" />
                    <button className="pb-arch-btn" onClick={(e) => { e.stopPropagation(); updateProject(p.id, (x) => ({ ...x, archived: true })); }}>В архив</button>
                    <h3>{p.name}</h3>
                    <div className="pb-meta"><span className="pb-build">{p.build}</span> · {total} задач</div>
                    <div className="pb-prog"><i style={{ width: pct + "%" }} /></div>
                    <div className="pb-count">{done}/{total} готово · {pct}%</div>
                  </div>
                );
              })}
              {active.length === 0 && <div className="pb-empty">Пока нет активных проектов. Создай первый прототип.</div>}
            </div>

            {archived.length > 0 && (
              <>
                <div className="pb-sectionhead">
                  <h2>Архив ({archived.length})</h2>
                  <span className="rule" />
                  <button className="pb-btn ghost sm" onClick={() => setShowArchived((s) => !s)}>{showArchived ? "Скрыть" : "Показать"}</button>
                </div>
                {showArchived && (
                  <div className="pb-grid">
                    {archived.map((p) => (
                      <div key={p.id} className="pb-proj" style={{ opacity: .68 }} onClick={() => { setOpenId(p.id); setView("board"); setPlatFilter("all"); }}>
                        <button className="pb-arch-btn" onClick={(e) => { e.stopPropagation(); updateProject(p.id, (x) => ({ ...x, archived: false })); }}>Вернуть</button>
                        <h3>{p.name}</h3>
                        <div className="pb-meta"><span className="pb-build">{p.build}</span> · {p.tasks.length} задач</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <>
            <div className="pb-back" onClick={() => { setOpenId(null); setTaskId(null); }}>← Все проекты</div>
            <div className="pb-phead">
              <div className="pb-ptitle">
                <h1>{project.name}</h1>
                <input
                  className="pb-buildedit"
                  value={project.build}
                  title="Версия проекта — можно менять"
                  onChange={(e) => updateProject(openId, (p) => ({ ...p, build: e.target.value }))}
                />
              </div>
              <div className="pb-controls">
                <div className="pb-switch">
                  <button className={view === "board" ? "on" : ""} onClick={() => setView("board")}>Доска</button>
                  <button className={view === "list" ? "on" : ""} onClick={() => setView("list")}>Список</button>
                </div>
                <button className="pb-btn primary" onClick={() => addTask("todo")}>+ Задача</button>
              </div>
            </div>

            <div className="pb-filterbar">
              <span className="lbl">Платформа</span>
              <div className="pb-chips">
                <button className={"pb-chip" + (platFilter === "all" ? " on" : "")} onClick={() => setPlatFilter("all")}>Все</button>
                <button className={"pb-chip" + (platFilter === "ios" ? " on" : "")} onClick={() => setPlatFilter("ios")}>iOS</button>
                <button className={"pb-chip" + (platFilter === "android" ? " on" : "")} onClick={() => setPlatFilter("android")}>Android</button>
              </div>
            </div>

            {view === "board" ? (
              <div className="pb-board">
                {STATUSES.map((s) => {
                  const items = visible.filter((t) => t.status === s.key);
                  return (
                    <div
                      key={s.key}
                      className={"pb-col" + (dragOver === s.key ? " over" : "")}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(s.key); }}
                      onDragLeave={() => setDragOver((d) => (d === s.key ? null : d))}
                      onDrop={() => onDrop(s.key)}
                    >
                      <div className="pb-colhead">
                        <span className="name"><span className="pb-dot" style={{ background: statusColor[s.key] }} />{s.label}</span>
                        <span className="pb-colcount">{items.length}</span>
                      </div>
                      {items.map((t) => (
                        <div
                          key={t.id}
                          className="pb-card"
                          draggable
                          onDragStart={() => { dragId.current = t.id; }}
                          onClick={() => setTaskId(t.id)}
                        >
                          <h4>{t.title}</h4>
                          <div className="pb-cardfoot">
                            <span className={"pb-prio " + t.priority}>{PRIORITIES.find((p) => p.key === t.priority).label}</span>
                            {t.platform !== "both" && <span className={"pb-plat " + t.platform}>{platLabel(t.platform)}</span>}
                            <span style={{ flex: 1 }} />
                            <span className="pb-ver">{t.version}</span>
                            {t.shots.length > 0 && <span className="pb-shot">▦ {t.shots.length}</span>}
                          </div>
                        </div>
                      ))}
                      <button className="pb-addtask" onClick={() => addTask(s.key)}>+ Добавить</button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="pb-list">
                <div className="pb-row header">
                  <span>Задача</span>
                  <span className="col-plat">Платформа</span>
                  <span className="col-ver">Версия</span>
                  <span className="col-prio">Приоритет</span>
                  <span>Статус</span>
                </div>
                {visible.length === 0 && <div className="pb-empty">Нет задач под этот фильтр.</div>}
                {visible.map((t) => (
                  <div key={t.id} className="pb-row" onClick={() => setTaskId(t.id)}>
                    <div className="pb-rowtitle">
                      <b>{t.title}</b>
                      {t.desc && <span className="sub">{t.desc}</span>}
                    </div>
                    <span className="col-plat">{t.platform === "both" ? <span style={{ color: "var(--soft)", fontSize: 12.5 }}>Общая</span> : <span className={"pb-plat " + t.platform}>{platLabel(t.platform)}</span>}</span>
                    <span className="col-ver pb-ver">{t.version}</span>
                    <span className="col-prio"><span className={"pb-prio " + t.priority}>{PRIORITIES.find((p) => p.key === t.priority).label}</span></span>
                    <span onClick={(e) => e.stopPropagation()}>
                      <select className="pb-select" value={t.status} onChange={(e) => moveTask(t.id, e.target.value)}>
                        {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                      </select>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* task panel */}
      {task && (
        <>
          <div className="pb-scrim" onClick={() => setTaskId(null)} />
          <div className="pb-panel">
            <button className="x" onClick={() => setTaskId(null)}>✕</button>
            <input
              className="pb-titleinput"
              value={task.title}
              onChange={(e) => updateTask(openId, taskId, (t) => ({ ...t, title: e.target.value }))}
            />
            <div className="pb-field">
              <label>Статус</label>
              <div className="pb-seg">
                {STATUSES.map((s) => (
                  <button key={s.key} className={(task.status === s.key ? "on s-" + s.key : "")} onClick={() => moveTask(taskId, s.key)}>{s.label}</button>
                ))}
              </div>
            </div>
            <div className="pb-field">
              <label>Приоритет</label>
              <div className="pb-seg">
                {PRIORITIES.map((p) => (
                  <button key={p.key} className={(task.priority === p.key ? "on p-" + p.key : "")} onClick={() => updateTask(openId, taskId, (t) => ({ ...t, priority: p.key }))}>{p.label}</button>
                ))}
              </div>
            </div>
            <div className="pb-field">
              <label>Платформа</label>
              <div className="pb-seg">
                {PLATFORMS.map((p) => (
                  <button key={p.key} className={(task.platform === p.key ? "on f-" + p.key : "")} onClick={() => updateTask(openId, taskId, (t) => ({ ...t, platform: p.key }))}>{p.label}</button>
                ))}
              </div>
            </div>
            <div className="pb-field">
              <label>Версия (билд)</label>
              <input className="pb-input mono" value={task.version} placeholder="v0.4" onChange={(e) => updateTask(openId, taskId, (t) => ({ ...t, version: e.target.value }))} />
            </div>
            <div className="pb-field">
              <label>Описание</label>
              <textarea className="pb-area" rows={3} value={task.desc} placeholder="Что нужно сделать или что за баг…" onChange={(e) => updateTask(openId, taskId, (t) => ({ ...t, desc: e.target.value }))} />
            </div>
            <div className="pb-field">
              <label>Доп. условия / инфо</label>
              <textarea className="pb-area" rows={2} value={task.notes} placeholder="Устройство, шаги воспроизведения…" onChange={(e) => updateTask(openId, taskId, (t) => ({ ...t, notes: e.target.value }))} />
            </div>
            <div className="pb-field">
              <label>Скриншоты ({task.shots.length})</label>
              <div className="pb-shots">
                {task.shots.map((s) => (
                  <div key={s.id} className="pb-shotthumb">
                    <img src={s.url} alt={s.name} />
                    <button onClick={() => updateTask(openId, taskId, (t) => ({ ...t, shots: t.shots.filter((x) => x.id !== s.id) }))}>✕</button>
                  </div>
                ))}
                <div className="pb-shotadd" onClick={() => fileRef.current?.click()}>+ Добавить скриншот</div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={onAddShots} />
            </div>
            <button className="pb-paneldelete" onClick={() => deleteTask(taskId)}>Удалить задачу</button>
          </div>
        </>
      )}

      {/* new project modal */}
      {newProj && (
        <>
          <div className="pb-scrim" onClick={() => setNewProj(null)} />
          <div className="pb-modal">
            <h3>Новый прототип</h3>
            <div className="pb-field">
              <label>Название</label>
              <input className="pb-input" autoFocus value={newProj.name} placeholder="Напр. Neon Dash" onChange={(e) => setNewProj((n) => ({ ...n, name: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && createProject()} />
            </div>
            <div className="pb-modalfoot">
              <button className="pb-btn" onClick={() => setNewProj(null)}>Отмена</button>
              <button className="pb-btn primary" onClick={createProject}>Создать</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
