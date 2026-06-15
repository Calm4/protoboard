// Превращает цвет #RRGGBB в rgba(...) с прозрачностью — нужно для светлых
// подложек/рамок плашек статуса под любой выбранный цвет.
export function hexToRgba(hex, alpha) {
  const h = (hex || "#000000").replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}
