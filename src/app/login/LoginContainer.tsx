"use client";

import { MenuType } from "./page";
import PanelLeft from "./PanelLeft";
import PanelRight from "./PanelRight";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

type Props = {
  menuType: MenuType;
  setMenuType: React.Dispatch<React.SetStateAction<MenuType>>;
};

export default function LoginContainer({ menuType, setMenuType }: Props) {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-background dark:bg-gray-900">
      <div className="grid h-auto w-5xl grid-cols-2 rounded-lg shadow-[0px_2.5px_3.7px_rgba(0,0,0,0.18),0px_6.9px_10.3px_rgba(0,0,0,0.16),0px_16.6px_24.7px_rgba(0,0,0,0.119),0px_55px_82px_rgba(0,0,0,0.065)] relative overflow-hidden bg-foreground dark:bg-background py-[60px]">
        <div className={`bg ${menuType}`}></div>

        <PanelLeft setMenuType={setMenuType} menuType={menuType} />
        <PanelRight setMenuType={setMenuType} menuType={menuType} />
        <LoginForm />
        <RegisterForm />
      </div>
    </div>
  );
}
