import { personName } from "../lib/people.js";

// Кнопка с аватаром пользователя в шапке. Клик переходит на страницу профиля.
export default function UserMenu({ user, customName, onOpenProfile }) {
  const name = personName({ customName, displayName: user.displayName, email: user.email });
  return (
    <button className="pb-usermenu-btn" onClick={onOpenProfile} title={user.email}>
      {user.photoURL
        ? <img src={user.photoURL} width={24} height={24} className="pb-usermenu-avatar" referrerPolicy="no-referrer" />
        : <span className="pb-usermenu-avatar fallback">{(name || "?")[0].toUpperCase()}</span>
      }
      {name.split(" ")[0]}
    </button>
  );
}
