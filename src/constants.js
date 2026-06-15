// Справочники и мелкие помощники, общие для всех экранов.
// Вынесены из прототипа без изменений, чтобы переиспользовать в компонентах.

export const uid = () =>
  (crypto.randomUUID ? crypto.randomUUID() : String(Math.random())).slice(0, 8);

export const STATUSES = [
  { key: "todo", label: "To Do" },
  { key: "check", label: "Ready to Check" },
  { key: "done", label: "Done" },
];

export const PRIORITIES = [
  { key: "high", label: "Высокий" },
  { key: "med", label: "Средний" },
  { key: "low", label: "Низкий" },
];

export const PLATFORMS = [
  { key: "both", label: "Общая" },
  { key: "ios", label: "iOS" },
  { key: "android", label: "Android" },
];

export const platLabel = (k) => PLATFORMS.find((p) => p.key === k).label;
export const prioLabel = (k) => PRIORITIES.find((p) => p.key === k).label;

export const statusColor = {
  todo: "var(--todo)",
  check: "var(--check)",
  done: "var(--done)",
};
