import { useEffect, useState } from "react";
import { supabase, isConfigured, SHOTS_BUCKET, shotUrl } from "../lib/supabase.js";

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
  const createProject = (name) => {
    const trimmed = (name || "").trim();
    if (!trimmed) return null;
    const id = newId();
    const proj = { id, name: trimmed, build: "v0.1", archived: false, tasks: [] };
    setProjects((ps) => [proj, ...ps]); // оптимистично
    run(supabase.from("projects").insert({ id, name: trimmed, build: "v0.1", archived: false }));
    return proj;
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
      // Имя файла в хранилище делаем безопасным (только латиница/цифры): Storage
      // не принимает пробелы, тире «—» и кириллицу. Настоящее имя файла храним
      // отдельно в attachments.name и показываем его пользователю.
      const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
      const path = `${tid}/${id}.${ext}`;
      // Мгновенное превью из памяти браузера, пока идёт загрузка.
      const localUrl = URL.createObjectURL(file);
      patchTaskLocal(pid, tid, (t) => ({
        ...t, shots: [...t.shots, { id, name: file.name, path, url: localUrl }],
      }));
      (async () => {
        const up = await supabase.storage.from(SHOTS_BUCKET).upload(path, file);
        if (up.error) {
          console.error("[Protoboard] Не удалось загрузить файл:", up.error.message);
          return;
        }
        // После загрузки подменяем локальную ссылку на постоянную публичную.
        const publicUrl = shotUrl(path);
        patchTaskLocal(pid, tid, (t) => ({
          ...t, shots: t.shots.map((s) => (s.id === id ? { ...s, url: publicUrl } : s)),
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
    createProject, setName, setArchived, setBuild,
    addTask, moveTask, editTask, deleteTask,
    addShots, removeShot,
  };
}
