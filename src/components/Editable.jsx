import { useEffect, useRef, useState } from "react";

// ───────────────────────────────────────────────────────────────────────────
// Поля для удобного редактирования текста.
//
// Идея: пока поле в фокусе (ты печатаешь) — оно показывает ТОЛЬКО твой черновик,
// и никакие живые обновления извне в него не лезут. Изменение уходит в базу один
// раз — когда ты закончил: по Enter или кликнув мимо (для многострочных — мимо).
// Esc — отменить правку и вернуть прежнее значение.
//
// Это убирает «прыгающие/возвращающиеся буквы»: во время набора нет ни записи на
// каждую букву, ни эха от Realtime, перезатирающего поле.
// ───────────────────────────────────────────────────────────────────────────

function useDraft(value, onCommit) {
  const [draft, setDraft] = useState(value);
  const focused = useRef(false);
  const cancelling = useRef(false);

  // Подхватываем изменения извне (например, другой человек переименовал проект),
  // но только когда мы сами это поле НЕ редактируем.
  useEffect(() => {
    if (!focused.current) setDraft(value);
  }, [value]);

  const commit = () => {
    if (cancelling.current) { cancelling.current = false; setDraft(value); return; }
    if (draft !== value) onCommit(draft);
  };

  return { draft, setDraft, focused, cancelling, commit };
}

// Однострочное поле: Enter — зафиксировать, Esc — отменить, клик мимо — зафиксировать.
export function EditableInput({ value, onCommit, autoSize = false, ...rest }) {
  const { draft, setDraft, focused, cancelling, commit } = useDraft(value, onCommit);

  return (
    <input
      {...rest}
      value={draft}
      size={autoSize ? Math.max((draft || "").length, 6) : undefined}
      onFocus={() => { focused.current = true; }}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => { focused.current = false; commit(); }}
      onKeyDown={(e) => {
        if (e.key === "Enter") { e.preventDefault(); e.target.blur(); }
        else if (e.key === "Escape") { cancelling.current = true; e.target.blur(); }
      }}
    />
  );
}

// Многострочное поле: Enter — перенос строки. Фиксируется по клику мимо, Esc — отмена.
export function EditableTextarea({ value, onCommit, ...rest }) {
  const { draft, setDraft, focused, cancelling, commit } = useDraft(value, onCommit);

  return (
    <textarea
      {...rest}
      value={draft}
      onFocus={() => { focused.current = true; }}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => { focused.current = false; commit(); }}
      onKeyDown={(e) => {
        if (e.key === "Escape") { cancelling.current = true; e.target.blur(); }
      }}
    />
  );
}
