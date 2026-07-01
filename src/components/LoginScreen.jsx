import { useState } from "react";

export default function LoginScreen({ onSignIn, onSignInAnon }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      await onSignIn();
    } catch (e) {
      if (e.code !== "auth/popup-closed-by-user") {
        setError("Не удалось войти. Попробуй ещё раз.");
      }
    }
    setLoading(false);
  };

  const handleSignInAnon = async () => {
    setLoading(true);
    setError("");
    try {
      await onSignInAnon();
    } catch {
      setError("Не удалось войти. Включена ли Anonymous-авторизация в Firebase?");
    }
    setLoading(false);
  };

  return (
    <div className="pb">
      <style>{`
        .pb-login-wrap { display:flex; align-items:center; justify-content:center; min-height:100dvh; }
        .pb-login { width:340px; padding:36px 32px 32px; background:var(--surface);
          border:1px solid var(--line); border-radius:20px;
          box-shadow:0 24px 60px rgba(20,22,31,.12); text-align:center; }
        .pb-login .pb-logo { font-size:22px; letter-spacing:-.5px; display:block; margin-bottom:8px; }
        .pb-login .pb-login-sub { color:var(--soft); font-size:13.5px; margin:0 0 28px; line-height:1.5; }
        .pb-btn-google { display:flex; align-items:center; justify-content:center; gap:10px;
          width:100%; padding:11px 18px; border-radius:10px; font-size:14.5px; font-weight:500;
          border:1.5px solid var(--line); background:var(--surface); color:var(--text);
          cursor:pointer; transition:background .15s, box-shadow .15s; }
        .pb-btn-google:hover:not(:disabled) { background:var(--hover); box-shadow:0 2px 8px rgba(0,0,0,.07); }
        .pb-btn-google:disabled { opacity:.6; cursor:default; }
        .pb-login .err { color:#B23636; font-size:12.5px; margin-top:14px; }
        .pb-btn-devbypass { display:block; width:100%; margin-top:14px; padding:8px; border:1px dashed var(--line);
          border-radius:10px; background:transparent; color:var(--c-muted); font-size:12px; cursor:pointer; }
        .pb-btn-devbypass:hover:not(:disabled) { border-color:var(--soft); color:var(--soft); }
        .pb-btn-devbypass:disabled { opacity:.5; cursor:default; }
      `}</style>
      <div className="pb-login-wrap">
        <div className="pb-login">
          <span className="pb-logo">Proto<b>board</b></span>
          <p className="pb-login-sub">Войди через Google, чтобы<br />получить доступ к трекеру.</p>
          <button className="pb-btn-google" onClick={handleSignIn} disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M47.532 24.552c0-1.636-.147-3.2-.415-4.698H24.48v8.883h12.955c-.558 3.01-2.25 5.562-4.797 7.27v6.044h7.764c4.54-4.18 7.13-10.337 7.13-17.499z" fill="#4285F4"/>
              <path d="M24.48 48c6.504 0 11.956-2.155 15.942-5.85l-7.764-6.043c-2.154 1.444-4.908 2.295-8.178 2.295-6.29 0-11.615-4.25-13.515-9.962H2.94v6.24C6.907 42.772 15.084 48 24.48 48z" fill="#34A853"/>
              <path d="M10.965 28.44A14.44 14.44 0 0 1 10.2 24c0-1.544.267-3.044.765-4.44v-6.24H2.94A23.945 23.945 0 0 0 .48 24c0 3.864.927 7.52 2.46 10.68l8.025-6.24z" fill="#FBBC05"/>
              <path d="M24.48 9.598c3.545 0 6.727 1.218 9.232 3.613l6.92-6.92C36.43 2.395 30.978 0 24.48 0 15.084 0 6.907 5.228 2.94 13.32l8.025 6.24C12.865 13.848 18.19 9.598 24.48 9.598z" fill="#EA4335"/>
            </svg>
            {loading ? "Входим…" : "Войти через Google"}
          </button>
          {error && <div className="err">{error}</div>}
          {import.meta.env.DEV && onSignInAnon && (
            <button className="pb-btn-devbypass" onClick={handleSignInAnon} disabled={loading}>
              Войти без Google (только localhost)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
