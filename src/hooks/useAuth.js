import { useState } from "react";

// Задел под вход в систему. Сейчас вход выключен (AUTH_REQUIRED = false).
// Когда понадобится — подключим Firebase Auth.
export const AUTH_REQUIRED = false;

export function useAuth() {
  const [user] = useState(null);
  const ready = true; // Вход выключен — сразу готовы.

  const signInWithEmail = (_email) => {};
  const signOut = () => {};

  return { user, ready, authRequired: AUTH_REQUIRED, signInWithEmail, signOut };
}
