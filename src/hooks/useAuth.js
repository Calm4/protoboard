import { useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase.js";

const provider = new GoogleAuthProvider();

export function useAuth() {
  const [user, setUser] = useState(undefined); // undefined = проверяем, null = не вошёл
  const [role, setRole] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!auth) { setUser(null); setReady(true); return; }

    return onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null);
        setRole(null);
        setReady(true);
        return;
      }

      try {
        const userRef = doc(db, "users", u.uid);
        const snap = await getDoc(userRef);

        if (!snap.exists()) {
          // Первый вход — создаём профиль с ролью user
          await setDoc(userRef, {
            displayName: u.displayName || "",
            email: u.email || "",
            photoURL: u.photoURL || "",
            role: "user",
            createdAt: Date.now(),
          });
          setRole("user");
        } else {
          // Обновляем фото/имя (могли поменяться в Google), роль не трогаем
          setDoc(userRef, {
            displayName: u.displayName || "",
            email: u.email || "",
            photoURL: u.photoURL || "",
          }, { merge: true }).catch(() => {});
          setRole(snap.data().role || "user");
        }
      } catch {
        setRole("user"); // при ошибке Firestore — безопасный дефолт
      }

      setUser(u);
      setReady(true);
    });
  }, []);

  const signInWithGoogle = () => signInWithPopup(auth, provider);
  const signOut = () => fbSignOut(auth);

  return { user, role, ready, signInWithGoogle, signOut };
}
