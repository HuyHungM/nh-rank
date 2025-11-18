import { MenuType } from "./page";

type Props = {
  setMenuType: React.Dispatch<React.SetStateAction<MenuType>>;
  menuType: MenuType;
};

export default function PanelLeft({ menuType, setMenuType }: Props) {
  return (
    <div className={`panel panel-login ${menuType == "login" ? "exit" : ""}`}>
      <h1 className="text-3xl font-bold">Chào mừng Trở lại!</h1>
      <p>Để tiếp tục bài học vui lòng đăng nhập với thông tin của bạn</p>
      <button className="btn" onClick={() => setMenuType("login")}>
        <span className="btn-text-one">ĐĂNG NHẬP</span>
        <span className="btn-text-two">ĐI NÀO</span>
      </button>
    </div>
  );
}
