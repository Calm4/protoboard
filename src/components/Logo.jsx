import logoIcon from "../assets/logo.jpg";

// Логотип «Protoboard»: иконка + текст. Общий для главной, экрана проекта,
// профиля и экрана входа.
export default function Logo() {
  return (
    <span className="pb-brand-logo">
      <img src={logoIcon} alt="" className="pb-logo-icon" />
      <span className="pb-logo">Proto<b>board</b></span>
    </span>
  );
}
