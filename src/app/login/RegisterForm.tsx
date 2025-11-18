"use client";

import Link from "next/link";
import { useState } from "react";
import { FaFacebook, FaGithub, FaGoogle } from "react-icons/fa";

import { useNotification } from "@/context/NotificationProvider";
import { useRouter } from "next/navigation";

type RegisterType = {
  username: string;
  name: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterForm() {
  const { addNotification } = useNotification();

  const [form, setForm] = useState<RegisterType>({
    username: "",
    name: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (form.password !== form.confirmPassword) {
      addNotification("Mật khẩu không khớp!", "error");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          name: form.name,
          password: form.password,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        addNotification(body.error, "error");
      } else {
        addNotification("Đăng ký thành công!", "success");
        setForm({ username: "", name: "", password: "", confirmPassword: "" });
      }
    } catch (error) {
      console.error(error);
      addNotification("Đăng ký thất bại!", "error");
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
      onSubmit={handleSubmit}
      action="#"
    >
      <h1 className="text-3xl font-bold">Tạo tài khoản</h1>
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
      <span
        className="text-[#808080] font-medium text-[14px]"
        style={{ marginTop: "8px" }}
      >
        hoặc sử dụng tài khoản của bạn
      </span>
      <div className="flex flex-col w-[70%] gap-3" style={{ margin: "12px 0" }}>
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Tên đầy đủ"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            autoComplete="off"
            minLength={4}
            required
            className="w-full h-10 bg-[rgb(49,48,48)] rounded-sm border-none text-[rgb(211,205,205)] text-[14px] p-2"
          />
        </div>
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Tên tài khoản"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            autoComplete="off"
            minLength={4}
            required
            className="w-full h-10 bg-[rgb(49,48,48)] rounded-sm border-none text-[rgb(211,205,205)] text-[14px] p-2"
          />
        </div>
        <div className="relative w-full">
          <input
            type="password"
            autoComplete="off"
            placeholder="Mật khẩu"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            minLength={8}
            required
            className="w-full h-10 bg-[rgb(49,48,48)] rounded-sm border-none text-[rgb(211,205,205)] text-[14px] p-2"
          />
        </div>
        <div className="relative w-full">
          <input
            type="password"
            autoComplete="off"
            placeholder="Nhập lại mật khẩu"
            value={form.confirmPassword}
            onChange={(e) =>
              setForm({ ...form, confirmPassword: e.target.value })
            }
            required
            className="w-full h-10 bg-[rgb(49,48,48)] rounded-sm border-none text-[rgb(211,205,205)] text-[14px] p-2"
          />
        </div>
      </div>
      <button
        type="submit"
        className="btn shadow-[0_15px_30px_rgba(0,0,0,0.5)] mt-2 border-none"
      >
        <span className="btn-text-one">ĐĂNG KÝ</span>
        <span className="btn-text-two">CẢM ƠN</span>
      </button>
    </form>
  );
}
