// Одноразовый скрипт: копирует проекты и задачи из Supabase в Firebase.
// Запустить: node scripts/migrate-to-firebase.js
//
// Перед запуском:
//   1) Нажмите "Resume project" в Supabase и подождите 1-2 минуты.
//   2) npm run dev должен быть остановлен (или не важно, можно оставить).

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, writeBatch } from "firebase/firestore";

// ── Ключи Supabase (источник) ───────────────────────────────────────────────
const SB_URL = "https://thlcioruvtiucwtzqure.supabase.co";
const SB_KEY = "sb_publishable_G-Lnpz9Wmk-7rBwBbLJeSA_BhiwZbTR";

// ── Ключи Firebase (назначение) ─────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyALLHag0_mx288Msqo3_DLmirOy1fU8QpA",
  authDomain: "protoboard-fb.firebaseapp.com",
  projectId: "protoboard-fb",
  storageBucket: "protoboard-fb.firebasestorage.app",
  messagingSenderId: "541710955779",
  appId: "1:541710955779:web:a42cd92d72336a9f80e536",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sbHeaders = {
  apikey: SB_KEY,
  Authorization: `Bearer ${SB_KEY}`,
  "Content-Type": "application/json",
};

async function fetchSupabase(path) {
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, { headers: sbHeaders });
  if (!res.ok) throw new Error(`Supabase ${path}: ${res.status} ${await res.text()}`);
  return res.json();
}

async function run() {
  console.log("Загружаю данные из Supabase...");

  const [projects, tasks] = await Promise.all([
    fetchSupabase("projects?select=*&order=created_at.desc"),
    fetchSupabase("tasks?select=*&order=sort_order.asc"),
  ]);

  console.log(`Найдено: ${projects.length} проектов, ${tasks.length} задач`);
  console.log("Пишу в Firestore...");

  // Firestore batch позволяет записать до 500 документов за раз.
  const BATCH_SIZE = 400;

  const allDocs = [
    ...projects.map((p) => ({
      ref: doc(db, "projects", p.id),
      data: {
        name: p.name || "",
        build: p.build || "",
        archived: p.archived || false,
        color: p.color || "#6366f1",
        statuses: Array.isArray(p.statuses) ? p.statuses : [],
        createdAt: p.created_at ? new Date(p.created_at).getTime() : Date.now(),
      },
    })),
    ...tasks.map((t) => ({
      ref: doc(db, "tasks", t.id),
      data: {
        projectId: t.project_id,
        title: t.title || "",
        description: t.description || "",
        notes: t.notes || "",
        priority: t.priority || "med",
        status: t.status || "todo",
        platform: t.platform || "both",
        version: t.version || "",
        sortOrder: t.sort_order ?? 0,
        num: t.num ?? null,
        createdAt: t.created_at ? new Date(t.created_at).getTime() : Date.now(),
      },
    })),
  ];

  for (let i = 0; i < allDocs.length; i += BATCH_SIZE) {
    const chunk = allDocs.slice(i, i + BATCH_SIZE);
    const batch = writeBatch(db);
    chunk.forEach(({ ref, data }) => batch.set(ref, data));
    await batch.commit();
    console.log(`  записано ${Math.min(i + BATCH_SIZE, allDocs.length)} / ${allDocs.length}`);
  }

  console.log("✓ Готово! Все данные перенесены в Firebase.");
  console.log("  Скриншоты не переносятся — их нужно будет загрузить заново.");
  process.exit(0);
}

run().catch((e) => {
  console.error("Ошибка миграции:", e.message);
  process.exit(1);
});
