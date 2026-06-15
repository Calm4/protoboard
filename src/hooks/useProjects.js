import { useEffect, useState } from "react";
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

  // Отложенная запись текста в базу: пока человек печатает, не дёргаем сервер
  // на каждую букву — ждём паузу ~450 мс и пишем накопленное.
  // ── Локальные помощники: точечно меняем состояние по id ────────────────────
  const patchProjectLocal = (id, fn) =>
    setProjects((ps) => ps.map((p) => (p.id === id ? fn(p) : p)));
  const patchTaskLocal = (pid, tid, fn) =>
    patchProjectLocal(pid, (p) => ({
      ...p,
      tasks: p.tasks.map((t) => (t.id === tid ? fn(t) : t)),
    }));

  // ── Первая загрузка + подписка на живые обновления ─────────────────────────
  useEffect(() => {
    if (!isConfigured) return; // ключей нет — показываем пустой экран

    let cancelled = false;

    (async () => {
      const [{ data: projRows }, { data: taskRows }, { data: attRows }] = await Promise.all([
        supabase.from("projects").select("*").order("created_at", { ascending: false }),
        supabase.from("tasks").select("*").order("created_at", { ascending: true }),
        supabase.from("attachments").select("*").order("created_at", { ascending: true }),
      ]);
      if (cancelled) return;

      // Собираем вложенную структуру: проект → его задачи → их скриншоты.
      const tasksByProject = {};
      (taskRows || []).forEach((r) => {
        (tasksByProject[r.project_id] ||= []).push(rowToTask(r));
      });
      const shotsByTask = {};
      (attRows || []).forEach((r) => {
        (shotsByTask[r.task_id] ||= []).push(rowToShot(r));
      });
      const assembled = (projRows || []).map((p) => {
        const proj = rowToProject(p);
        proj.tasks = (tasksByProject[p.id] || []).map((t) => ({
          ...t,
          shots: shotsByTask[t.id] || [],
        }));
        return proj;
      });
      setProjects(assembled);
    })();

    // Realtime: слушаем изменения во всех трёх таблицах и применяем по id.
    const channel = supabase
      .channel("protoboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, onProjectChange)
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, onTaskChange)
      .on("postgres_changes", { event: "*", schema: "public", table: "attachments" }, onAttachmentChange)
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  const addTask = (pid, status = "todo", build = "") => {
    const id = newId();
    const task = {
      id, title: "Новая задача", desc: "", notes: "",
      priority: "med", status, platform: "both", version: build, shots: [],
    };
    patchProjectLocal(pid, (p) => ({ ...p, tasks: [...p.tasks, task] }));
    run(supabase.from("tasks").insert({
      id, project_id: pid, title: task.title, description: "", notes: "",
      priority: "med", status, platform: "both", version: build,
    }));
    return task;
  };
  const moveTask = (pid, tid, status) => {
    patchTaskLocal(pid, tid, (t) => ({ ...t, status }));
    run(supabase.from("tasks").update({ status }).eq("id", tid));
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
    createProject, setName, setColor, setArchived, setBuild,
    addStatus, renameStatus, recolorStatus, reorderStatuses, deleteStatus,
    addTask, moveTask, editTask, deleteTask,
    addShots, removeShot,
  };
}
