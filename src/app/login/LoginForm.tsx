"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaFacebook, FaGithub, FaGoogle } from "react-icons/fa";

import { useNotification } from "@/context/NotificationProvider";

export default function LoginForm() {
  const { addNotification } = useNotification();

  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
        }),
      });
      if (!res.ok) {
        const body = await res.json();
        addNotification(body.error, "error");
      } else {
        addNotification("Đăng nhập thành công!", "success");
        setForm({ username: "", password: "" });
      }
    } catch (error) {
      console.error(error);
      addNotification("Đăng thập thất bại!", "error");
    } finally {
      setLoading(false);
      setTimeout(() => {
        router.push("/");
      }, 1000);
    }
  };

  return (
    <form
      className="flex flex-col items-center"
      action="#"
      onSubmit={handleSubmit}
    >
      <h1 className="text-3xl font-bold">Đăng nhập</h1>
      <div className="flex gap-6 group my-5">
        <Link
          href="#"
          className="transition-transform hover:scale-[1.3] group-hover:scale-[0.8]"
        >
          <FaFacebook className="text-2xl"></FaFacebook>
        </Link>
        <Link
          href="#"
          className="transition-transform hover:scale-[1.3] group-hover:scale-[0.8]"
        >
          <FaGoogle className="text-2xl"></FaGoogle>
        </Link>
        <Link
          href="#"
          className="transition-transform hover:scale-[1.3] group-hover:scale-[0.8]"
        >
          <FaGithub className="text-2xl"></FaGithub>
        </Link>
      </div>
      <span className="text-[#808080] font-medium text-[14px] mt-2">
        hoặc sử dụng tài khoản của bạn
      </span>
      <div className="flex flex-col w-[70%] h-auto gap-3 my-3">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Tên tài khoản"
            autoComplete="off"
            required
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="w-full h-10 bg-[rgb(49,48,48)] rounded-sm border-none text-[rgb(211,205,205)] text-[14px] p-2"
          />
        </div>
        <div className="relative w-full">
          <input
            type="password"
            placeholder="Mật khẩu"
            autoComplete="off"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full h-10 bg-[rgb(49,48,48)] rounded-sm border-none text-[rgb(211,205,205)] text-[14px] p-2"
          />
        </div>
      </div>
      <Link href="#" className="my-1">
        <span className="text-[#808080] font-medium text-[14px] mt-2">
          Quên mật khẩu?
        </span>
      </Link>
      <button
        className="btn shadow-[0_15px_30px_rgba(0,0,0,0.5)] mt-2 border-none"
        type="submit"
      >
        <span className="btn-text-one">ĐĂNG NHẬP</span>
        <span className="btn-text-two">CẢM ƠN</span>
      </button>
    </form>
  );
}
