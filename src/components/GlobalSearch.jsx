import { useMemo, useState } from "react";
import { useT } from "../lib/i18n.js";

// Единый поиск по всему сайту (проекты + задачи), живёт в центре шапки —
// одинаковый на главном экране и внутри любого проекта. Не путать со строкой
// «Поиск задач…» внутри проекта — та фильтрует уже открытый список вместе с
// остальными фильтрами, это другая функция.
export default function GlobalSearch({ allProjects, user, onOpenTask, onOpenProject, onRequestJoin }) {
  const t = useT();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const uid = user.uid;
  const isMember = (p) => (p.members === undefined ? true : p.members.includes(uid));

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    const out = [];
    allProjects.forEach((p) => {
      if ((p.name || "").toLowerCase().includes(query)) out.push({ type: "project", project: p });
    });
    allProjects.forEach((p) => {
      p.tasks.forEach((t) => {
        if ((t.title || "").toLowerCase().includes(query)) {
          out.push({ type: "task", projectId: p.id, projectName: p.name, projectColor: p.color, task: t });
        }
      });
    });
    return out.slice(0, 24);
  }, [q, allProjects]);

  const closeAndClear = () => { setQ(""); setOpen(false); };
  const clickTask = (pid, tid) => { closeAndClear(); onOpenTask(pid, tid); };
  const clickProject = (p) => {
    closeAndClear();
    if (isMember(p)) onOpenProject(p.id);
    else onRequestJoin(p);
  };

  return (
    <div className="pb-topsearch-slot">
      <div className="pb-search pb-topsearch">
        <span className="pb-search-ic">⌕</span>
        <input
          type="text"
          placeholder={t("Поиск по всему сайту…")}
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => { if (e.key === "Escape") closeAndClear(); }}
        />
        {q && <button className="pb-search-x" onClick={closeAndClear}>✕</button>}
      </div>
      {open && q.trim() && (
        <>
          <div className="pb-tagscrim" onMouseDown={() => setOpen(false)} />
          <div className="pb-gsresults pb-gsresults-top">
            {results.length === 0 ? (
              <div className="pb-gsempty">{t("Ничего не найдено")}</div>
            ) : (
              results.map((r) =>
                r.type === "project" ? (
                  <button key={"p" + r.project.id} className="pb-gsrow" onMouseDown={() => clickProject(r.project)}>
                    <span className="pb-gsdot" style={{ background: r.project.color }} />
                    <span className="pb-gsproject">{r.project.name}</span>
                    <span className="pb-gsarrow">›</span>
                    <span className="pb-gstitle muted">{t("проект")}</span>
                    <span className="pb-joinbadge" style={{ marginLeft: "auto" }}>
                      {isMember(r.project) ? t("Участник") : t("Присоединиться")}
                    </span>
                  </button>
                ) : (
                  <button key={r.task.id} className="pb-gsrow" onMouseDown={() => clickTask(r.projectId, r.task.id)}>
                    <span className="pb-gsdot" style={{ background: r.projectColor }} />
                    <span className="pb-gsproject">{r.projectName}</span>
                    <span className="pb-gsarrow">›</span>
                    <span className="pb-gstitle">{r.task.title}</span>
                    {r.task.num != null && <span className="pb-num" style={{ marginLeft: "auto" }}>#{r.task.num}</span>}
                  </button>
                )
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}
