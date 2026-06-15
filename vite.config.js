import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Настройки сборщика. plugin-react включает поддержку JSX и быстрое
// обновление страницы при сохранении файлов во время разработки.
export default defineConfig({
  plugins: [react()],
});
