import { useState } from "react";
import { personName, personPosition } from "../lib/people.js";

// Модалка участников проекта: список текущих (с удалением) + поиск и добавление
// новых из общего каталога пользователей (users).
export default function MembersModal({ members, users, currentUid, onAdd, onRemove, onClose }) {
  const [search, setSearch] = useState("");
  const memberSet = new Set(members || []);
  const memberUsers = (users || []).filter((u) => memberSet.has(u.uid));

  const q = search.trim().toLowerCase();
  const candidates = q
    ? (users || []).filter((u) =>
        !memberSet.has(u.uid) &&
        (personName(u).toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q))
      ).slice(0, 8)
    : [];

  return (
    <>
      <div className="pb-scrim" onClick={onClose} />
      <div className="pb-modal pb-members-modal">
        <button className="x" onClick={onClose}>✕</button>
        <h3>Участники проекта</h3>

        <div className="pb-memberlist">
          {memberUsers.length === 0 && <div className="pb-act-row muted">Пока никого</div>}
          {memberUsers.map((u) => (
            <div key={u.uid} className="pb-memberrow">
              {u.photoURL
                ? <img src={u.photoURL} width={28} height={28} className="pb-memberavatar" referrerPolicy="no-referrer" />
                : <span className="pb-memberavatar fallback">{(personName(u) || "?")[0].toUpperCase()}</span>
              }
              <div className="pb-membermeta">
                <div className="pb-membername">
                  {personName(u)}
                  {personPosition(u) && <span className="pb-memberposition"> · {personPosition(u)}</span>}
                </div>
                <div className="pb-memberemail">{u.email}</div>
              </div>
              <button className="pb-tag-x" onClick={() => onRemove(u.uid)}>
                {u.uid === currentUid ? "Покинуть" : "✕"}
              </button>
            </div>
          ))}
        </div>

        <div className="pb-field">
          <label>Добавить участника</label>
          <input
            className="pb-input"
            placeholder="Имя или почта…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {q && (
            <div className="pb-memberadd-list">
              {candidates.length === 0 ? (
                <div className="pb-act-row muted">Никого не найдено</div>
              ) : candidates.map((u) => (
                <button
                  key={u.uid}
                  className="pb-tagopt"
                  onClick={() => { onAdd(u.uid); setSearch(""); }}
                >
                  {personName(u)}
                  {personPosition(u) && <span className="pb-memberemail"> · {personPosition(u)}</span>}
                  <span className="pb-memberemail"> · {u.email}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
