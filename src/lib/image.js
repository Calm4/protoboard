// Сжатие картинки в браузере перед загрузкой в Storage.
// Уменьшает большую сторону до maxDim и пережимает в JPEG — вес падает в разы,
// а на вид для скриншотов незаметно. Если сжатие не помогло (картинка и так
// маленькая) — возвращаем оригинал без изменений.

const readAsDataURL = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const extOf = (name) =>
  (name.split(".").pop() || "img").toLowerCase().replace(/[^a-z0-9]/g, "") || "img";

// Скачать картинку по ссылке на компьютер (с оригинальным именем файла).
export async function downloadImage(url, filename = "screenshot") {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  } catch {
    window.open(url, "_blank"); // запасной вариант — открыть в новой вкладке
  }
}

// Возвращает { blob, contentType, ext } для загрузки.
export async function compressImage(file, maxDim = 1920, quality = 0.85) {
  // Не картинка — не трогаем.
  if (!file.type.startsWith("image/")) {
    return { blob: file, contentType: file.type || "application/octet-stream", ext: extOf(file.name) };
  }
  try {
    const img = await loadImage(await readAsDataURL(file));
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff"; // подложка, чтобы прозрачные PNG не стали чёрными
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);

    const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", quality));
    // Если что-то пошло не так или стало не легче — берём оригинал.
    if (!blob || blob.size >= file.size) {
      return { blob: file, contentType: file.type, ext: extOf(file.name) };
    }
    return { blob, contentType: "image/jpeg", ext: "jpg" };
  } catch {
    return { blob: file, contentType: file.type, ext: extOf(file.name) };
  }
}
