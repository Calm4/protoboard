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

// Палитра цветов проекта (полоска слева / кружок у названия). 18 оттенков.
export const PROJECT_COLORS = [
  "#5B4BE0", "#7C5CFC", "#6D4AFF", "#9B51E0", "#D6457A", "#E0556E",
  "#B23636", "#D67E1E", "#E0913B", "#C7A21C", "#3D9A55", "#16A06A",
  "#0FA3A3", "#1E88E5", "#2C5BB5", "#5B6373", "#7A6A5A", "#A65D2E",
];
export const DEFAULT_COLOR = PROJECT_COLORS[0];

// Цвета для подсветки приоритета/статуса в списке (текст + фон + рамка).
export const PRIO_UI = {
  high: { fg: "#B23636", bg: "#FBE7E7", bd: "#F2C9C9" },
  med: { fg: "#9A6711", bg: "#FBF1DC", bd: "#EEDFB6" },
  low: { fg: "#4B5566", bg: "#EDEFF5", bd: "#DDE1EC" },
};
export const STATUS_UI = {
  todo: { fg: "#5B6373", bg: "#EDEFF5", bd: "#DDE1EC" },
  check: { fg: "#9A6711", bg: "#FBF1DC", bd: "#EEDFB6" },
  done: { fg: "#1C7A4A", bg: "#E1F2E8", bd: "#C5E6D2" },
};
