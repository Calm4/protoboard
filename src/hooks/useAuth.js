import { useEffect, useState } from "react";
import { supabase, isConfigured } from "../lib/supabase.js";

// ───────────────────────────────────────────────────────────────────────────
// Единая точка «кто пользователь». Задел под вход в систему (шаг 4 брифа).
//
// СЕЙЧАС входа НЕТ — доступ по ссылке: AUTH_REQUIRED = false, user = null,
// приложение открывается всем. Поведение не меняется.
//
// Когда захотим включить вход — переделывать ничего не нужно, достаточно:
//   1) поставить здесь AUTH_REQUIRED = true;
//   2) тогда автоматически покажется экран входа (src/components/LoginScreen.jsx);
//   3) выполнить supabase/auth-later.sql, чтобы доступ к данным получали только
//      вошедшие пользователи (там же — про Storage).
//
// Сами функции входа/выхода уже подключены к Supabase Auth — их не придётся
// дописывать. Здесь magic-link по e-mail (без паролей), но при желании можно
// добавить вход через Google и т.п. — это уже настройка на стороне Supabase.
// ───────────────────────────────────────────────────────────────────────────

// ← Единственный переключатель. false = доступ по ссылке (как сейчас).
export const AUTH_REQUIRED = false;

export function useAuth() {
  const [user, setUser] = useState(null);
  // Пока вход выключен — сразу готовы (никого не ждём).
  const [ready, setReady] = useState(!AUTH_REQUIRED);

  useEffect(() => {
    if (!AUTH_REQUIRED || !isConfigured) return;

    // Узнаём, вошёл ли уже пользователь, и следим за входом/выходом.
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Вход по ссылке из письма (magic link) — пароль не нужен.
  const signInWithEmail = (email) =>
    supabase.auth.signInWithOtp({ email: (email || "").trim() });
  const signOut = () => supabase.auth.signOut();

  return { user, ready, authRequired: AUTH_REQUIRED, signInWithEmail, signOut };
}
