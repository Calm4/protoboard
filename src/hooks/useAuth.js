import { useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
} from "firebase/auth";
import { auth } from "../lib/firebase.js";

const provider = new GoogleAuthProvider();

export function useAuth() {
  // undefined = ещё проверяем сессию, null = не вошёл, объект = вошёл
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    if (!auth) { setUser(null); return; }
    return onAuthStateChanged(auth, (u) => setUser(u ?? null));
  }, []);

  const signInWithGoogle = () => signInWithPopup(auth, provider);
  const signOut = () => fbSignOut(auth);

  return {
    user: user ?? null,
    ready: user !== undefined,
    signInWithGoogle,
    signOut,
  };
}
