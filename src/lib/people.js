// Резолв отображаемого имени/должности человека из каталога users (useUsers.js).
// customName — то, что человек сам вписал в профиле; иначе имя из Google; иначе почта.
export const personName = (u) => (u && (u.customName || u.displayName || u.email)) || "";
export const personPosition = (u) => (u && u.position) || "";
