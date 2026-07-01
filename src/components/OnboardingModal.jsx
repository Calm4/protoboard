import { useState } from "react";
import { POSITIONS } from "../constants.js";

// Показывается один раз, сразу после первого входа через Google.
// Если закрыть без сохранения — имя останется из Google, должность не выставится.
export default function OnboardingModal({ googleName, onSave, onSkip }) {
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");

  const save = () => {
    onSave({ customName: name.trim(), position });
  };

  return (
    <>
      <div className="pb-scrim" onClick={onSkip} />
      <div className="pb-modal">
        <button className="x" onClick={onSkip}>✕</button>
        <h3>Добро пожаловать!</h3>
        <div className="pb-field">
          <label>Как тебя зовут</label>
          <input
            className="pb-input"
            autoFocus
            placeholder={googleName || "Имя"}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="pb-field">
          <label>Кто ты</label>
          <div className="pb-poschips">
            {POSITIONS.map((p) => (
              <button
                key={p}
                type="button"
                className={"pb-chip" + (position === p ? " on" : "")}
                onClick={() => setPosition(position === p ? "" : p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="pb-modal-foot">
          <button className="pb-btn ghost" onClick={onSkip}>Пропустить</button>
          <button className="pb-btn primary" onClick={save}>Сохранить</button>
        </div>
      </div>
    </>
  );
}
