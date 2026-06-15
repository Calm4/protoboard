// Все стили интерфейса. Перенесены из прототипа БЕЗ изменений —
// внешний вид остаётся прежним. Подключаются один раз в App через <style>.
export const css = `
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
.pb-buildedit { font-family:'Space Mono'; font-size:12px; color:var(--accent); background:var(--accent-soft); border:1px solid transparent; padding:4px 8px; border-radius:6px; width:96px; cursor:text; }
.pb-buildedit:hover { border-color:var(--accent); }
.pb-buildedit:focus { outline:none; border-color:var(--accent); background:#fff; }
.pb-switch { display:inline-flex; background:var(--surface2); border:1px solid var(--line); border-radius:10px; padding:3px; gap:2px; }
.pb-switch button { border:none; background:transparent; font-family:'Inter'; font-weight:600; font-size:13px; color:var(--soft); padding:7px 14px; border-radius:7px; cursor:pointer; }
.pb-switch button.on { background:var(--surface); color:var(--ink); box-shadow:0 1px 3px rgba(20,22,31,.10); }
.pb-controls { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.pb-search { display:inline-flex; align-items:center; gap:6px; background:var(--surface); border:1px solid var(--line); border-radius:9px; padding:0 8px; height:36px; }
.pb-search:focus-within { border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-soft); }
.pb-search-ic { color:var(--soft); font-size:16px; line-height:1; }
.pb-search input { border:none; outline:none; background:transparent; font-family:'Inter'; font-size:13.5px; color:var(--ink); width:160px; }
.pb-search-x { border:none; background:transparent; color:var(--soft); cursor:pointer; font-size:12px; padding:2px 2px; }
.pb-search-x:hover { color:var(--ink); }

/* плашка версии (обводка, без выпадашки) */
.pb-verchip { font-family:'Space Mono'; font-size:10.5px; color:var(--soft); border:1px solid var(--line); border-radius:5px; padding:1px 6px; white-space:nowrap; display:inline-block; }

/* подсветка места вставки при перетаскивании */
.pb-card.dropbefore { box-shadow:inset 0 3px 0 0 var(--accent); }
.pb-row.dropbefore { box-shadow:inset 0 2px 0 0 var(--accent); }

/* filter bar */
.pb-filterbar { display:flex; align-items:center; gap:10px; margin:0 0 18px; }
.pb-filterbar .lbl { font-family:'Space Mono'; font-size:11px; text-transform:uppercase; letter-spacing:.05em; color:var(--soft); }
.pb-chips { display:inline-flex; gap:6px; }
.pb-chip { border:1px solid var(--line); background:var(--surface); color:var(--soft); font-size:12.5px; font-weight:600; padding:5px 12px; border-radius:99px; cursor:pointer; font-family:'Inter'; }
.pb-chip.on { background:var(--ink); color:#fff; border-color:var(--ink); }

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
.pb-row.group { display:flex; align-items:center; gap:8px; background:var(--surface2); cursor:default; padding:9px 16px; }
.pb-row.group:hover { background:var(--surface2); }
.pb-row.group .gdot { width:8px; height:8px; border-radius:99px; }
.pb-row.group .gname { font-family:'Space Grotesk'; font-weight:600; font-size:12.5px; flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.pb-row.group .gcount { font-family:'Space Mono'; font-size:11px; color:var(--soft); }
.pb-row.group .pb-colmenu-btn { flex:0 0 auto; }
.pb-listgroup { position:relative; transition:background .12s; }
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
.pb-shotthumb button { position:absolute; top:4px; right:4px; border:none; background:rgba(15,17,26,.6); color:#fff; width:20px; height:20px; border-radius:6px; cursor:pointer; font-size:12px; }
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

@media (max-width:720px){
  .pb-board{ grid-template-columns:1fr; }
  .pb-row{ grid-template-columns:1fr 130px; }
  .pb-row .col-plat,.pb-row .col-ver,.pb-row .col-prio{ display:none; }
}
@media (prefers-reduced-motion: reduce){ .pb *,.pb *::before { animation:none!important; transition:none!important; } }
`;
