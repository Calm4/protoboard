import { useCallback, useEffect, useState } from "react";
import { supabase, isConfigured, SHOTS_BUCKET, shotUrl } from "../lib/supabase.js";
import { compressImage } from "../lib/image.js";
import { DEFAULT_COLOR, DEFAULT_STATUSES, PROJECT_COLORS } from "../constants.js";

// ───────────────────────────────────────────────────────────────────────────
// Единственное место, где живут данные. Теперь они в Supabase:
//   • при запуске читаем проекты/задачи/скриншоты из базы,
//   • любые изменения пишем в базу,
//   • подписка Realtime приносит чужие изменения сразу всем.
//
// Экраны (App и компоненты) по-прежнему работают с тем же удобным видом данных
// (project.tasks[].desc / .shots[]). Перевод названий полей в "язык базы"
// (desc → description и т.п.) спрятан здесь, в этом файле.
//
// Уникальные id мы генерируем на стороне браузера (crypto.randomUUID), чтобы
// сразу показать изменение, не дожидаясь ответа сервера ("оптимистично"),
// а Realtime потом просто подтвердит то же самое.
// ───────────────────────────────────────────────────────────────────────────

const newId = () => crypto.randomUUID();

// ── Перевод строк базы → удобный вид для экранов ─────────────────────────────
const rowToTask = (row) => ({
  id: row.id,
  title: row.title,
  desc: row.description,
  notes: row.notes,
  priority: row.priority,
  status: row.status,
  platform: row.platform,
  version: row.version,
  order: row.sort_order ?? 0, // порядок внутри колонки
  shots: [], // заполняется из таблицы attachments
});
const rowToProject = (row) => ({
  id: row.id,
  name: row.name,
  build: row.build,
  archived: row.archived,
  color: row.color || DEFAULT_COLOR,
  statuses: row.statuses && row.statuses.length ? row.statuses : DEFAULT_STATUSES,
  tasks: [],
});
const rowToShot = (row) => ({
  id: row.id,
  name: row.name,
  path: row.file_path,
  url: shotUrl(row.file_path),
});

// Перевод "удобных" полей задачи → колонки базы (для записи).
const taskPatchToDb = (patch) => {
  const out = {};
  if ("title" in patch) out.title = patch.title;
  if ("desc" in patch) out.description = patch.desc;
  if ("notes" in patch) out.notes = patch.notes;
  if ("priority" in patch) out.priority = patch.priority;
  if ("status" in patch) out.status = patch.status;
  if ("platform" in patch) out.platform = patch.platform;
  if ("version" in patch) out.version = patch.version;
  return out;
};

