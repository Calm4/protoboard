import { useState } from "react";

// Экран входа. Готов к работе, но показывается ТОЛЬКО когда AUTH_REQUIRED = true
// (см. src/hooks/useAuth.js). Сейчас вход выключен, поэтому этот экран не виден.
// Вход — по ссылке из письма (magic link), без паролей.
export default function LoginScreen({ onSignIn }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    const { error } = await onSignIn(email);
    if (error) setError(error.message);
    else setSent(true);
  };

  return (
    <div className="pb">
      <style>{`
        .pb-login { max-width:380px; margin:14vh auto 0; padding:28px 26px; background:var(--surface);
          border:1px solid var(--line); border-radius:16px; box-shadow:0 18px 50px rgba(20,22,31,.10); text-align:center; }
        .pb-login .pb-logo { display:block; margin-bottom:6px; }
        .pb-login p { color:var(--soft); font-size:13.5px; margin:0 0 20px; }
        .pb-login .pb-input { margin-bottom:12px; text-align:left; }
        .pb-login .pb-btn { width:100%; justify-content:center; }
        .pb-login .ok { color:var(--done); font-size:14px; font-weight:600; }
        .pb-login .err { color:#B23636; font-size:12.5px; margin-top:10px; }
      `}</style>
      <div className="pb-login">
        <span className="pb-logo">Proto<b>board</b></span>
        {sent ? (
          <p className="ok">Готово! Проверь почту — там ссылка для входа.</p>
        ) : (
          <>
            <p>Введи рабочий e-mail — пришлём ссылку для входа.</p>
            <input
              className="pb-input"
              type="email"
              autoFocus
              value={email}
              placeholder="you@studio.com"
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
            <button className="pb-btn primary" onClick={submit}>Получить ссылку</button>
            {error && <div className="err">{error}</div>}
          </>
        )}
      </div>
    </div>
  );
}
