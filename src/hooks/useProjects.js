import { useCallback, useEffect, useRef, useState } from "react";
import {
  collection, doc, setDoc, updateDoc, deleteDoc, writeBatch, onSnapshot,
  getDocs, query, where,
} from "firebase/firestore";
import { db, isConfigured } from "../lib/firebase.js";
import { compressImage } from "../lib/image.js";
import { DEFAULT_COLOR, DEFAULT_STATUSES, PROJECT_COLORS, GLOBAL_TAGS } from "../constants.js";

// Blob → base64 data URL (для хранения картинок в Firestore).
const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });

const newId = () => crypto.randomUUID();

// ── Перевод документов Firestore → удобный вид для экранов ──────────────────
const rowToTask = (data) => ({
  id: data.id,
  _projectId: data.projectId,
  title: data.title || "",
  desc: data.description || "",
  notes: data.notes || "",
  priority: data.priority || "med",
  status: data.status,
  platform: data.platform || "both",
  version: data.version || "",
  order: data.sortOrder ?? 0,
  num: data.num ?? null,
  created: data.createdAt ? new Date(data.createdAt).toISOString() : null,
  tags: Array.isArray(data.tags) ? data.tags : [],
  dueDate: data.dueDate || "",
  assignee: data.assignee || "",
  completedAt: data.completedAt || null,
  closed: data.closed || false,
  shots: [],
  shotsLoaded: false,
  activity: [],
  activityLoaded: false,
});

const rowToProject = (data) => ({
  id: data.id,
  name: data.name || "",
  build: data.build || "",
  archived: data.archived || false,
  color: data.color || DEFAULT_COLOR,
  statuses: (data.statuses && data.statuses.length) ? data.statuses : DEFAULT_STATUSES,
  customTags: Array.isArray(data.customTags) ? data.customTags : [],
  gradient: data.gradient || "",
  _createdAt: typeof data.createdAt === "number" ? data.createdAt : 0,
  tasks: [],
});

// Перевод "удобных" полей задачи → поля Firestore.
const taskFieldsToDb = (patch) => {
  const out = {};
  if ("title" in patch) out.title = patch.title;
  if ("desc" in patch) out.description = patch.desc;
  if ("notes" in patch) out.notes = patch.notes;
  if ("priority" in patch) out.priority = patch.priority;
  if ("status" in patch) out.status = patch.status;
  if ("platform" in patch) out.platform = patch.platform;
  if ("version" in patch) out.version = patch.version;
  if ("order" in patch) out.sortOrder = patch.order;
  if ("dueDate" in patch) out.dueDate = patch.dueDate;
  if ("assignee" in patch) out.assignee = patch.assignee;
  if ("completedAt" in patch) out.completedAt = patch.completedAt;
  if ("closed" in patch) out.closed = patch.closed;
  return out;
};

const pick = (obj, keys) =>
  keys.reduce((o, k) => (obj && k in obj ? ((o[k] = obj[k]), o) : o), {});

