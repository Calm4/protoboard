import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db, isConfigured } from "../lib/firebase.js";

// Живой каталог всех, кто хоть раз входил в Protoboard (коллекция users,
// заполняется в useAuth.js при первом Google-входе). Нужен для резолва
// uid → имя/аватар и для поиска людей (участники проекта, исполнитель).
export function useUsers(enabled = true) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!enabled || !isConfigured) return;
    return onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map((d) => ({ uid: d.id, ...d.data() })));
    });
  }, [enabled]);

  return users;
}
