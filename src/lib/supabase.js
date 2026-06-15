import { createClient } from "@supabase/supabase-js";

// Подключение к Supabase. Ключи берутся из .env.local (в GitHub не попадают).
// VITE_* — так Vite разрешает читать переменные в коде браузера.
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Удобный флаг: настроены ли ключи. Пока их нет — приложение не падает,
// просто показывает пустой список и подсказку в консоли.
export const isConfigured = Boolean(url && key);

if (!isConfigured) {
  console.warn(
    "[Protoboard] Supabase не настроен. Создай файл .env.local в корне проекта " +
      "и впиши VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY (Supabase → Settings → API), " +
      "затем перезапусти `npm run dev`."
  );
}

export const supabase = isConfigured ? createClient(url, key) : null;

// Имя бакета в Storage, куда грузим скриншоты.
export const SHOTS_BUCKET = "screenshots";

// Публичная ссылка на загруженный файл по его пути в бакете.
export const shotUrl = (path) =>
  supabase.storage.from(SHOTS_BUCKET).getPublicUrl(path).data.publicUrl;
