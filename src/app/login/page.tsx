"use client";

import { useState } from "react";
import LoginContainer from "./LoginContainer";

import "./style.css";

export type MenuType = "login" | "register";

export default function LoginPage() {
  const [menuType, setMenuType] = useState<MenuType>("login");

  return <LoginContainer menuType={menuType} setMenuType={setMenuType} />;
}
