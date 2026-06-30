// Импорт задач из xlsx (Tasks List) в Protoboard / Firebase
// Запуск: node scripts/import-xlsx-tasks.mjs
// ТРЕБУЕТ: Firestore Rules → allow read, write: if true;

import { initializeApp } from "firebase/app";
import { initializeFirestore, collection, doc, setDoc, getDocs, updateDoc, query, where } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyALLHag0_mx288Msqo3_DLmirOy1fU8QpA",
  authDomain: "protoboard-fb.firebaseapp.com",
  projectId: "protoboard-fb",
  storageBucket: "protoboard-fb.firebasestorage.app",
  messagingSenderId: "541710955779",
  appId: "1:541710955779:web:a42cd92d72336a9f80e536",
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, { experimentalForceLongPolling: true });

// ── Задачи из xlsx (Tasks List tab) ────────────────────────────────────────
const XLS_TASKS = [
  {
    "xlsx_id": "MSP-t001",
    "title": "Активные big stickerbook во вкладке Special отображать в верху",
    "status_hint": "Done",
    "priority": "med",
    "platform": "both",
    "notes": ""
  },
  {
    "xlsx_id": "MSP-t002",
    "title": "Big Stickerbook Easter - запуск у старых игроков (если ивент был пройден)",
    "status_hint": "To Do",
    "priority": "med",
    "platform": "both",
    "notes": ""
  },
  {
    "xlsx_id": "MSP-t003",
    "title": "Сторис: В первых главах есть проблема с масштабированием. Оно слишком сильно увеличено, что не очень удобно для пользователя. Я думаю, что нам следует улучшить возможность уменьшения масштаба.",
    "status_hint": "Ready To Check",
    "priority": "med",
    "platform": "both",
    "notes": ""
  },
  {
    "xlsx_id": "MSP-t004",
    "title": "Сторис: Навигация немного странная. Когда я нажимаю на эпизод, я вижу только опцию «Назад». Поэтому, чтобы воспроизвести главу, мне нужно вернуться к просмотру события, что выглядит как проблема с пользовательским интерфейсом. Было бы гораздо проще, если бы мы позволили игроку просто начать воспроизведение при просмотре эпизода.",
    "status_hint": "Ready To Check",
    "priority": "med",
    "platform": "both",
    "notes": "если фрейм открытый - 2 кнопки (play / back), в ост случаях back"
  },
  {
    "xlsx_id": "MSP-t005",
    "title": "Подсказка: в настоящее время доступно только за алмазы. Можно ли добавить сюда опцию подсказки через RV (1 rv 1 hint)?",
    "status_hint": "On Hold",
    "priority": "med",
    "platform": "both",
    "notes": ""
  },
  {
    "xlsx_id": "MSP-t006",
    "title": "Добавить аналитические ивенты watch_interstitial и watch_rewarded",
    "status_hint": "Ready To Check",
    "priority": "high",
    "platform": "both",
    "notes": ""
  },
  {
    "xlsx_id": "MSP-t007",
    "title": "Поп-ап на разрешение Push Notifications улучшить",
    "status_hint": "Ready To Check",
    "priority": "high",
    "platform": "both",
    "notes": ""
  },
  {
    "xlsx_id": "MSP-t008",
    "title": "Обновить иконку на зимнюю",
    "status_hint": "Done",
    "priority": "high",
    "platform": "both",
    "notes": ""
  },
  {
    "xlsx_id": "MSP-t009",
    "title": "Добавить Lion ADs",
    "status_hint": "Ready To Check",
    "priority": "high",
    "platform": "both",
    "notes": ""
  },
  {
    "xlsx_id": "MSP-t010",
    "title": "Добавить A/B Тест на гемы/энергию",
    "status_hint": "Done",
    "priority": "high",
    "platform": "both",
    "notes": ""
  },
  {
    "xlsx_id": "MSP-t011",
    "title": "YSO SDK",
    "status_hint": "Done",
    "priority": "high",
    "platform": "both",
    "notes": "https://support.axon.ai/en/max/android/preparing-mediated-networks/?networks=593"
  },
  {
    "xlsx_id": "MSP-t012",
    "title": "Multi Events: запускать ивент, который игрок еще не проходил. Если игрок все проходил - ивент который не завершен. Реализацию уточнить.",
    "status_hint": "Ready To Check",
    "priority": "med",
    "platform": "both",
    "notes": "в приоритете запускается тот, который ни разу не запускался, если таких нету, тогда уже если не допрошел"
  },
  {
    "xlsx_id": "MSP-t013",
    "title": "Уменьшить колайдер на Basket в ивенте",
    "status_hint": "Ready To Check",
    "priority": "med",
    "platform": "both",
    "notes": ""
  },
  {
    "xlsx_id": "MSP-t014",
    "title": "Fruit Drop - анимация (последовательное лопание фруктов) после revive и при использовании бустера взрыва лопать фрукт",
    "status_hint": "In Progress",
    "priority": "med",
    "platform": "both",
    "notes": ""
  },
  {
    "xlsx_id": "MSP-t015",
    "title": "Добавить логику на placement \"fall_sticker_merge\"  запуска рекламы в Fruit Drop (merge)",
    "status_hint": "Ready To Check",
    "priority": "med",
    "platform": "both",
    "notes": ""
  },
  {
    "xlsx_id": "MSP-t016",
    "title": "Firebase remote config download configs again if player dont exit game more than 1 day",
    "status_hint": "Ready To Check",
    "priority": "med",
    "platform": "both",
    "notes": ""
  },
  {
    "xlsx_id": "MSP-t017",
    "title": "Swap mechanic for a/b test",
    "status_hint": "Done",
    "priority": "med",
    "platform": "both",
    "notes": ""
  },
  {
    "xlsx_id": "MSP-t018",
    "title": "Почистить Firebase от старых conditions",
    "status_hint": "On Hold",
    "priority": "med",
    "platform": "both",
    "notes": ""
  },
  {
    "xlsx_id": "MSP-t019",
    "title": "Ads config - fruit merge gap",
    "status_hint": "Done",
    "priority": "med",
    "platform": "both",
    "notes": ""
  },
  {
    "xlsx_id": "MSP-t020",
    "title": "Пройтись по именам конфигов в манифестах (Firebase), и структурировать их",
    "status_hint": "On Hold",
    "priority": "med",
    "platform": "both",
    "notes": ""
  },
  {
    "xlsx_id": "MSP-t021",
    "title": "I added a new event in adjust watch_rewarded AND Token: kc0tk8 IOS Token: 6mlx66  can we please add in v 1.27 ?",
    "status_hint": "Done",
    "priority": "med",
    "platform": "both",
    "notes": ""
  },
  {
    "xlsx_id": "MSP-t022",
    "title": "Перенести Lion Ads с 1.27. на 1.28",
    "status_hint": "Done",
    "priority": "med",
    "platform": "both",
    "notes": ""
  },
  {
    "xlsx_id": "MSP-t023",
    "title": "Очистка данных",
    "status_hint": "In Progress",
    "priority": "med",
    "platform": "both",
    "notes": ""
  },
  {
    "xlsx_id": "MSP-t024",
    "title": "При расклейке стикеров - номера стикеров выровнить в одну линию",
    "status_hint": "On Hold",
    "priority": "med",
    "platform": "both",
    "notes": ""
  },
  {
    "xlsx_id": "MSP-t025",
    "title": "Fruit Drop - большое количество иконок ивентов, что затрудняет взаимодействие с полем (нужно что-то придумать)",
    "status_hint": "On Hold",
    "priority": "med",
    "platform": "both",
    "notes": ""
  },
  {
    "xlsx_id": "",
    "title": "главный игровой экран гонки: сделать партикл звезд на сундуке больше по размеру",
    "status_hint": "Done",
    "priority": "med",
    "platform": "both",
    "notes": ""
  },
  {
    "xlsx_id": "",
    "title": "главный игровой экран гонки: облака на фоне сделать меньше по размеру",
    "status_hint": "Done",
    "priority": "med",
    "platform": "both",
    "notes": ""
  },
  {
    "xlsx_id": "",
    "title": "главный игровой экран гонки: внизу иконки игроков не выровнены относительно дороги(либо дорога не ровно стоит)",
    "status_hint": "Done",
    "priority": "med",
    "platform": "both",
    "notes": ""
  },
  {
    "xlsx_id": "",
    "title": "главный игровой экран гонки: сделать название меньше по размеру немного, проверить что бы каждый Stage писался одинаково (2 стэйдж был написан капсом, 3 уже обычно)",
    "status_hint": "Done",
    "priority": "med",
    "platform": "both",
    "notes": ""
  },
  {
    "xlsx_id": "",
    "title": "окно награды: картинки над текстом your reward сделать меньше, как в фигме",
    "status_hint": "Done",
    "priority": "med",
    "platform": "both",
    "notes": ""
  },
  {
    "xlsx_id": "",
    "title": "окно награды: сделать зеленую кнопку Get, убрать кнопку Double",
    "status_hint": "Done",
    "priority": "med",
    "platform": "both",
    "notes": ""
  },
  {
    "xlsx_id": "",
    "title": "окно награды: сделать анимацию облаков медленее",
    "status_hint": "Done",
    "priority": "med",
    "platform": "both",
    "notes": ""
  },
  {
    "xlsx_id": "",
    "title": "главный игровой экран гонки(финиш): сверить кнопку для получения награды с фигмой(иконку сундука сделать больше, флажок поднять выше)",
    "status_hint": "Done",
    "priority": "med",
    "platform": "both",
    "notes": ""
  },
  {
    "xlsx_id": "",
    "title": "заменить картинку на pop-up окнах",
    "status_hint": "Ready To Check",
    "priority": "med",
    "platform": "both",
    "notes": ""
  },
  {
    "xlsx_id": "",
    "title": "добавить новую картинку для pop-up окна анонса",
    "status_hint": "Ready To Check",
    "priority": "med",
    "platform": "both",
    "notes": ""
  },
  {
    "xlsx_id": "",
    "title": "все fruit drop: проверить отображение энергии в батл пас",
    "status_hint": "Done",
    "priority": "med",
    "platform": "both",
    "notes": ""
  },
  {
    "xlsx_id": "",
    "title": "все fruit drop: иконками в прогрес баре в батл пасс должны быть звёзды всегда",
    "status_hint": "Done",
    "priority": "med",
    "platform": "both",
    "notes": ""
  },
  {
    "xlsx_id": "",
    "title": "все fruit drop: картинки элементов фрут дропа выходят за экран на игровом экране",
    "status_hint": "In Progress",
    "priority": "med",
    "platform": "both",
    "notes": ""
  },
  {
    "xlsx_id": "",
    "title": "happy spring: цвет цифер в батл пасе должен быть один (цвет в наградах и прогресс баре отличается), в других сскинах тоже самое",
    "status_hint": "Ready To Check",
    "priority": "med",
    "platform": "both",
    "notes": ""
  },
  {
    "xlsx_id": "",
    "title": "happy spring: заменить паттерн на фон в батл пасе (было некорректно, Алина подправила)",
    "status_hint": "Ready To Check",
    "priority": "med",
    "platform": "both",
    "notes": ""
  },
  {
    "xlsx_id": "",
    "title": "happy spring: заменить плашку под награду (было некорректно, сейчас подправлено в фигме)",
    "status_hint": "Ready To Check",
    "priority": "med",
    "platform": "both",
    "notes": ""
  },
  {
    "xlsx_id": "",
    "title": "easter fest: заменить плашку под награду (было некорректно, сейчас подправлено в фигме)",
    "status_hint": "Ready To Check",
    "priority": "med",
    "platform": "both",
    "notes": ""
  },
  {
    "xlsx_id": "",
    "title": "USA: неправильный цвет цифер в батл пасе",
    "status_hint": "Done",
    "priority": "med",
    "platform": "both",
    "notes": ""
  },
  {
    "xlsx_id": "",
    "title": "USA: фоновый паттерн сделать больше по размеру",
    "status_hint": "Ready To Check",
    "priority": "med",
    "platform": "both",
    "notes": ""
  },
  {
    "xlsx_id": "",
    "title": "Beach Season: неправильный цвет паттерна на игровом экране",
    "status_hint": "Done",
    "priority": "med",
    "platform": "both",
    "notes": ""
  },
  {
    "xlsx_id": "",
    "title": "при использовании любого бустера паузить проигрыш",
    "status_hint": "In Progress",
    "priority": "med",
    "platform": "both",
    "notes": ""
  },
  {
    "xlsx_id": "",
    "title": "Поменять иконку приложения (Lion) (сейчас у нас зимняя)",
    "status_hint": "To Do",
    "priority": "med",
    "platform": "both",
    "notes": ""
  },
  {
    "xlsx_id": "",
    "title": "удалять preview бандлов",
    "status_hint": "To Do",
    "priority": "med",
    "platform": "both",
    "notes": ""
  },
  {
    "xlsx_id": "",
    "title": "Аналитика adjust",
    "status_hint": "To Do",
    "priority": "med",
    "platform": "both",
    "notes": ""
  }
];