export function useProjects(enabled = true, currentUser = null) {
  const [projects, setProjects] = useState([]);
  const [loadState, setLoadState] = useState(isConfigured ? "loading" : "ready");
  // Увеличение этого счётчика пересоздаёт подписки (retry).
  const [retryKey, setRetryKey] = useState(0);
  // Кэш скриншотов: taskId → { shots, loaded }. Живёт в рефе, чтобы rebuild()
  // не сбрасывал уже загруженные скриншоты при каждом обновлении Firestore.
  const shotsCacheRef = useRef(new Map());
  const activityCacheRef = useRef(new Map());

  // ── Локальные помощники ─────────────────────────────────────────────────────
  const patchProjectLocal = (id, fn) =>
    setProjects((ps) => ps.map((p) => (p.id === id ? fn(p) : p)));
  const patchTaskLocal = (pid, tid, fn) =>
    patchProjectLocal(pid, (p) => ({
      ...p,
      tasks: p.tasks.map((t) => (t.id === tid ? fn(t) : t)),
    }));

  const reload = useCallback(() => {
    setLoadState("loading");
    setRetryKey((k) => k + 1);
  }, []);

  // ── Realtime-подписки Firestore ─────────────────────────────────────────────
  // onSnapshot заменяет и начальную загрузку, и Supabase Realtime одновременно:
  // первый вызов коллбэка приносит все данные, последующие — только изменения.
  useEffect(() => {
    if (!enabled) return;
    if (!isConfigured) { setLoadState("ready"); return; }

    const projectsMap = new Map();
    const tasksMap = new Map();
    let projectsLoaded = false;
    let tasksLoaded = false;

    // Пересобираем весь список проектов из карт после любого изменения.
    const rebuild = () => {
      if (!projectsLoaded || !tasksLoaded) return;
      const assembled = Array.from(projectsMap.values())
        .sort((a, b) => (b._createdAt || 0) - (a._createdAt || 0))
        .map((p) => ({
          ...p,
          tasks: Array.from(tasksMap.values())
            .filter((t) => t._projectId === p.id)
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((t) => {
            const sc = shotsCacheRef.current.get(t.id);
            const ac = activityCacheRef.current.get(t.id);
            return {
              ...t,
              shots: sc?.shots || [],
              shotsLoaded: sc?.loaded || false,
              activity: ac?.entries || [],
              activityLoaded: ac?.loaded || false,
            };
          }),
        }));
      setProjects(assembled);
      setLoadState("ready");
    };

    const unsubProjects = onSnapshot(
      collection(db, "projects"),
      (snap) => {
        snap.docChanges().forEach((change) => {
          if (change.type === "removed") {
            projectsMap.delete(change.doc.id);
          } else {
            projectsMap.set(change.doc.id, rowToProject({ id: change.doc.id, ...change.doc.data() }));
          }
        });
        projectsLoaded = true;
        rebuild();
      },
      (err) => { console.error("[Protoboard] Firebase projects:", err); setLoadState("error"); }
    );

    const unsubTasks = onSnapshot(
      collection(db, "tasks"),
      (snap) => {
        snap.docChanges().forEach((change) => {
          if (change.type === "removed") {
            tasksMap.delete(change.doc.id);
          } else {
            tasksMap.set(change.doc.id, rowToTask({ id: change.doc.id, ...change.doc.data() }));
          }
        });
        tasksLoaded = true;
        rebuild();
      },
      (err) => { console.error("[Protoboard] Firebase tasks:", err); setLoadState("error"); }
    );

    return () => { unsubProjects(); unsubTasks(); };
  }, [retryKey, enabled]);

  // Пишем в Firestore и логируем ошибку, не роняя интерфейс.
  const run = (promise) =>
    Promise.resolve(promise).catch((e) => {
      console.error("[Protoboard] Ошибка записи в Firebase:", e?.message || e);
    });

  // ── Отмена действий (Ctrl+Z) ────────────────────────────────────────────────
  const undoRef = useRef([]);
  const MAX_UNDO = 40;
  const pushUndo = (entry) => {
    undoRef.current.push(entry);
    while (undoRef.current.length > MAX_UNDO) {
      const dropped = undoRef.current.shift();
      dropped.finalize?.();
    }
  };
  const undo = useCallback(async () => {
    const entry = undoRef.current.pop();
    if (!entry) return null;
    await entry.undo();
    return entry.label;
  }, []);

  const undoTaskFields = (pid, tid, fields) => async () => {
    patchTaskLocal(pid, tid, (t) => ({ ...t, ...fields }));
    const dbPatch = taskFieldsToDb(fields);
    if (Object.keys(dbPatch).length) await run(updateDoc(doc(db, "tasks", tid), dbPatch));
  };
  const undoProjectFields = (pid, fields) => async () => {
    patchProjectLocal(pid, (p) => ({ ...p, ...fields }));
    await run(updateDoc(doc(db, "projects", pid), fields));
  };
  const undoStatuses = (pid, statuses) => async () => {
    patchProjectLocal(pid, (p) => ({ ...p, statuses }));
    await run(updateDoc(doc(db, "projects", pid), { statuses }));
  };

  // ── Проекты ─────────────────────────────────────────────────────────────────
  const createProject = (name, color = DEFAULT_COLOR) => {
    const trimmed = (name || "").trim();
    if (!trimmed) return null;
    const id = newId();
    const statuses = DEFAULT_STATUSES;
    const proj = { id, name: trimmed, build: "v0.1", archived: false, color, statuses, tasks: [] };
    setProjects((ps) => [proj, ...ps]);
    run(setDoc(doc(db, "projects", id), {
      name: trimmed, build: "v0.1", archived: false, color, statuses, createdAt: Date.now(),
    }));
    pushUndo({
      label: "создание проекта",
      undo: async () => {
        setProjects((ps) => ps.filter((p) => p.id !== id));
        await run(deleteDoc(doc(db, "projects", id)));
      },
    });
    return proj;
  };

  const setColor = (id, color) => {
    const old = projects.find((p) => p.id === id)?.color;
    if (old !== undefined) pushUndo({ label: "цвет проекта", undo: undoProjectFields(id, { color: old }) });
    patchProjectLocal(id, (p) => ({ ...p, color }));
    run(updateDoc(doc(db, "projects", id), { color }));
  };

  const setGradient = (id, gradient) => {
    patchProjectLocal(id, (p) => ({ ...p, gradient }));
    run(updateDoc(doc(db, "projects", id), { gradient }));
  };

  // ── Статусы ─────────────────────────────────────────────────────────────────
  const writeStatuses = (pid, statuses) => {
    patchProjectLocal(pid, (p) => ({ ...p, statuses }));
    run(updateDoc(doc(db, "projects", pid), { statuses }));
  };
  const addStatus = (pid) => {
    const proj = projects.find((p) => p.id === pid);
    if (!proj) return;
    const used = proj.statuses.map((s) => s.color);
    const color = PROJECT_COLORS.find((c) => !used.includes(c)) || PROJECT_COLORS[0];
    pushUndo({ label: "добавление статуса", undo: undoStatuses(pid, proj.statuses) });
    writeStatuses(pid, [...proj.statuses, { id: newId(), label: "Новый статус", color }]);
  };
  const renameStatus = (pid, sid, label) => {
    const proj = projects.find((p) => p.id === pid);
    if (!proj) return;
    pushUndo({ label: "переименование статуса", undo: undoStatuses(pid, proj.statuses) });
    writeStatuses(pid, proj.statuses.map((s) => (s.id === sid ? { ...s, label } : s)));
  };
  const recolorStatus = (pid, sid, color) => {
    const proj = projects.find((p) => p.id === pid);
    if (!proj) return;
    pushUndo({ label: "цвет статуса", undo: undoStatuses(pid, proj.statuses) });
    writeStatuses(pid, proj.statuses.map((s) => (s.id === sid ? { ...s, color } : s)));
  };
  const reorderStatuses = (pid, ordered) => {
    const proj = projects.find((p) => p.id === pid);
    if (proj) pushUndo({ label: "порядок статусов", undo: undoStatuses(pid, proj.statuses) });
    writeStatuses(pid, ordered);
  };
  const deleteStatus = (pid, sid) => {
    const proj = projects.find((p) => p.id === pid);
    if (!proj || proj.statuses.length <= 1) return;
    const oldStatuses = proj.statuses;
    const remaining = proj.statuses.filter((s) => s.id !== sid);
    const target = remaining[0].id;
    const movedIds = proj.tasks.filter((t) => t.status === sid).map((t) => t.id);
    patchProjectLocal(pid, (p) => ({
      ...p,
      statuses: remaining,
      tasks: p.tasks.map((t) => (t.status === sid ? { ...t, status: target } : t)),
    }));
    run(updateDoc(doc(db, "projects", pid), { statuses: remaining }));
    if (movedIds.length) {
      const batch = writeBatch(db);
      movedIds.forEach((tid) => batch.update(doc(db, "tasks", tid), { status: target }));
      run(batch.commit());
    }
    pushUndo({
      label: "удаление статуса",
      undo: async () => {
        patchProjectLocal(pid, (p) => ({
          ...p,
          statuses: oldStatuses,
          tasks: p.tasks.map((t) => (movedIds.includes(t.id) ? { ...t, status: sid } : t)),
        }));
        await run(updateDoc(doc(db, "projects", pid), { statuses: oldStatuses }));
        if (movedIds.length) {
          const batch = writeBatch(db);
          movedIds.forEach((tid) => batch.update(doc(db, "tasks", tid), { status: sid }));
          await run(batch.commit());
        }
      },
    });
  };

  const setName = (id, name) => {
    const old = projects.find((p) => p.id === id)?.name;
    if (old !== undefined) pushUndo({ label: "имя проекта", undo: undoProjectFields(id, { name: old }) });
    patchProjectLocal(id, (p) => ({ ...p, name }));
    run(updateDoc(doc(db, "projects", id), { name }));
  };
  const setBuild = (id, build) => {
    const old = projects.find((p) => p.id === id)?.build;
    if (old !== undefined) pushUndo({ label: "версия проекта", undo: undoProjectFields(id, { build: old }) });
    patchProjectLocal(id, (p) => ({ ...p, build }));
    run(updateDoc(doc(db, "projects", id), { build }));
  };
  const setArchived = (id, archived) => {
    pushUndo({ label: archived ? "архивирование" : "возврат из архива", undo: undoProjectFields(id, { archived: !archived }) });
    patchProjectLocal(id, (p) => ({ ...p, archived }));
    run(updateDoc(doc(db, "projects", id), { archived }));
  };

  // ── Задачи ───────────────────────────────────────────────────────────────────
  const nextOrder = (proj) =>
    (proj && proj.tasks.length ? Math.max(...proj.tasks.map((t) => t.order || 0)) : 0) + 1;
  const nextNum = (proj) =>
    (proj && proj.tasks.length ? Math.max(0, ...proj.tasks.map((t) => t.num || 0)) : 0) + 1;

  const addTask = (pid, status = "todo", build = "") => {
    const id = newId();
    const proj = projects.find((p) => p.id === pid);
    const order = nextOrder(proj);
    const num = nextNum(proj);
    const task = {
      id, title: "Новая задача", desc: "", notes: "",
      priority: "med", status, platform: "both", version: build, order, num,
      created: new Date().toISOString(), tags: [], shots: [], shotsLoaded: true,
      activity: [], activityLoaded: true,
    };
    shotsCacheRef.current.set(id, { shots: [], loaded: true });
    activityCacheRef.current.set(id, { entries: [], loaded: true });
    patchProjectLocal(pid, (p) => ({ ...p, tasks: [...p.tasks, task] }));
    run(setDoc(doc(db, "tasks", id), {
      projectId: pid, title: task.title, description: "", notes: "",
      priority: "med", status, platform: "both", version: build,
      sortOrder: order, num, tags: [], dueDate: "", assignee: "", createdAt: Date.now(),
    }));
    logActivity(pid, id, "Задача создана");
    pushUndo({
      label: "создание задачи",
      undo: async () => {
        patchProjectLocal(pid, (p) => ({ ...p, tasks: p.tasks.filter((t) => t.id !== id) }));
        await run(deleteDoc(doc(db, "tasks", id)));
      },
    });
    return task;
  };

  const moveTask = (pid, tid, status) => {
    const proj = projects.find((p) => p.id === pid);
    const order = nextOrder(proj);
    const t = proj?.tasks.find((x) => x.id === tid);
    if (t) pushUndo({ label: "перемещение задачи", undo: undoTaskFields(pid, tid, { status: t.status, order: t.order, completedAt: t.completedAt }) });
    const isDoneStatus = proj?.statuses[proj.statuses.length - 1]?.id === status;
    const completedAt = isDoneStatus ? Date.now() : null;
    patchTaskLocal(pid, tid, (t) => ({ ...t, status, order, completedAt }));
    run(updateDoc(doc(db, "tasks", tid), { status, sortOrder: order, completedAt }));
    const label = proj?.statuses.find((s) => s.id === status)?.label || status;
    logActivity(pid, tid, `Статус → ${label}`);
  };

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
    const dragged = proj.tasks.find((t) => t.id === dragId);
    if (dragged) pushUndo({ label: "перестановка задачи", undo: undoTaskFields(pid, dragId, { status: dragged.status, order: dragged.order }) });
    patchTaskLocal(pid, dragId, (t) => ({ ...t, status: targetStatus, order }));
    run(updateDoc(doc(db, "tasks", dragId), { status: targetStatus, sortOrder: order }));
  };

  const deleteTask = (pid, tid) => {
    const victim = projects.find((p) => p.id === pid)?.tasks.find((t) => t.id === tid);
    if (!victim) return;
    const shotIds = (victim.shots || []).map((s) => s.id);
    patchProjectLocal(pid, (p) => ({ ...p, tasks: p.tasks.filter((t) => t.id !== tid) }));
    run(deleteDoc(doc(db, "tasks", tid)));
    // Скриншоты из Firestore НЕ удаляем сразу — вдруг Ctrl+Z.
    // Удаляем в finalize, когда отмена уже невозможна.
    pushUndo({
      label: "удаление задачи",
      undo: async () => {
        shotsCacheRef.current.set(tid, { shots: victim.shots || [], loaded: true });
        patchProjectLocal(pid, (p) =>
          p.tasks.some((t) => t.id === tid) ? p : { ...p, tasks: [...p.tasks, victim] }
        );
        await run(setDoc(doc(db, "tasks", tid), {
          projectId: pid, title: victim.title, description: victim.desc || "",
          notes: victim.notes || "", priority: victim.priority, status: victim.status,
          platform: victim.platform, version: victim.version || "",
          sortOrder: victim.order, num: victim.num, createdAt: Date.now(),
        }));
      },
      finalize: () => {
        if (shotIds.length) {
          const batch = writeBatch(db);
          shotIds.forEach((id) => batch.delete(doc(db, "attachments", id)));
          run(batch.commit());
        }
      },
    });
  };

  const editTask = (pid, tid, patch) => {
    const t = projects.find((p) => p.id === pid)?.tasks.find((x) => x.id === tid);
    if (t) pushUndo({ label: "изменение задачи", undo: undoTaskFields(pid, tid, pick(t, Object.keys(patch))) });
    patchTaskLocal(pid, tid, (t) => ({ ...t, ...patch }));
    const dbPatch = taskFieldsToDb(patch);
    if (Object.keys(dbPatch).length) run(updateDoc(doc(db, "tasks", tid), dbPatch));
    if (patch.priority) {
      const lbl = { high: "Высокий", med: "Средний", low: "Низкий" }[patch.priority] || patch.priority;
      logActivity(pid, tid, `Приоритет → ${lbl}`);
    }
  };

  // ── Удаление проекта (со всеми задачами, вложениями, логами) ────────────────
  const deleteProject = async (pid) => {
    const proj = projects.find((p) => p.id === pid);
    if (!proj) return;
    setProjects((ps) => ps.filter((p) => p.id !== pid));
    const taskIds = proj.tasks.map((t) => t.id);
    await Promise.all(taskIds.map(async (tid) => {
      const [aSnap, actSnap] = await Promise.all([
        getDocs(query(collection(db, "attachments"), where("taskId", "==", tid))),
        getDocs(query(collection(db, "activity"), where("taskId", "==", tid))),
      ]);
      await Promise.all([
        ...aSnap.docs.map((d) => deleteDoc(d.ref)),
        ...actSnap.docs.map((d) => deleteDoc(d.ref)),
      ]);
    }));
    await Promise.all(taskIds.map((tid) => deleteDoc(doc(db, "tasks", tid))));
    await deleteDoc(doc(db, "projects", pid));
  };

  // ── Лог изменений ───────────────────────────────────────────────────────────
  const logActivity = (pid, tid, action) => {
    const authorName = currentUser?.displayName || currentUser?.email || null;
    run(setDoc(doc(db, "activity", newId()), { projectId: pid, taskId: tid, action, authorName, timestamp: Date.now() }));
  };

  const loadActivity = useCallback(async (pid, tid) => {
    if (activityCacheRef.current.get(tid)?.loaded) return;
    try {
      const snap = await getDocs(query(collection(db, "activity"), where("taskId", "==", tid)));
      const entries = snap.docs
        .map((d) => ({ id: d.id, action: d.data().action, authorName: d.data().authorName || null, timestamp: d.data().timestamp || 0 }))
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 50);
      activityCacheRef.current.set(tid, { entries, loaded: true });
      patchTaskLocal(pid, tid, (t) => ({ ...t, activity: entries, activityLoaded: true }));
    } catch (e) {
      console.error("[Protoboard] Не удалось загрузить историю:", e.message);
      activityCacheRef.current.set(tid, { entries: [], loaded: true });
      patchTaskLocal(pid, tid, (t) => ({ ...t, activity: [], activityLoaded: true }));
    }
  }, []);

  // ── Теги ────────────────────────────────────────────────────────────────────
  const addTag = (pid, tid, tag) => {
    const proj = projects.find((p) => p.id === pid);
    if (!proj) return;
    const task = proj.tasks.find((t) => t.id === tid);
    if (!task || task.tags.includes(tag)) return;
    const newTags = [...task.tags, tag];
    patchTaskLocal(pid, tid, (t) => ({ ...t, tags: newTags }));
    run(updateDoc(doc(db, "tasks", tid), { tags: newTags }));
    if (!GLOBAL_TAGS.includes(tag) && !proj.customTags.includes(tag)) {
      const newCustomTags = [...proj.customTags, tag];
      patchProjectLocal(pid, (p) => ({ ...p, customTags: newCustomTags }));
      run(updateDoc(doc(db, "projects", pid), { customTags: newCustomTags }));
    }
    logActivity(pid, tid, `Тег: +${tag}`);
  };

  const removeTag = (pid, tid, tag) => {
    const task = projects.find((p) => p.id === pid)?.tasks.find((t) => t.id === tid);
    if (!task) return;
    const newTags = task.tags.filter((t) => t !== tag);
    patchTaskLocal(pid, tid, (t) => ({ ...t, tags: newTags }));
    run(updateDoc(doc(db, "tasks", tid), { tags: newTags }));
    logActivity(pid, tid, `Тег: -${tag}`);
  };

  const removeProjectTag = (pid, tag) => {
    const proj = projects.find((p) => p.id === pid);
    if (!proj) return;
    const newCustomTags = proj.customTags.filter((t) => t !== tag);
    patchProjectLocal(pid, (p) => ({ ...p, customTags: newCustomTags }));
    run(updateDoc(doc(db, "projects", pid), { customTags: newCustomTags }));
    proj.tasks.forEach((task) => {
      if (task.tags.includes(tag)) {
        const newTags = task.tags.filter((t) => t !== tag);
        patchTaskLocal(pid, task.id, (t) => ({ ...t, tags: newTags }));
        run(updateDoc(doc(db, "tasks", task.id), { tags: newTags }));
      }
    });
  };

  // ── Скриншоты (Firestore base64) ────────────────────────────────────────────
  // Загрузка скриншотов задачи при открытии панели (ленивая, по требованию).
  const loadShots = useCallback(async (pid, tid) => {
    if (shotsCacheRef.current.get(tid)?.loaded) return; // уже загружено
    try {
      const snap = await getDocs(query(collection(db, "attachments"), where("taskId", "==", tid)));
      const shots = snap.docs
        .map((d) => ({ id: d.id, name: d.data().name, url: d.data().data, createdAt: d.data().createdAt || 0 }))
        .sort((a, b) => a.createdAt - b.createdAt)
        .map(({ id, name, url }) => ({ id, name, url }));
      // Сохраняем uploading-превью, которые могли уже попасть в кэш до окончания запроса.
      const prev = shotsCacheRef.current.get(tid);
      const uploading = (prev?.shots || []).filter((s) => s.uploading);
      shotsCacheRef.current.set(tid, { shots: [...shots, ...uploading], loaded: true });
      patchTaskLocal(pid, tid, (t) => {
        const inFlight = (t.shots || []).filter((s) => s.uploading);
        return { ...t, shots: [...shots, ...inFlight], shotsLoaded: true };
      });
    } catch (e) {
      console.error("[Protoboard] Не удалось загрузить скриншоты:", e.message);
      const prev = shotsCacheRef.current.get(tid);
      const uploading = (prev?.shots || []).filter((s) => s.uploading);
      shotsCacheRef.current.set(tid, { shots: uploading, loaded: true });
      patchTaskLocal(pid, tid, (t) => {
        const inFlight = (t.shots || []).filter((s) => s.uploading);
        return { ...t, shots: inFlight, shotsLoaded: true };
      });
    }
  }, []);

  const addShots = (pid, tid, files) => {
    files.forEach((file) => {
      const id = newId();
      const localUrl = URL.createObjectURL(file);
      const preview = { id, name: file.name, url: localUrl, uploading: true };
      // Превью кладём и в кэш, чтобы rebuild() не потерял его во время загрузки.
      const cEntry = shotsCacheRef.current.get(tid) || { shots: [], loaded: true };
      shotsCacheRef.current.set(tid, { ...cEntry, shots: [...cEntry.shots, preview] });
      patchTaskLocal(pid, tid, (t) => ({ ...t, shots: [...t.shots, preview], uploadError: false }));
      (async () => {
        try {
          const { blob } = await compressImage(file);
          const dataUrl = await blobToDataUrl(blob);
          await setDoc(doc(db, "attachments", id), {
            taskId: tid, name: file.name, data: dataUrl, createdAt: Date.now(),
          });
          logActivity(pid, tid, "Скриншот добавлен");
          const newShot = { id, name: file.name, url: dataUrl };
          const c = shotsCacheRef.current.get(tid) || { shots: [], loaded: true };
          shotsCacheRef.current.set(tid, { ...c, shots: c.shots.map((s) => s.id === id ? newShot : s) });
          // Если rebuild() успел перетереть состояние — добавляем заново.
          patchTaskLocal(pid, tid, (t) => {
            const shots = t.shots.some((s) => s.id === id)
              ? t.shots.map((s) => s.id === id ? newShot : s)
              : [...t.shots, newShot];
            return { ...t, shots, shotsLoaded: true };
          });
        } catch (e) {
          console.error("[Protoboard] Не удалось загрузить скриншот:", e.message);
          const c = shotsCacheRef.current.get(tid);
          if (c) shotsCacheRef.current.set(tid, { ...c, shots: c.shots.filter((s) => s.id !== id) });
          patchTaskLocal(pid, tid, (t) => ({ ...t, shots: t.shots.filter((s) => s.id !== id), uploadError: true }));
        }
      })();
    });
  };

  const removeShot = (pid, tid, shotId) => {
    patchTaskLocal(pid, tid, (t) => ({ ...t, shots: t.shots.filter((s) => s.id !== shotId) }));
    const cached = shotsCacheRef.current.get(tid);
    if (cached) shotsCacheRef.current.set(tid, { ...cached, shots: cached.shots.filter((s) => s.id !== shotId) });
    run(deleteDoc(doc(db, "attachments", shotId)));
    logActivity(pid, tid, "Скриншот удалён");
  };

  return {
    projects,
    loadState, reload,
    createProject, setName, setColor, setArchived, setBuild, setGradient,
    addStatus, renameStatus, recolorStatus, reorderStatuses, deleteStatus,
    addTask, moveTask, reorderTask, editTask, deleteTask,
    addShots, removeShot, loadShots,
    addTag, removeTag, removeProjectTag,
    loadActivity,
    deleteProject,
    undo,
  };
}