export function useProjects() {
  const [projects, setProjects] = useState([]);
  // Состояние первой загрузки: "loading" | "ready" | "error".
  const [loadState, setLoadState] = useState(isConfigured ? "loading" : "ready");

  // ── Локальные помощники: точечно меняем состояние по id ────────────────────
  const patchProjectLocal = (id, fn) =>
    setProjects((ps) => ps.map((p) => (p.id === id ? fn(p) : p)));
  const patchTaskLocal = (pid, tid, fn) =>
    patchProjectLocal(pid, (p) => ({
      ...p,
      tasks: p.tasks.map((t) => (t.id === tid ? fn(t) : t)),
    }));

  // ── Первая загрузка с авто-повтором ────────────────────────────────────────
  // Один сетевой обрыв при открытии больше не оставляет пустой экран: пробуем
  // до 3 раз с паузой, и только потом показываем состояние "ошибка" с кнопкой.
  const loadAll = useCallback(async () => {
    if (!isConfigured) { setLoadState("ready"); return; }
    setLoadState("loading");
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const [p, t, a] = await Promise.all([
          supabase.from("projects").select("*").order("created_at", { ascending: false }),
          supabase.from("tasks").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: true }),
          supabase.from("attachments").select("*").order("created_at", { ascending: true }),
        ]);
        if (p.error || t.error || a.error) throw (p.error || t.error || a.error);

        // Собираем вложенную структуру: проект → его задачи → их скриншоты.
        const tasksByProject = {};
        (t.data || []).forEach((r) => { (tasksByProject[r.project_id] ||= []).push(rowToTask(r)); });
        const shotsByTask = {};
        (a.data || []).forEach((r) => { (shotsByTask[r.task_id] ||= []).push(rowToShot(r)); });
        const assembled = (p.data || []).map((row) => {
          const proj = rowToProject(row);
          proj.tasks = (tasksByProject[row.id] || []).map((tk) => ({ ...tk, shots: shotsByTask[tk.id] || [] }));
          return proj;
        });
        setProjects(assembled);
        setLoadState("ready");
        return;
      } catch (e) {
        console.warn(`[Protoboard] не удалось загрузить данные (попытка ${attempt}/3):`, e?.message || e);
        if (attempt < 3) await new Promise((r) => setTimeout(r, 1200 * attempt));
      }
    }
    setLoadState("error");
  }, []);

  // Запускаем загрузку и подписку на живые обновления.
  useEffect(() => {
    loadAll();
    if (!isConfigured) return;
    const channel = supabase
      .channel("protoboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, onProjectChange)
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, onTaskChange)
      .on("postgres_changes", { event: "*", schema: "public", table: "attachments" }, onAttachmentChange)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadAll]);

  // ── Обработчики Realtime (идемпотентны: повторное применение безопасно) ─────
  function onProjectChange(payload) {
    const { eventType, new: row, old } = payload;
    if (eventType === "DELETE") {
      setProjects((ps) => ps.filter((p) => p.id !== old.id));
    } else if (eventType === "INSERT") {
      setProjects((ps) =>
        ps.some((p) => p.id === row.id) ? ps : [rowToProject(row), ...ps]
      );
    } else if (eventType === "UPDATE") {
      patchProjectLocal(row.id, (p) => ({
        ...p, name: row.name, build: row.build, archived: row.archived,
        color: row.color || DEFAULT_COLOR,
        statuses: row.statuses && row.statuses.length ? row.statuses : DEFAULT_STATUSES,
      }));
    }
  }

  function onTaskChange(payload) {
    const { eventType, new: row, old } = payload;
    if (eventType === "DELETE") {
      patchProjectLocal(old.project_id, (p) => ({
        ...p, tasks: p.tasks.filter((t) => t.id !== old.id),
      }));
    } else if (eventType === "INSERT") {
      patchProjectLocal(row.project_id, (p) =>
        p.tasks.some((t) => t.id === row.id)
          ? p
          : { ...p, tasks: [...p.tasks, rowToTask(row)] }
      );
    } else if (eventType === "UPDATE") {
      // Обновляем поля, но сохраняем уже подгруженные скриншоты.
      patchTaskLocal(row.project_id, row.id, (t) => ({ ...t, ...rowToTask(row), shots: t.shots }));
    }
  }

  function onAttachmentChange(payload) {
    const { eventType, new: row, old } = payload;
    setProjects((ps) =>
      ps.map((p) => ({
        ...p,
        tasks: p.tasks.map((t) => {
          if (eventType === "DELETE" && t.id === old.task_id) {
            return { ...t, shots: t.shots.filter((s) => s.id !== old.id) };
          }
          if (eventType === "INSERT" && t.id === row.task_id) {
            return t.shots.some((s) => s.id === row.id)
              ? t
              : { ...t, shots: [...t.shots, rowToShot(row)] };
          }
          return t;
        }),
      }))
    );
  }

  // Маленькая обёртка: пишем в базу и логируем ошибку, не роняя интерфейс.
  const run = (promise) =>
    Promise.resolve(promise).then(({ error } = {}) => {
      if (error) console.error("[Protoboard] Ошибка записи в Supabase:", error.message);
    });

  // ── Проекты ────────────────────────────────────────────────────────────────
  const createProject = (name, color = DEFAULT_COLOR) => {
    const trimmed = (name || "").trim();
    if (!trimmed) return null;
    const id = newId();
    const statuses = DEFAULT_STATUSES;
    const proj = { id, name: trimmed, build: "v0.1", archived: false, color, statuses, tasks: [] };
    setProjects((ps) => [proj, ...ps]); // оптимистично
    run(supabase.from("projects").insert({ id, name: trimmed, build: "v0.1", archived: false, color, statuses }));
    return proj;
  };
  const setColor = (id, color) => {
    patchProjectLocal(id, (p) => ({ ...p, color }));
    run(supabase.from("projects").update({ color }).eq("id", id));
  };

  // ── Статусы (колонки) проекта ──────────────────────────────────────────────
  // Хранятся списком в projects.statuses; пишем весь список целиком.
  const writeStatuses = (pid, statuses) => {
    patchProjectLocal(pid, (p) => ({ ...p, statuses }));
    run(supabase.from("projects").update({ statuses }).eq("id", pid));
  };
  const addStatus = (pid) => {
    const proj = projects.find((p) => p.id === pid);
    if (!proj) return;
    const used = proj.statuses.map((s) => s.color);
    const color = PROJECT_COLORS.find((c) => !used.includes(c)) || PROJECT_COLORS[0];
    writeStatuses(pid, [...proj.statuses, { id: newId(), label: "Новый статус", color }]);
  };
  const renameStatus = (pid, sid, label) => {
    const proj = projects.find((p) => p.id === pid);
    if (!proj) return;
    writeStatuses(pid, proj.statuses.map((s) => (s.id === sid ? { ...s, label } : s)));
  };
  const recolorStatus = (pid, sid, color) => {
    const proj = projects.find((p) => p.id === pid);
    if (!proj) return;
    writeStatuses(pid, proj.statuses.map((s) => (s.id === sid ? { ...s, color } : s)));
  };
  const reorderStatuses = (pid, ordered) => writeStatuses(pid, ordered);
  const deleteStatus = (pid, sid) => {
    const proj = projects.find((p) => p.id === pid);
    if (!proj || proj.statuses.length <= 1) return; // последний статус не удаляем
    const remaining = proj.statuses.filter((s) => s.id !== sid);
    const target = remaining[0].id; // задачи удаляемой колонки уезжают в первую
    patchProjectLocal(pid, (p) => ({
      ...p,
      statuses: remaining,
      tasks: p.tasks.map((t) => (t.status === sid ? { ...t, status: target } : t)),
    }));
    run(supabase.from("projects").update({ statuses: remaining }).eq("id", pid));
    run(supabase.from("tasks").update({ status: target }).eq("project_id", pid).eq("status", sid));
  };
  // Название и версия проекта фиксируются по Enter/клику мимо (см. Editable.jsx),
  // поэтому пишем сразу — это уже разовое сохранение, а не «на каждую букву».
  const setName = (id, name) => {
    patchProjectLocal(id, (p) => ({ ...p, name }));
    run(supabase.from("projects").update({ name }).eq("id", id));
  };
  const setBuild = (id, build) => {
    patchProjectLocal(id, (p) => ({ ...p, build }));
    run(supabase.from("projects").update({ build }).eq("id", id));
  };
  const setArchived = (id, archived) => {
    patchProjectLocal(id, (p) => ({ ...p, archived }));
    run(supabase.from("projects").update({ archived }).eq("id", id));
  };

  // ── Задачи ───────────────────────────────────────────────────────────────
  // Следующий порядковый номер (в конец) — берём максимум по проекту и +1.
  const nextOrder = (proj) =>
    (proj && proj.tasks.length ? Math.max(...proj.tasks.map((t) => t.order || 0)) : 0) + 1;

  const addTask = (pid, status = "todo", build = "") => {
    const id = newId();
    const proj = projects.find((p) => p.id === pid);
    const order = nextOrder(proj);
    const task = {
      id, title: "Новая задача", desc: "", notes: "",
      priority: "med", status, platform: "both", version: build, order, shots: [],
    };
    patchProjectLocal(pid, (p) => ({ ...p, tasks: [...p.tasks, task] }));
    run(supabase.from("tasks").insert({
      id, project_id: pid, title: task.title, description: "", notes: "",
      priority: "med", status, platform: "both", version: build, sort_order: order,
    }));
    return task;
  };
  // Смена статуса (выпадашка/кнопки) — задача уезжает в конец нового статуса.
  const moveTask = (pid, tid, status) => {
    const proj = projects.find((p) => p.id === pid);
    const order = nextOrder(proj);
    patchTaskLocal(pid, tid, (t) => ({ ...t, status, order }));
    run(supabase.from("tasks").update({ status, sort_order: order }).eq("id", tid));
  };
  // Перестановка/перенос задачи с точной позицией: вставить перед beforeId
  // (или в конец, если beforeId не задан). Дробный порядок = одно обновление.
  const reorderTask = (pid, dragId, targetStatus, beforeId) => {
    const proj = projects.find((p) => p.id === pid);
    if (!proj) return;
    const col = proj.tasks
      .filter((t) => t.status === targetStatus && t.id !== dragId)
      .sort((a, b) => a.order - b.order);
    let idx = beforeId ? col.findIndex((t) => t.id === beforeId) : col.length;
    if (idx < 0) idx = col.length;
    const prev = col[idx - 1];
    const next = col[idx];
    let order;
    if (!prev && !next) order = 1;
    else if (!prev) order = next.order - 1;
    else if (!next) order = prev.order + 1;
    else order = (prev.order + next.order) / 2;
    patchTaskLocal(pid, dragId, (t) => ({ ...t, status: targetStatus, order }));
    run(supabase.from("tasks").update({ status: targetStatus, sort_order: order }).eq("id", dragId));
  };
  const deleteTask = (pid, tid) => {
    // Перед удалением задачи собираем пути её скриншотов, чтобы убрать сами файлы
    // из Storage. Иначе запись в базе удалится (каскадом), а картинки осядут
    // в хранилище мусором.
    const victim = projects.find((p) => p.id === pid)?.tasks.find((t) => t.id === tid);
    const paths = (victim?.shots || []).map((s) => s.path).filter(Boolean);
    patchProjectLocal(pid, (p) => ({ ...p, tasks: p.tasks.filter((t) => t.id !== tid) }));
    if (paths.length) run(supabase.storage.from(SHOTS_BUCKET).remove(paths));
    run(supabase.from("tasks").delete().eq("id", tid));
  };

  // Правка полей задачи. Текстовые поля приходят сюда уже зафиксированными
  // (по Enter/клику мимо, см. Editable.jsx), кнопки приоритета/платформы — по клику.
  // В обоих случаях это разовое сохранение, поэтому пишем в базу сразу.
  const editTask = (pid, tid, patch) => {
    patchTaskLocal(pid, tid, (t) => ({ ...t, ...patch }));
    const dbPatch = taskPatchToDb(patch);
    if (Object.keys(dbPatch).length) run(supabase.from("tasks").update(dbPatch).eq("id", tid));
  };

  // ── Скриншоты задачи (Storage) ─────────────────────────────────────────────
  // Получаем настоящие файлы из панели: грузим в бакет, строку с путём — в базу.
  const addShots = (pid, tid, files) => {
    files.forEach((file) => {
      const id = newId();
      // Мгновенное превью из памяти браузера (оригинал), пока идёт сжатие и загрузка.
      const localUrl = URL.createObjectURL(file);
      patchTaskLocal(pid, tid, (t) => ({
        ...t, shots: [...t.shots, { id, name: file.name, path: null, url: localUrl }],
      }));
      (async () => {
        // Сжимаем перед загрузкой. Имя в Storage делаем безопасным (латиница/цифры),
        // настоящее имя файла храним в attachments.name.
        const { blob, contentType, ext } = await compressImage(file);
        const path = `${tid}/${id}.${ext}`;
        const up = await supabase.storage.from(SHOTS_BUCKET).upload(path, blob, { contentType });
        if (up.error) {
          console.error("[Protoboard] Не удалось загрузить файл:", up.error.message);
          return;
        }
        // После загрузки подменяем локальную ссылку на постоянную публичную и сохраняем путь.
        const publicUrl = shotUrl(path);
        patchTaskLocal(pid, tid, (t) => ({
          ...t, shots: t.shots.map((s) => (s.id === id ? { ...s, url: publicUrl, path } : s)),
        }));
        run(supabase.from("attachments").insert({ id, task_id: tid, file_path: path, name: file.name }));
      })();
    });
  };
  const removeShot = (pid, tid, shotId) => {
    let path = null;
    patchTaskLocal(pid, tid, (t) => {
      const shot = t.shots.find((s) => s.id === shotId);
      path = shot?.path || null;
      return { ...t, shots: t.shots.filter((s) => s.id !== shotId) };
    });
    if (path) run(supabase.storage.from(SHOTS_BUCKET).remove([path]));
    run(supabase.from("attachments").delete().eq("id", shotId));
  };

  return {
    projects,
    loadState, reload: loadAll,
    createProject, setName, setColor, setArchived, setBuild,
    addStatus, renameStatus, recolorStatus, reorderStatuses, deleteStatus,
    addTask, moveTask, reorderTask, editTask, deleteTask,
    addShots, removeShot,
  };
}
