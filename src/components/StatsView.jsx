import { useMemo } from "react";
import { useT } from "../lib/i18n.js";

// "На удержании" статусы — не идут в "открытые"
const isHoldStatus = (label) => {
  const l = (label || "").toLowerCase();
  return (
    l.includes("hold") || l.includes("not fix") || l.includes("no fix") ||
    l.includes("won't fix") || l.includes("wontfix") || l.includes("not in build") ||
    l.includes("заморожен") || l.includes("отложен") || l.includes("на удержании") ||
    l.includes("не фикс") || l.includes("не в билде")
  );
};

export default function StatsView({ project }) {
  const t = useT();
  const tasks = project.tasks;

  const stats = useMemo(() => {
    const total = tasks.length;
    const byStatus = {};
    project.statuses.forEach((s) => { byStatus[s.id] = 0; });
    const byPrio = { high: 0, med: 0, low: 0 };
    const byPlat = { ios: 0, android: 0, both: 0 };

    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    let thisWeek = 0;

    const DAYS = 30;
    const created = new Array(DAYS).fill(0);
    const completed = new Array(DAYS).fill(0);

    tasks.forEach((t) => {
      if (t.status in byStatus) byStatus[t.status]++;
      byPrio[t.priority] = (byPrio[t.priority] || 0) + 1;
      byPlat[t.platform] = (byPlat[t.platform] || 0) + 1;
      if (t.created) {
        const ts = new Date(t.created).getTime();
        if (ts >= weekAgo) thisWeek++;
        const ago = Math.floor((now - ts) / 86400000);
        if (ago >= 0 && ago < DAYS) created[DAYS - 1 - ago]++;
      }
      if (t.completedAt) {
        const ago = Math.floor((now - t.completedAt) / 86400000);
        if (ago >= 0 && ago < DAYS) completed[DAYS - 1 - ago]++;
      }
    });

    const lastStatus = project.statuses[project.statuses.length - 1];
    const holdStatusIds = new Set(
      project.statuses.filter((s) => isHoldStatus(s.label)).map((s) => s.id)
    );
    const done = lastStatus ? (byStatus[lastStatus.id] || 0) : 0;
    const held = [...holdStatusIds].reduce((sum, id) => sum + (byStatus[id] || 0), 0);
    const open = total - done - held;

    return { total, done, held, open, thisWeek, byStatus, byPrio, byPlat, created, completed };
  }, [tasks, project.statuses]);

  return (
    <div className="pb-stats">
      {/* Сводка */}
      <div className="pb-stat-cards">
        <StatCard value={stats.total} label={t("Всего задач")} />
        <StatCard value={stats.open} label={t("Открытых")} />
        <StatCard value={stats.held} label={t("На удержании")} />
        <StatCard value={stats.done} label={t("Готово")} accent />
      </div>

      {/* По статусам */}
      <div className="pb-stat-section">
        <div className="pb-stat-head">{t("По статусам")}</div>
        {project.statuses.map((s) => {
          const count = stats.byStatus[s.id] || 0;
          const pct = stats.total ? (count / stats.total) * 100 : 0;
          return (
            <div key={s.id} className="pb-stat-brow">
              <span className="pb-stat-blbl">{s.label}</span>
              <div className="pb-stat-btrack">
                <div className="pb-stat-bfill" style={{ width: pct + "%", background: s.color }} />
              </div>
              <span className="pb-stat-bnum">{count}</span>
            </div>
          );
        })}
      </div>

      {/* Приоритет + Платформа */}
      <div className="pb-stat-2col">
        <div className="pb-stat-section">
          <div className="pb-stat-head">{t("Приоритет")}</div>
          <PrioRow label={t("Высокий")} count={stats.byPrio.high} color="#B23636" />
          <PrioRow label={t("Средний")} count={stats.byPrio.med} color="#C8932A" />
          <PrioRow label={t("Низкий")} count={stats.byPrio.low} color="#4B9C5E" />
        </div>
        <div className="pb-stat-section">
          <div className="pb-stat-head">{t("Платформа")}</div>
          <PrioRow label="iOS" count={stats.byPlat.ios} color="#2C5BB5" />
          <PrioRow label="Android" count={stats.byPlat.android} color="#1C7A4A" />
          <PrioRow label={t("Общая")} count={stats.byPlat.both} color="#7C8499" />
        </div>
      </div>

      {/* График: создано vs выполнено */}
      <div className="pb-stat-section">
        <div className="pb-stat-head pb-stat-head-legend">
          {t("Активность за 30 дней")}
          <span className="pb-stat-leg"><span className="dot" style={{ background: "var(--accent)" }} />{t("Создано")}</span>
          <span className="pb-stat-leg"><span className="dot" style={{ background: "#16A06A" }} />{t("Выполнено")}</span>
        </div>
        <DualSparkline created={stats.created} completed={stats.completed} />
      </div>
    </div>
  );
}

function StatCard({ value, label, accent }) {
  return (
    <div className={"pb-statcard" + (accent ? " accent" : "")}>
      <span className="pb-statcard-val">{value}</span>
      <span className="pb-statcard-lbl">{label}</span>
    </div>
  );
}

function PrioRow({ label, count, color }) {
  return (
    <div className="pb-stat-prow">
      <span className="pb-stat-pdot" style={{ background: color }} />
      <span className="pb-stat-plbl">{label}</span>
      <span className="pb-stat-pcount">{count}</span>
    </div>
  );
}

function DualSparkline({ created, completed }) {
  const n = created.length;
  const max = Math.max(...created, ...completed, 1);
  const H = 64;
  const barW = 8;
  const gap = 2;
  const groupW = barW * 2 + gap + 3; // two bars + inner gap + group gap
  const totalW = n * groupW;

  return (
    <svg className="pb-sparkline" viewBox={`0 0 ${totalW} ${H}`} preserveAspectRatio="none">
      {created.map((cv, i) => {
        const dv = completed[i];
        const x = i * groupW;
        const ch = Math.max((cv / max) * (H - 8), cv > 0 ? 4 : 2);
        const dh = Math.max((dv / max) * (H - 8), dv > 0 ? 4 : 2);
        return (
          <g key={i}>
            <rect x={x} y={H - ch} width={barW} height={ch} rx={2}
              fill={cv > 0 ? "var(--accent)" : "var(--line)"} opacity={cv > 0 ? 0.7 : 1} />
            <rect x={x + barW + gap} y={H - dh} width={barW} height={dh} rx={2}
              fill={dv > 0 ? "#16A06A" : "var(--line)"} opacity={dv > 0 ? 0.75 : 1} />
          </g>
        );
      })}
    </svg>
  );
}
