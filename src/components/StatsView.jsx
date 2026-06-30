import { useMemo } from "react";

// Дашборд статистики проекта: сводка, разбивка по статусам/приоритету/платформе,
// спарклайн активности за последние 14 дней. Всё считается из project.tasks.
export default function StatsView({ project }) {
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

    const DAYS = 14;
    const sparks = new Array(DAYS).fill(0);

    tasks.forEach((t) => {
      if (t.status in byStatus) byStatus[t.status]++;
      byPrio[t.priority] = (byPrio[t.priority] || 0) + 1;
      byPlat[t.platform] = (byPlat[t.platform] || 0) + 1;
      if (t.created) {
        const ts = new Date(t.created).getTime();
        if (ts >= weekAgo) thisWeek++;
        const ago = Math.floor((now - ts) / 86400000);
        if (ago >= 0 && ago < DAYS) sparks[DAYS - 1 - ago]++;
      }
    });

    const lastStatus = project.statuses[project.statuses.length - 1];
    const done = lastStatus ? (byStatus[lastStatus.id] || 0) : 0;

    return { total, done, open: total - done, thisWeek, byStatus, byPrio, byPlat, sparks };
  }, [tasks, project.statuses]);

  return (
    <div className="pb-stats">
      {/* Сводка */}
      <div className="pb-stat-cards">
        <StatCard value={stats.total} label="Всего задач" />
        <StatCard value={stats.open} label="Открытых" />
        <StatCard value={stats.done} label="Готово" accent />
        <StatCard value={`+${stats.thisWeek}`} label="За неделю" />
      </div>

      {/* По статусам */}
      <div className="pb-stat-section">
        <div className="pb-stat-head">По статусам</div>
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
          <div className="pb-stat-head">Приоритет</div>
          <PrioRow label="Высокий" count={stats.byPrio.high} color="#B23636" />
          <PrioRow label="Средний" count={stats.byPrio.med} color="#C8932A" />
          <PrioRow label="Низкий" count={stats.byPrio.low} color="#4B9C5E" />
        </div>
        <div className="pb-stat-section">
          <div className="pb-stat-head">Платформа</div>
          <PrioRow label="iOS" count={stats.byPlat.ios} color="#2C5BB5" />
          <PrioRow label="Android" count={stats.byPlat.android} color="#1C7A4A" />
          <PrioRow label="Общая" count={stats.byPlat.both} color="#7C8499" />
        </div>
      </div>

      {/* Активность */}
      <div className="pb-stat-section">
        <div className="pb-stat-head">Создано за последние 14 дней</div>
        <Sparkline data={stats.sparks} />
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

function Sparkline({ data }) {
  const max = Math.max(...data, 1);
  const H = 52;
  const gap = 3;
  const n = data.length;
  return (
    <svg
      className="pb-sparkline"
      viewBox={`0 0 ${n * 16 + (n - 1) * gap} ${H}`}
      preserveAspectRatio="none"
    >
      {data.map((v, i) => {
        const h = Math.max((v / max) * (H - 6), v > 0 ? 4 : 2);
        return (
          <rect
            key={i}
            x={i * (16 + gap)}
            y={H - h}
            width={16}
            height={h}
            rx={3}
            fill={v > 0 ? "var(--accent)" : "var(--line)"}
            opacity={v > 0 ? 0.75 : 1}
          />
        );
      })}
    </svg>
  );
}
