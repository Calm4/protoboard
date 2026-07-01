// Справочники и мелкие помощники, общие для всех экранов.
// Вынесены из прототипа без изменений, чтобы переиспользовать в компонентах.

export const uid = () =>
  (crypto.randomUUID ? crypto.randomUUID() : String(Math.random())).slice(0, 8);

// Базовые статусы — даются новому проекту по умолчанию. Дальше у каждого
// проекта свой список (хранится в projects.statuses), его можно менять.
export const DEFAULT_STATUSES = [
  { id: "todo", label: "To Do", color: "#7C8499" },
  { id: "check", label: "Ready to Check", color: "#D67E1E" },
  { id: "done", label: "Done", color: "#16A06A" },
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

// Пустой набор фильтров задач (значения «по умолчанию» = ничего не отфильтровано).
// platform/priority: "all"; status/version: массив — пусто значит «все» (можно
// выбрать несколько); num: список номеров через запятую/пробел — пусто значит «все»,
// иначе задача должна попасть в этот список; dateFrom/dateTo: YYYY-MM-DD.
export const EMPTY_FILTERS = {
  platform: "all", priority: "all", status: [], version: [],
  num: "", dateFrom: "", dateTo: "", tags: [], showClosed: false,
};

// Палитра цветов проекта (полоска слева / кружок у названия). 18 оттенков.
export const PROJECT_COLORS = [
  "#5B4BE0", "#7C5CFC", "#6D4AFF", "#9B51E0", "#D6457A", "#E0556E",
  "#B23636", "#D67E1E", "#E0913B", "#C7A21C", "#3D9A55", "#16A06A",
  "#0FA3A3", "#1E88E5", "#2C5BB5", "#5B6373", "#7A6A5A", "#A65D2E",
];
export const DEFAULT_COLOR = PROJECT_COLORS[0];

// Цвета для подсветки приоритета в списке (текст + фон + рамка).
// У статусов цвет берётся из самого статуса (см. lib/color.js).
export const PRIO_UI = {
  high: { fg: "#B23636", bg: "#FBE7E7", bd: "#F2C9C9" },
  med: { fg: "#9A6711", bg: "#FBF1DC", bd: "#EEDFB6" },
  low: { fg: "#4B5566", bg: "#EDEFF5", bd: "#DDE1EC" },
};
export const PLAT_UI = {
  both: { fg: "#5B6373", bg: "#EDEFF5", bd: "#DDE1EC" },
  ios: { fg: "#2C5BB5", bg: "#E5ECF9", bd: "#CFE0F4" },
  android: { fg: "#1C7A4A", bg: "#E1F2E8", bd: "#C5E6D2" },
};

// Градиенты для фона карточки проекта на главной.
export const GRADIENTS = [
  { label: "Нет", value: "" },
  { label: "Фиолет", value: "linear-gradient(135deg,#667eea,#764ba2)" },
  { label: "Закат", value: "linear-gradient(135deg,#fa709a,#fee140)" },
  { label: "Океан", value: "linear-gradient(135deg,#4facfe,#00f2fe)" },
  { label: "Ночь", value: "linear-gradient(135deg,#1a1a2e,#0f3460)" },
  { label: "Лес", value: "linear-gradient(135deg,#134e5e,#71b280)" },
  { label: "Оранж", value: "linear-gradient(135deg,#f7971e,#ffd200)" },
  { label: "Малина", value: "linear-gradient(135deg,#ee0979,#ff6a00)" },
  { label: "Кобальт", value: "linear-gradient(135deg,#1e3c72,#2a5298)" },
  { label: "Вишня", value: "linear-gradient(135deg,#c31432,#240b36)" },
  { label: "Медь", value: "linear-gradient(135deg,#c79081,#dfa579)" },
  { label: "Мята", value: "linear-gradient(135deg,#0bd2a4,#22577a)" },
];

// Стандартные теги — есть у каждого проекта по умолчанию, но каждый проект может
// свои спрятать (project.hiddenTags) — они не «вшиты намертво», просто стартовый набор.
export const GLOBAL_TAGS = ["Баг", "UI", "Краш", "Баланс", "Перфоманс"];

// Должности — выбираются один раз при первом входе или в профиле, необязательные.
export const POSITIONS = [
  "Programmer", "Game Designer", "Project Manager", "QA Tester", "Art Designer",
];
