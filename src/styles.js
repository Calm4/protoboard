// Все стили интерфейса. Перенесены из прототипа БЕЗ изменений —
// внешний вид остаётся прежним. Подключаются один раз в App через <style>.
export const css = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap');

.pb, .pb * { box-sizing: border-box; }
.pb {
  --bg:#EEF0F5; --surface:#FFFFFF; --surface2:#F6F7FB; --ink:#14161F; --soft:#646B7E;
  --line:#E3E6EF; --accent:#5B4BE0; --accent-soft:#ECEAFD;
  --todo:#7C8499; --check:#D67E1E; --done:#16A06A;
  /* Алиасы для новых компонентов */
  --panel:var(--surface); --text:var(--ink); --c-muted:var(--soft);
  font-family:'Inter',system-ui,sans-serif; color:var(--ink); background:var(--bg);
  min-height:100dvh; -webkit-font-smoothing:antialiased;
}

/* ── Тёмная тема ─────────────────────────────────────────────────────────── */
.pb.dark {
  --bg:#15161E; --surface:#1F2233; --surface2:#191B29;
  --ink:#E5E8F5; --soft:#7A82A0; --line:#2B2E45;
  --accent:#7B6CF0; --accent-soft:rgba(123,108,240,.18);
  --panel:#1F2233; --text:#E5E8F5; --c-muted:#7A82A0;
}
.pb.dark .pb-btn { box-shadow:none; }
.pb.dark .pb-btn:hover { box-shadow:0 4px 14px rgba(0,0,0,.3); }
.pb.dark .pb-proj:hover { box-shadow:0 10px 26px rgba(0,0,0,.35); }
.pb.dark .pb-card { box-shadow:0 1px 4px rgba(0,0,0,.25); }
.pb.dark .pb-lightbox { background:rgba(0,0,0,.92); }
.pb.dark .pb-panel { box-shadow:-8px 0 32px rgba(0,0,0,.4); }
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
.pb-buildedit { font-family:'Space Mono'; font-size:13px; color:var(--accent); background:var(--accent-soft); border:1px solid transparent; padding:7px 12px; border-radius:8px; min-width:80px; max-width:120px; cursor:text; }
.pb-buildedit:hover { border-color:var(--accent); }
.pb-buildedit:focus { outline:none; border-color:var(--accent); background:#fff; }
.pb-switch { display:inline-flex; background:var(--surface2); border:1px solid var(--line); border-radius:10px; padding:3px; gap:2px; }
.pb-switch button { border:none; background:transparent; font-family:'Inter'; font-weight:600; font-size:13px; color:var(--soft); padding:7px 14px; border-radius:7px; cursor:pointer; }
.pb-switch button.on { background:var(--surface); color:var(--ink); box-shadow:0 1px 3px rgba(20,22,31,.10); }
.pb-controls { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.pb-controls-sep { width:1px; height:22px; background:var(--line); flex-shrink:0; }
.pb-search { display:inline-flex; align-items:center; gap:6px; background:var(--surface); border:1px solid var(--line); border-radius:9px; padding:0 8px; height:36px; }
.pb-search:focus-within { border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-soft); }
.pb-search-ic { color:var(--soft); font-size:16px; line-height:1; }
.pb-search input { border:none; outline:none; background:transparent; font-family:'Inter'; font-size:13.5px; color:var(--ink); width:160px; }
.pb-search-x { border:none; background:transparent; color:var(--soft); cursor:pointer; font-size:12px; padding:2px 2px; }
.pb-search-x:hover { color:var(--ink); }

/* плашка версии (обводка, без выпадашки) */
.pb-verchip { font-family:'Space Mono'; font-size:10.5px; color:var(--soft); border:1px solid var(--line); border-radius:5px; padding:1px 6px; white-space:nowrap; display:inline-block; }

/* номер задачи (id для багов) + ссылка */
.pb-num { font-family:'Space Mono'; font-size:10.5px; font-weight:700; color:var(--accent); background:var(--accent-soft); border-radius:5px; padding:1px 6px; white-space:nowrap; display:inline-block; }
.pb-rowtitle .pb-num { margin-right:6px; }
.pb-taskid { display:flex; align-items:center; gap:10px; margin-bottom:6px; }
.pb-copylink { border:1px solid var(--line); background:var(--surface); color:var(--soft); font-family:'Inter'; font-weight:600; font-size:12px; padding:5px 10px; border-radius:8px; cursor:pointer; }
.pb-copylink:hover { color:var(--accent); border-color:var(--accent); }

/* подсветка места вставки при перетаскивании */
.pb-card.dropbefore { box-shadow:inset 0 3px 0 0 var(--accent); }
.pb-row.dropbefore { box-shadow:inset 0 2px 0 0 var(--accent); }

/* filter bar */
.pb-filterbar { display:flex; align-items:center; gap:10px; margin:0 0 18px; }
.pb-filterbar .lbl { font-family:'Space Mono'; font-size:11px; text-transform:uppercase; letter-spacing:.05em; color:var(--soft); }
.pb-chips { display:inline-flex; gap:6px; }
.pb-chip { border:1px solid var(--line); background:var(--surface); color:var(--soft); font-size:12.5px; font-weight:600; padding:5px 12px; border-radius:99px; cursor:pointer; font-family:'Inter'; }
.pb-chip.on { background:var(--ink); color:#fff; border-color:var(--ink); }

/* Панель фильтров (кнопка «Фильтры» + всплывающая панель) */
.pb-filterwrap { position:relative; display:inline-block; }
.pb-filterpop { position:absolute; top:42px; left:0; z-index:31; width:300px; background:var(--surface); border:1px solid var(--line); border-radius:12px; padding:14px; box-shadow:0 12px 30px rgba(20,22,31,.16); display:flex; flex-direction:column; gap:12px; }
.pb-filterpop .pb-chips { flex-wrap:wrap; }
.pb-frow { display:flex; align-items:center; justify-content:space-between; gap:10px; }
.pb-frow.col { flex-direction:column; align-items:stretch; gap:8px; }
.pb-frow .lbl { font-family:'Space Mono'; font-size:11px; text-transform:uppercase; letter-spacing:.05em; color:var(--soft); }
.pb-frow .pb-select { min-width:150px; }
.pb-fnum { font-family:'Inter'; font-size:12.5px; border:1px solid var(--line); border-radius:8px; padding:5px 8px; background:var(--surface); color:var(--ink); width:96px; outline:none; }
.pb-fnum:focus { border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-soft); }
.pb-daterow { display:flex; align-items:center; gap:8px; }
.pb-daterow .pb-select { flex:1; min-width:0; }
.pb-daterow .dash { color:var(--soft); }
.pb-ffoot { display:flex; justify-content:space-between; gap:8px; border-top:1px solid var(--line); padding-top:12px; }
.pb-fcount { font-family:'Space Mono'; font-size:11px; color:var(--soft); }
.pb-btn:disabled { opacity:.45; cursor:default; box-shadow:none; transform:none; }

/* board */
.pb-board-topscroll { overflow-x:auto; overflow-y:hidden; }
.pb-board-topscroll > div { height:1px; }
.pb-board { display:flex; gap:14px; align-items:stretch; overflow-x:auto; padding-bottom:8px; }
.pb-col { position:relative; flex:1 1 0; min-width:200px; background:var(--surface2); border:1px solid var(--line); border-radius:14px; padding:12px; min-height:120px; transition:background .12s, border-color .12s; }
.pb-col.over { background:var(--accent-soft); border-color:var(--accent); }
.pb-colhead { display:flex; align-items:center; gap:8px; margin:2px 4px 12px; cursor:grab; }
.pb-colhead:active { cursor:grabbing; }
.pb-colhead .name { flex:1; min-width:0; }
.pb-colhead .name .lbl { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.pb-colmenu-btn { border:none; background:transparent; color:var(--soft); cursor:pointer; font-size:16px; line-height:1; padding:2px 6px; border-radius:6px; }
.pb-colmenu-btn:hover { background:var(--surface); color:var(--ink); }
.pb-colmenu-scrim { position:fixed; inset:0; z-index:20; }
.pb-colmenu { position:absolute; top:40px; right:8px; left:8px; z-index:21; background:var(--surface); border:1px solid var(--line); border-radius:12px; padding:12px; box-shadow:0 12px 30px rgba(20,22,31,.16); }
.pb-colmenu-lbl { display:block; font-family:'Space Mono'; font-size:11px; text-transform:uppercase; letter-spacing:.05em; color:var(--soft); margin:0 0 6px; }
.pb-colmenu .pb-input { margin-bottom:12px; }
.pb-colmenu-del { margin-top:12px; width:100%; border:1px solid var(--line); background:transparent; color:#B23636; font-family:'Inter'; font-weight:600; font-size:12.5px; padding:8px; border-radius:8px; cursor:pointer; }
.pb-colmenu-del:hover { background:#FBE7E7; border-color:#F2C9C9; }
.pb-addcol { flex:0 0 46px; align-self:stretch; border:1px dashed var(--line); background:transparent; color:var(--soft); border-radius:12px; cursor:pointer; font-family:'Inter'; font-size:13px; font-weight:600; writing-mode:vertical-rl; transform:rotate(180deg); padding:14px 0; }
.pb-addcol:hover { color:var(--accent); border-color:var(--accent); }
.pb-colhead .name { display:flex; align-items:center; gap:8px; font-family:'Space Grotesk'; font-weight:600; font-size:13.5px; }
.pb-dot { width:9px; height:9px; border-radius:99px; }
.pb-colcount { font-family:'Space Mono'; font-size:11px; color:var(--soft); }
.pb-card { background:var(--surface); border:1px solid var(--line); border-radius:11px; padding:11px 12px; margin-bottom:9px; cursor:grab; transition:transform .12s ease, box-shadow .12s ease; }
.pb-card:hover { transform:translateY(-2px); box-shadow:0 6px 16px rgba(20,22,31,.09); }
.pb-card:active { cursor:grabbing; }
.pb-card h4 { font-size:13.5px; font-weight:600; margin:0 0 7px; line-height:1.35; white-space:pre-wrap; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }
.pb-cardfoot { display:flex; align-items:center; gap:7px; flex-wrap:wrap; }
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
.pb-row { display:grid; grid-template-columns:1fr 96px 96px 116px 150px; align-items:flex-start; gap:12px; padding:13px 16px; border-bottom:1px solid var(--line); cursor:pointer; transition:background .1s; }
.pb-row.header { align-items:center; }
.pb-row:last-child { border-bottom:none; }
.pb-row:hover { background:var(--surface2); }
.pb-row.header { background:var(--surface2); font-family:'Space Mono'; font-size:11px; letter-spacing:.04em; color:var(--soft); text-transform:uppercase; cursor:default; }
.pb-row.header:hover { background:var(--surface2); }
.pb-row.header .pb-sortable { cursor:pointer; user-select:none; white-space:nowrap; transition:color .12s ease; }
.pb-row.header .pb-sortable:hover { color:var(--ink); }
.pb-row.header .pb-sortable.active { color:var(--accent); }
.pb-row.group { display:flex; align-items:center; gap:8px; background:var(--surface2); cursor:default; padding:11px 16px; border-bottom:1px solid var(--line); }
.pb-row.group:hover { background:var(--surface2); }
.pb-row.group .gdot { width:9px; height:9px; border-radius:99px; }
.pb-row.group .gname { font-family:'Space Grotesk'; font-weight:700; font-size:13px; flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.pb-row.group .gcount { font-family:'Space Mono'; font-size:11px; color:var(--soft); }
.pb-row.group .pb-colmenu-btn { flex:0 0 auto; }
.pb-listgroup { position:relative; transition:background .12s; }
/* Явный «зазор» между группами, чтобы было видно, где одна кончается и начинается другая */
.pb-listgroup + .pb-listgroup { border-top:5px solid var(--bg); }
/* Мягкая заливка всей строки по цвету её статуса (--tint задаётся в TaskList) */
.pb-listgroup .pb-row:not(.group) { background:var(--tint, transparent); }
.pb-listgroup .pb-row:not(.group):hover { background:var(--surface2); }
.pb-listgroup.over .pb-row:not(.group) { background:transparent; }
.pb-colmenu.inlist { left:auto; right:10px; width:240px; top:38px; }
.pb-addstatus { display:block; width:100%; border:none; border-top:1px solid var(--line); background:transparent; color:var(--soft); padding:12px; cursor:pointer; font-family:'Inter'; font-size:13px; font-weight:600; }
.pb-addstatus:hover { color:var(--accent); }
.pb-listgroup.over { background:var(--accent-soft); box-shadow:inset 0 0 0 2px var(--accent); }
.pb-listgroup.over .pb-row { background:transparent; }
.pb-listempty { padding:11px 16px; color:var(--soft); font-size:12.5px; border-bottom:1px solid var(--line); }
.pb-listgroup:last-child .pb-listempty { border-bottom:none; }
.pb-list .pb-row[draggable="true"] { cursor:grab; }
.pb-list .pb-row[draggable="true"]:active { cursor:grabbing; }
.pb-rowtitle b { font-weight:600; font-size:13.5px; white-space:pre-wrap; word-break:break-word; }
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
.pb-area { max-height:260px; overflow-y:auto; }
.pb-input:focus, .pb-area:focus { outline:none; border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-soft); }
.pb-input.mono { font-family:'Space Mono'; width:120px; }
.pb-titleinput { font-family:'Space Grotesk'; font-weight:600; font-size:18px; border:none; width:100%; padding:0; margin:6px 0 16px; color:var(--ink); }
.pb-titleinput:focus { outline:none; }
.pb-titlearea { font-family:'Space Grotesk'; font-weight:600; font-size:18px; line-height:1.35; border:1px solid transparent; border-radius:8px; width:100%; padding:6px 8px; margin:6px -8px 16px; color:var(--ink); background:transparent; resize:vertical; min-height:54px; max-height:340px; overflow-y:auto; }
.pb-titlearea:hover { border-color:var(--line); }
.pb-titlearea:focus { outline:none; border-color:var(--accent); background:#fff; box-shadow:0 0 0 3px var(--accent-soft); }
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
.pb-shotthumb img { width:100%; height:100%; object-fit:cover; cursor:zoom-in; }
.pb-shotthumb.uploading img { opacity:.5; cursor:default; }
.pb-shotthumb button { position:absolute; top:4px; right:4px; border:none; background:rgba(15,17,26,.6); color:#fff; width:20px; height:20px; border-radius:6px; cursor:pointer; font-size:12px; }
.pb-shotspinner { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:22px; color:#fff; animation:pbspin 1s linear infinite; }
@keyframes pbspin { to { transform:rotate(360deg); } }
.pb-shotadd { border:1px dashed var(--line); border-radius:9px; aspect-ratio:4/3; display:flex; align-items:center; justify-content:center; color:var(--soft); cursor:pointer; font-size:12px; text-align:center; padding:6px; }
.pb-shotadd:hover { color:var(--accent); border-color:var(--accent); }
.pb-paneldelete { color:#B23636; background:transparent; border:none; font-family:'Inter'; font-weight:600; font-size:13px; cursor:pointer; margin-top:6px; }

/* редактируемое название проекта (в шапке) */
.pb-nameedit { font-family:'Space Grotesk'; font-weight:700; font-size:26px; letter-spacing:-.02em; color:var(--ink); border:1px solid transparent; background:transparent; border-radius:8px; padding:2px 6px; margin:-2px -6px; cursor:text; }
.pb-nameedit:hover { border-color:var(--line); }
.pb-nameedit:focus { outline:none; border-color:var(--accent); background:#fff; }

/* выбор цвета проекта */
.pb-swatches { display:flex; flex-wrap:wrap; gap:8px; }
.pb-swatch { width:24px; height:24px; border-radius:50%; border:2px solid transparent; box-shadow:0 0 0 1px rgba(20,22,31,.10) inset; cursor:pointer; padding:0; transition:transform .1s; }
.pb-swatch:hover { transform:scale(1.12); }
.pb-swatch.on { border-color:var(--ink); }
.pb-colorwrap { position:relative; display:inline-flex; align-items:center; }
.pb-colordot { width:20px; height:20px; border-radius:50%; border:2px solid #fff; box-shadow:0 0 0 1px var(--line); cursor:pointer; padding:0; }
.pb-colorscrim { position:fixed; inset:0; z-index:30; }
.pb-colorpop { position:absolute; top:30px; left:0; z-index:31; background:var(--surface); border:1px solid var(--line); border-radius:12px; padding:12px; box-shadow:0 12px 30px rgba(20,22,31,.16); width:200px; }

/* просмотр скриншота в полном размере */
.pb-lightbox { position:fixed; inset:0; background:rgba(15,17,26,.82); z-index:60; display:flex; align-items:center; justify-content:center; padding:32px; cursor:zoom-out; animation:pbfade .15s ease; }
.pb-lightbox img { max-width:92vw; max-height:92vh; border-radius:10px; box-shadow:0 20px 60px rgba(0,0,0,.5); }
.pb-lightbox .dl { position:fixed; top:20px; right:20px; z-index:61; border:none; background:rgba(255,255,255,.92); color:var(--ink); font-family:'Inter'; font-weight:600; font-size:13px; padding:9px 14px; border-radius:9px; cursor:pointer; box-shadow:0 4px 14px rgba(0,0,0,.25); }
.pb-lightbox .dl:hover { background:#fff; }

/* modal */
.pb-modal { position:fixed; z-index:50; top:50%; left:50%; transform:translate(-50%,-50%); width:min(380px,92vw); background:var(--surface); border-radius:16px; padding:22px; box-shadow:0 20px 60px rgba(15,17,26,.28); animation:pbpop .16s ease; }
@keyframes pbpop { from { transform:translate(-50%,-46%); opacity:.5 } to { transform:translate(-50%,-50%); opacity:1 } }
.pb-modal h3 { font-family:'Space Grotesk'; font-weight:700; font-size:17px; margin:0 0 16px; }
.pb-modalfoot { display:flex; justify-content:flex-end; gap:8px; margin-top:18px; }

.pb-empty { text-align:center; color:var(--soft); padding:40px 16px; font-size:13.5px; }
.pb-load { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; min-height:60vh; color:var(--soft); font-size:14px; text-align:center; }

/* Всплывающее уведомление (отмена действий) */
.pb-toast { position:fixed; left:50%; bottom:28px; transform:translateX(-50%); z-index:70; background:var(--ink); color:#fff; font-family:'Inter'; font-weight:500; font-size:13.5px; padding:10px 16px; border-radius:10px; box-shadow:0 10px 30px rgba(15,17,26,.28); animation:pbtoast .16s ease; }
@keyframes pbtoast { from { transform:translate(-50%,8px); opacity:0 } to { transform:translate(-50%,0); opacity:1 } }

/* ── Тёмная тема: кнопка переключения ───────────────────────────────────── */
/* ── Dark toggle — видимая кнопка ───────────────────────────────────────── */
.pb-darktoggle {
  font-size:16px; padding:6px 12px; cursor:pointer; border:1.5px solid var(--line);
  border-radius:20px; background:var(--surface); color:var(--ink);
  transition:background .15s, box-shadow .15s;
  box-shadow:0 1px 4px rgba(20,22,31,.08);
  font-family:'Inter'; font-weight:500;
}
.pb-darktoggle:hover { background:var(--surface2); box-shadow:0 3px 10px rgba(20,22,31,.12); }
.pb.dark .pb-darktoggle { box-shadow:0 1px 4px rgba(0,0,0,.3); }
.pb.dark .pb-darktoggle:hover { box-shadow:0 3px 10px rgba(0,0,0,.4); }

/* ── Поиск внутри проекта на отдельной строке ───────────────────────────── */
.pb-searchrow { margin-bottom:10px; }
.pb-searchrow .pb-search { max-width:100%; }

/* ── Глобальный поиск ────────────────────────────────────────────────────── */
.pb-gsearch-wrap { position:relative; margin-bottom:12px; }
.pb-gsresults { position:absolute; top:calc(100% + 4px); left:0; z-index:220; background:var(--panel); border:1px solid var(--line); border-radius:12px; box-shadow:0 8px 30px rgba(0,0,0,.14); width:100%; max-width:460px; max-height:320px; overflow-y:auto; }
.pb-gsrow { display:flex; align-items:center; gap:7px; width:100%; text-align:left; background:none; border:none; cursor:pointer; padding:9px 12px; color:var(--text); font-size:13px; }
.pb-gsrow:hover { background:var(--surface2); }
.pb-gsdot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
.pb-gsproject { font-size:11px; color:var(--c-muted); font-weight:600; text-transform:uppercase; letter-spacing:.05em; white-space:nowrap; }
.pb-gsarrow { color:var(--line); flex-shrink:0; }
.pb-gstitle { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.pb-gsempty { padding:14px 12px; color:var(--c-muted); font-size:13px; }

/* ── Общая статистика на главной ─────────────────────────────────────────── */
.pb-globalstats { display:flex; align-items:center; gap:10px; flex-wrap:wrap; padding:8px 14px; background:var(--surface); border:1px solid var(--line); border-radius:10px; margin-bottom:18px; font-size:13px; color:var(--c-muted); }
.pb-globalstats b { color:var(--text); font-weight:700; }
.pb-gs-sep { color:var(--line); }

/* ── Дедлайн и исполнитель на карточке ──────────────────────────────────── */
.pb-due { font-size:10.5px; padding:1px 6px; border-radius:5px; font-family:'Space Mono'; white-space:nowrap; background:var(--surface2); color:var(--c-muted); border:1px solid var(--line); }
.pb-due.soon { background:#FBF1DC; color:#9A6711; border-color:#EEDFB6; }
.pb-due.overdue { background:#FBE7E7; color:#B23636; border-color:#F2C9C9; font-weight:700; }
.pb.dark .pb-due.soon { background:rgba(200,147,42,.15); color:#C8932A; border-color:rgba(200,147,42,.3); }
.pb.dark .pb-due.overdue { background:rgba(178,54,54,.18); color:#E06060; border-color:rgba(178,54,54,.3); }
.pb-assignee { font-size:10.5px; color:var(--c-muted); white-space:nowrap; font-style:italic; }
.overdue-input { border-color:#F2C9C9!important; color:#B23636!important; }

/* ── Bulk selection ──────────────────────────────────────────────────────── */
.pb-check { display:inline-block; width:16px; height:16px; border:2px solid var(--line); border-radius:4px; margin-right:8px; flex-shrink:0; transition:all .12s; vertical-align:middle; }
.pb-check.on { background:var(--accent); border-color:var(--accent); }
.pb-check.on::after { content:"✓"; color:#fff; font-size:11px; display:flex; align-items:center; justify-content:center; line-height:14px; }
.pb-card.selected { outline:2px solid var(--accent); outline-offset:1px; }
.pb-row.selected { background:var(--accent-soft)!important; }
.pb-bulkbar { position:fixed; bottom:24px; left:50%; transform:translateX(-50%); z-index:300; display:flex; align-items:center; gap:8px; background:var(--ink); color:#fff; padding:10px 16px; border-radius:14px; box-shadow:0 8px 30px rgba(0,0,0,.25); flex-wrap:wrap; }
.pb-bulk-cnt { font-size:13px; font-weight:600; white-space:nowrap; }
.pb-bulkbar .pb-select { font-size:12px; padding:4px 8px; border-radius:7px; background:rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.2); color:#fff; }
.pb-bulkbar .pb-select option { background:var(--ink); color:#fff; }
.pb-bulkbar .pb-btn { padding:6px 12px; font-size:12.5px; }

/* ── Градиент карточки проекта ───────────────────────────────────────────── */
.pb-proj.has-gradient { color:#fff; border-color:transparent; }
.pb-proj.has-gradient h3 { color:#fff; }
.pb-proj.has-gradient .pb-meta, .pb-proj.has-gradient .pb-count { color:rgba(255,255,255,.72); }
.pb-proj.has-gradient .pb-build { background:rgba(255,255,255,.18); color:#fff; border-color:rgba(255,255,255,.3); }
.pb-proj.has-gradient .pb-prog { background:rgba(255,255,255,.2); }
.pb-proj.has-gradient .pb-prog i { background:rgba(255,255,255,.85); }
.pb-proj.has-gradient:hover { box-shadow:0 12px 30px rgba(0,0,0,.25); }

/* Кнопка выбора градиента */
.pb-grad-btn { position:absolute; top:10px; right:50px; opacity:0; border:none; background:rgba(255,255,255,.25); color:#fff; font-size:12px; padding:3px 7px; border-radius:7px; cursor:pointer; transition:opacity .12s; backdrop-filter:blur(4px); }
.pb-proj:not(.has-gradient) .pb-grad-btn { background:var(--surface2); color:var(--soft); }
.pb-proj:hover .pb-grad-btn { opacity:1; }
.pb-grad-btn:hover { opacity:1!important; }

/* Попап выбора градиента — fixed, вне карточки, чтобы overflow:hidden не резал */
.pb-gradpop { position:fixed; z-index:410; background:var(--panel); border:1px solid var(--line); border-radius:12px; padding:8px; box-shadow:0 8px 26px rgba(0,0,0,.16); display:grid; grid-template-columns:repeat(4,28px); gap:6px; }
.pb-gradswatch { width:28px; height:28px; border-radius:7px; border:2px solid transparent; cursor:pointer; background:var(--surface2); display:flex; align-items:center; justify-content:center; font-size:11px; color:var(--c-muted); transition:transform .1s; }
.pb-gradswatch:hover { transform:scale(1.15); }
.pb-gradswatch.on { border-color:var(--ink); }
.pb-grad-btn.open { opacity:1!important; }
.pb-fullscrim { position:fixed; inset:0; z-index:400; }

/* Кнопки на архивных карточках */
.pb-arch-actions { position:absolute; top:10px; right:10px; display:flex; gap:5px; opacity:0; transition:opacity .12s; }
.pb-proj:hover .pb-arch-actions { opacity:1; }
.pb-arch-btn.static { background:var(--surface2); color:var(--soft); border:none; font-size:11px; padding:4px 8px; border-radius:7px; cursor:pointer; }
/* Кнопка внутри pb-arch-actions — статичный flex-элемент, не абсолютный */
.pb-arch-actions .pb-arch-btn { position:static!important; opacity:1!important; top:auto; right:auto; }
.pb-arch-del { background:rgba(178,54,54,.1); color:#B23636; border:none; font-size:11px; padding:4px 8px; border-radius:7px; cursor:pointer; font-family:'Inter'; }
.pb-arch-del:hover { background:rgba(178,54,54,.2); }

/* ── Удаление проекта (модал) ────────────────────────────────────────────── */
.pb-btn.danger { background:#B23636; color:#fff; border-color:#B23636; }
.pb-btn.danger:disabled { opacity:.4; cursor:default; }
.pb-modal { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); z-index:500; background:var(--panel); border:1px solid var(--line); border-radius:16px; padding:28px 28px 24px; width:90%; max-width:400px; box-shadow:0 16px 48px rgba(0,0,0,.2); }
.pb-modal .x { position:absolute; top:14px; right:14px; background:none; border:none; font-size:18px; color:var(--c-muted); cursor:pointer; }
.pb-modal-title { font-family:'Space Grotesk'; font-size:20px; font-weight:700; margin:0 0 10px; color:var(--text); }
.pb-modal-desc { font-size:13.5px; color:var(--c-muted); margin:0 0 14px; line-height:1.5; }
.pb-modal-hint { font-size:13px; color:var(--c-muted); margin:0 0 8px; }
.pb-modal .pb-input { width:100%; margin-bottom:16px; }
.pb-modal-foot { display:flex; justify-content:flex-end; gap:10px; }

/* ── Статистика ──────────────────────────────────────────────────────────── */
.pb-stats{ padding:24px 0 40px; }
.pb-stat-cards{ display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:28px; }
.pb-statcard{ background:var(--panel); border:1px solid var(--line); border-radius:12px; padding:18px 20px 14px; display:flex; flex-direction:column; gap:4px; }
.pb-statcard.accent{ border-color:var(--accent); background:rgba(91,75,224,.06); }
.pb-statcard-val{ font-size:28px; font-weight:700; color:var(--text); line-height:1; }
.pb-statcard.accent .pb-statcard-val{ color:var(--accent); }
.pb-statcard-lbl{ font-size:12px; color:var(--c-muted); }
.pb-stat-section{ background:var(--panel); border:1px solid var(--line); border-radius:12px; padding:16px 20px 18px; margin-bottom:12px; }
.pb-stat-head{ font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:.06em; color:var(--c-muted); margin-bottom:12px; }
.pb-stat-brow{ display:flex; align-items:center; gap:10px; margin-bottom:8px; }
.pb-stat-blbl{ font-size:13px; color:var(--text); min-width:130px; max-width:130px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.pb-stat-btrack{ flex:1; height:8px; background:var(--bg); border-radius:4px; overflow:hidden; }
.pb-stat-bfill{ height:100%; border-radius:4px; transition:width .3s ease; }
.pb-stat-bnum{ font-size:13px; font-weight:600; color:var(--text); min-width:24px; text-align:right; }
.pb-stat-2col{ display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px; }
.pb-stat-prow{ display:flex; align-items:center; gap:8px; padding:4px 0; }
.pb-stat-pdot{ width:8px; height:8px; border-radius:50%; flex-shrink:0; }
.pb-stat-plbl{ font-size:13px; color:var(--text); flex:1; }
.pb-stat-pcount{ font-size:13px; font-weight:600; color:var(--text); }
.pb-sparkline{ width:100%; height:64px; display:block; margin-top:4px; }
.pb-stat-head-legend{ display:flex; align-items:center; gap:14px; }
.pb-stat-leg{ display:flex; align-items:center; gap:5px; font-size:11px; color:var(--c-muted); text-transform:none; letter-spacing:0; font-weight:500; }
.pb-stat-leg .dot{ width:8px; height:8px; border-radius:2px; flex-shrink:0; }

/* ── Теги ────────────────────────────────────────────────────────────────── */
.pb-tagrow{ display:flex; flex-wrap:wrap; gap:6px; align-items:center; position:relative; }
.pb-tag{ display:inline-flex; align-items:center; gap:3px; background:rgba(91,75,224,.1); color:var(--accent); border-radius:20px; padding:2px 8px 2px 10px; font-size:12px; font-weight:500; }
.pb-tag-x{ background:none; border:none; cursor:pointer; color:var(--accent); opacity:.7; padding:0 0 0 2px; font-size:11px; line-height:1; }
.pb-tag-x:hover{ opacity:1; }
.pb-taginput-wrap{ position:relative; }
.pb-taginput{ border:1px dashed var(--line); background:transparent; border-radius:20px; padding:3px 10px; font-size:12px; color:var(--text); outline:none; width:130px; transition:border-color .15s; }
.pb-taginput:focus{ border-color:var(--accent); }
.pb-tagdrop{ position:absolute; top:calc(100% + 4px); left:0; z-index:210; background:var(--panel); border:1px solid var(--line); border-radius:10px; box-shadow:0 4px 16px rgba(0,0,0,.1); min-width:160px; max-height:200px; overflow-y:auto; padding:4px; }
.pb-tagopt{ display:block; width:100%; text-align:left; background:none; border:none; cursor:pointer; padding:7px 10px; font-size:13px; color:var(--text); border-radius:7px; }
.pb-tagopt:hover{ background:var(--bg); }
.pb-tagopt.new{ color:var(--accent); font-weight:500; }
.pb-tagscrim{ position:fixed; inset:0; z-index:200; }
.pb-tag-sm{ display:inline-block; background:var(--bg); color:var(--c-muted); border-radius:20px; padding:1px 7px; font-size:11px; }
.pb-tag-sm.more{ background:rgba(91,75,224,.08); color:var(--accent); }
.pb-cardtags{ display:flex; flex-wrap:wrap; gap:4px; margin:4px 0 6px; }

/* ── История изменений ───────────────────────────────────────────────────── */
.pb-act-toggle{ background:none; border:none; cursor:pointer; font-size:12px; color:var(--c-muted); padding:2px 0; display:flex; align-items:center; gap:6px; }
.pb-act-toggle:hover{ color:var(--text); }
.pb-act-cnt{ background:var(--bg); border-radius:20px; padding:1px 7px; font-size:11px; font-weight:600; }
.pb-activity{ margin-top:8px; display:flex; flex-direction:column; gap:0; max-height:220px; overflow-y:auto; }
.pb-act-row{ display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid var(--line); }
.pb-act-row:last-child{ border-bottom:none; }
.pb-act-action{ font-size:12px; color:var(--text); }
.pb-act-time{ font-size:11px; color:var(--c-muted); flex-shrink:0; margin-left:8px; }
.pb-act-row.muted{ color:var(--c-muted); font-size:12px; }

/* ── Мобильная оптимизация (≤ 768px) ────────────────────────────────────── */
@media (max-width:720px){
  .pb-board{ grid-template-columns:1fr; }
  .pb-row{ grid-template-columns:1fr 130px; }
  .pb-row .col-plat,.pb-row .col-ver,.pb-row .col-prio{ display:none; }
}
@media (max-width:768px){
  /* Шапка проекта */
  .pb-phead{ flex-direction:column; align-items:flex-start; gap:10px; }
  .pb-controls{ width:100%; flex-wrap:wrap; gap:6px; }
  .pb-search{ flex:1 1 100%; order:-1; }
  .pb-switch{ flex:1 1 auto; }
  .pb-switch button{ padding:6px 10px; font-size:12px; }

  /* Панель задачи — на весь экран */
  .pb-panel{
    position:fixed; inset:0; width:100%; max-width:100%;
    border-radius:0; transform:none!important;
    padding:16px; overflow-y:auto; -webkit-overflow-scrolling:touch;
  }
  .pb-seg{ flex-wrap:wrap; }
  .pb-seg button{ flex:1 1 auto; min-width:80px; }

  /* Сводка статистики — 2 колонки */
  .pb-stat-cards{ grid-template-columns:1fr 1fr; }
  .pb-stat-2col{ grid-template-columns:1fr; }

  /* Фильтр — попап тоже на всю ширину */
  .pb-filterpop{ width:calc(100vw - 32px); max-height:80vh; overflow-y:auto; }

  /* Карточки доски — нормальная ширина */
  .pb-col{ min-width:280px; }

  /* Тег-дроп — выше кнопки на мобиле */
  .pb-tagdrop{ min-width:140px; }

  /* Скрываем горизонтальный скролбар (есть touch-scroll) */
  .pb-board-topscroll{ display:none; }
  /* Разрешаем touch-scroll по доске */
  .pb-board { -webkit-overflow-scrolling:touch; }
}

@media (prefers-reduced-motion: reduce){ .pb *,.pb *::before { animation:none!important; transition:none!important; } }
`;
