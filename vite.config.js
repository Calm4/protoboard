import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Настройки сборщика. plugin-react включает поддержку JSX и быстрое
// обновление страницы при сохранении файлов во время разработки.
//
// base — «откуда грузить файлы сайта». Для GitHub Pages сайт лежит не в корне,
// а по адресу .../protoboard/, поэтому при сборке под GitHub передаём
// DEPLOY_BASE=/protoboard/. Локально и на других хостингах остаётся "/" —
// ничего не меняется.
export default defineConfig({
  base: process.env.DEPLOY_BASE || "/",
  plugins: [react()],
});
