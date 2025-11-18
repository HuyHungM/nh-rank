import { MenuType } from "./page";

type Props = {
  setMenuType: React.Dispatch<React.SetStateAction<MenuType>>;
  menuType: MenuType;
};

export default function PanelRight({ menuType, setMenuType }: Props) {
  return (
    <div
      className={`panel panel-register ${menuType == "register" ? "exit" : ""}`}
    >
      <h1 className="font-bold text-3xl">Hello, Friend!</h1>
      <p>Nhập thông tin của bạn và bắt đầu chuyến khám phá của chúng ta nào</p>
      <button className="btn" onClick={() => setMenuType("register")}>
        <span className="btn-text-one">ĐĂNG KÝ</span>
        <span className="btn-text-two">ĐI NÀO</span>
      </button>
    </div>
  );
}