// ── Нормализация заголовка для сравнения ────────────────────────────────────
const norm = (s) =>
  (s || "").toLowerCase().replace(/[^а-яёa-z0-9]/gi, " ").replace(/\s+/g, " ").trim().slice(0, 60);

// ── Маппинг статусов xlsx → id статуса проекта ──────────────────────────────
function mapStatus(hint, statuses) {
  const h = hint.toLowerCase();
  for (const s of statuses) {
    const l = s.label.toLowerCase();
    if (h === "done" && (l.includes("done") || l.includes("готов") || l.includes("выполнен"))) return s.id;
    if (h === "in progress" && (l.includes("progress") || l.includes("работ") || l.includes("in prog"))) return s.id;
    if (h === "on hold" && (l.includes("hold") || l.includes("ожид") || l.includes("заморож") || l.includes("пауз"))) return s.id;
    if (h === "ready to check" && (l.includes("ready") || l.includes("check") || l.includes("проверк") || l.includes("review"))) return s.id;
    if (h === "to do" && (l.includes("to do") || l.includes("todo") || l.includes("сделать") || l.includes("открыт") || l.includes("новая"))) return s.id;
  }
  return statuses[0]?.id || "todo";
}

async function run() {
  // 1. Найти проект Merge Stickers Playbook
  const projectsSnap = await getDocs(collection(db, "projects"));
  let mspProject = null;
  for (const d of projectsSnap.docs) {
    if ((d.data().name || "").toLowerCase().includes("merge sticker")) {
      mspProject = { id: d.id, ...d.data() };
      break;
    }
  }
  if (!mspProject) { console.error("❌ Проект 'Merge Stickers Playbook' не найден!"); process.exit(1); }
  console.log(`✓ Проект: "${mspProject.name}" (${mspProject.id})`);
  const statuses = mspProject.statuses || [];
  console.log(`  Статусы: ${statuses.map(s => s.label).join(", ")}`);

  // 2. Получить все существующие задачи
  const tasksSnap = await getDocs(query(collection(db, "tasks"), where("projectId", "==", mspProject.id)));
  const existingTasks = tasksSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  console.log(`  Существующих задач: ${existingTasks.length}`);

  const existingByNorm = new Map(existingTasks.map(t => [norm(t.title), t]));

  // 3. Максимальные значения
  let maxNum = Math.max(0, ...existingTasks.map(t => t.num || 0));
  let maxOrder = Math.max(0, ...existingTasks.map(t => t.sortOrder || 0));

  let added = 0, skipped = 0, updated = 0;
  const addedList = [], updatedList = [];

  for (const xlsTask of XLS_TASKS) {
    const titleNorm = norm(xlsTask.title);
    const existing = existingByNorm.get(titleNorm);

    if (existing) {
      // Задача есть — проверяем пустые поля
      const updates = {};
      if (!existing.priority) updates.priority = xlsTask.priority;
      if (!existing.platform) updates.platform = xlsTask.platform;
      if (Object.keys(updates).length > 0) {
        await updateDoc(doc(db, "tasks", existing.id), updates);
        updated++;
        updatedList.push(`  ~ [#${existing.num}] ${xlsTask.title.slice(0, 55)} → ${JSON.stringify(updates)}`);
      } else {
        skipped++;
      }
    } else {
      // Задачи нет — добавляем
      maxNum++;
      maxOrder++;
      const id = crypto.randomUUID();
      const statusId = mapStatus(xlsTask.status_hint, statuses);
      await setDoc(doc(db, "tasks", id), {
        projectId: mspProject.id,
        title: xlsTask.title,
        description: "",
        notes: xlsTask.notes || "",
        priority: xlsTask.priority,
        status: statusId,
        platform: xlsTask.platform,
        version: "",
        sortOrder: maxOrder,
        num: maxNum,
        tags: [],
        dueDate: "",
        assignee: "",
        createdAt: Date.now(),
        closed: false,
      });
      added++;
      addedList.push(`  + [#${maxNum}] ${xlsTask.title.slice(0, 60)}`);
    }
  }

  console.log("\n═══════════════ РЕЗУЛЬТАТ ═══════════════");
  console.log(`✅ Добавлено: ${added}`);
  if (addedList.length) addedList.forEach(t => console.log(t));
  console.log(`✏️  Обновлено полей: ${updated}`);
  if (updatedList.length) updatedList.forEach(t => console.log(t));
  console.log(`⏭️  Пропущено (уже есть): ${skipped}`);
  console.log("✓ Готово!");
  process.exit(0);
}

run().catch(e => { console.error("Ошибка:", e.message); process.exit(1); });
