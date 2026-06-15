import { PROJECT_COLORS } from "../constants.js";

// Сетка цветных кружочков для выбора цвета проекта.
// Используется и при создании проекта, и при смене цвета в шапке.
export default function ColorSwatches({ value, onChange }) {
  return (
    <div className="pb-swatches">
      {PROJECT_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          className={"pb-swatch" + (value === c ? " on" : "")}
          style={{ background: c }}
          title={c}
          onClick={() => onChange(c)}
        />
      ))}
    </div>
  );
}
