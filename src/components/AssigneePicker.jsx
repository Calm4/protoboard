import { useState } from "react";
import { personName, personPosition } from "../lib/people.js";

// Поле «Исполнитель»: выпадающий список с поиском по участникам проекта.
// Хранит uid выбранного участника. Старые значения (свободный текст, введённый
// до этой фичи) не резолвятся ни в одного участника — показываются как есть.
export default function AssigneePicker({ value, projectMembers, users, onChange }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const usersByUid = new Map((users || []).map((u) => [u.uid, u]));
  const resolved = value ? usersByUid.get(value) : null;
  const memberUsers = (projectMembers || []).map((uid) => usersByUid.get(uid)).filter(Boolean);

  const query = q.trim().toLowerCase();
  const filtered = memberUsers.filter((u) =>
    !query || personName(u).toLowerCase().includes(query) || (u.email || "").toLowerCase().includes(query)
  );

  const pick = (uid) => { onChange(uid); setQ(""); setOpen(false); };

  return (
    <div className="pb-taginput-wrap">
      <button type="button" className="pb-assignee-btn" onClick={() => setOpen((o) => !o)}>
        {resolved ? (
          <>
            {resolved.photoURL
              ? <img src={resolved.photoURL} width={20} height={20} className="pb-usermenu-avatar" referrerPolicy="no-referrer" />
              : <span className="pb-usermenu-avatar fallback pb-assignee-fallback">{(personName(resolved) || "?")[0].toUpperCase()}</span>
            }
            {personName(resolved)}
            {personPosition(resolved) && <span className="pb-memberposition"> · {personPosition(resolved)}</span>}
          </>
        ) : value ? (
          <span>{value}</span>
        ) : (
          <span className="muted">Без исполнителя</span>
        )}
      </button>

      {open && (
        <div className="pb-tagdrop">
          <input
            className="pb-taginput"
            autoFocus
            placeholder="Поиск участника…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="pb-tagopt" onMouseDown={() => pick("")}>Без исполнителя</button>
          {filtered.map((u) => (
            <button key={u.uid} className="pb-tagopt" onMouseDown={() => pick(u.uid)}>
              {personName(u)}
              {personPosition(u) && <span className="pb-memberposition"> · {personPosition(u)}</span>}
            </button>
          ))}
          {filtered.length === 0 && <div className="pb-act-row muted">В проекте нет участников</div>}
        </div>
      )}
      {open && <div className="pb-tagscrim" onMouseDown={() => setOpen(false)} />}
    </div>
  );
}
