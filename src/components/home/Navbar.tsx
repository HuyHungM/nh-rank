"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import "./Navbar.css";
import "@/app/globals.css";

import { Logo } from "@/assets/images";
import { useUser } from "@/context/UserContext";

interface Props {
  collapse?: boolean;
}

export default function Navbar({ collapse = false }: Props) {
  const { user } = useUser();

  const [switchProfile, setSwitchProfile] = useState(false);
  return (
    <div
      className={`${
        !collapse ? "h-[76px]" : "h-10"
      } w-screen fixed top-0 left-0 z-50 flex items-center justify-between bg-ebony-clay gap-x-10 nav-container`}
      style={{ padding: `${!collapse ? "8px 32px" : "2px 16px"}` }}
    >
      <Link href={"/"}>
        <Image
          src={Logo}
          className={`${!collapse ? "w-12 h-12" : "w-8 h-8"} rounded-full`}
          alt="logo"
          loading="eager"
        ></Image>
      </Link>
      <ul className="flex items-center w-fit h-full font-bold max-[680px]:hidden">
        <li>
          <Link href={"/"} className="nav-item">
            TRANG CHỦ
          </Link>
        </li>
        <li>
          <Link href={"/problems"} className="nav-item">
            BÀI TẬP
          </Link>
        </li>
        <li>
          <Link href={"/submissions"} className="nav-item">
            BÀI NỘP
          </Link>
        </li>
      </ul>
      <div className="relative h-fit w-fit">
        <div className="w-fit h-fit">
          <Image
            className={`${
              !collapse ? "w-12 h-12" : "w-8 h-8"
            } rounded-full border border-gray-900 cursor-pointer transition duration-150 hover:brightness-[.8]`}
            src={user!.avatarUrl}
            width={64}
            height={64}
            alt="avatar"
            onClick={() => setSwitchProfile(!switchProfile)}
          ></Image>
        </div>
        <AnimatePresence>
          {switchProfile && (
            <motion.ul
              className="absolute grid grid-rows-2 items-center justify-center top-[110%] right-0 rounded-md bg-ebony-clay h-fit w-fit p-1 border border-solid border-gray-700"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
            >
              <li>
                <Link className="profile-item" href="/profiles">
                  Tài khoản
                </Link>
              </li>
              <li>
                <Link className="profile-item" href="/auth/logout">
                  Đăng xuất
                </Link>
              </li>
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
