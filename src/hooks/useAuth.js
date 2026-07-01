import { useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase.js";

const provider = new GoogleAuthProvider();

export function useAuth() {
  const [user, setUser] = useState(undefined); // undefined = проверяем, null = не вошёл
  const [role, setRole] = useState(null);
  const [customName, setCustomName] = useState("");
  const [position, setPosition] = useState("");
  const [justCreated, setJustCreated] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!auth) { setUser(null); setReady(true); return; }

    return onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null);
        setRole(null);
        setCustomName("");
        setPosition("");
        setReady(true);
        return;
      }

      try {
        const userRef = doc(db, "users", u.uid);
        const snap = await getDoc(userRef);

        if (!snap.exists()) {
          // Первый вход — создаём профиль с ролью user, показываем онбординг
          await setDoc(userRef, {
            displayName: u.displayName || "",
            email: u.email || "",
            photoURL: u.photoURL || "",
            role: "user",
            createdAt: Date.now(),
          });
          setRole("user");
          setCustomName("");
          setPosition("");
          setJustCreated(true);
        } else {
          // Обновляем фото/имя (могли поменяться в Google), роль/имя/должность не трогаем
          setDoc(userRef, {
            displayName: u.displayName || "",
            email: u.email || "",
            photoURL: u.photoURL || "",
          }, { merge: true }).catch(() => {});
          setRole(snap.data().role || "user");
          setCustomName(snap.data().customName || "");
          setPosition(snap.data().position || "");
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

  const updateProfile = async (patch) => {
    if (!user) return;
    if ("customName" in patch) setCustomName(patch.customName);
    if ("position" in patch) setPosition(patch.position);
    await updateDoc(doc(db, "users", user.uid), patch).catch(() => {});
  };

  return {
    user, role, customName, position, justCreated, ready,
    signInWithGoogle, signOut, updateProfile,
  };
}
