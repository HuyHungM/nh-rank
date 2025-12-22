"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useNotification } from "@/context/NotificationProvider";
import { BiSad, BiSmile } from "react-icons/bi";

export default function NotificationContainer() {
  const { notifications } = useNotification();

  return (
    <div className="fixed top-5 right-2 flex flex-col gap-2 z-50">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 120, y: 120, opacity: 0 }}
            transition={{
              x: { duration: 0.8, ease: [0.68, -0.55, 0.265, 1.55] },
              opacity: { duration: 0.8, ease: [0.68, -0.55, 0.265, 1.55] },
              y: { duration: 1.2, ease: [0.68, -0.55, 0.265, 1.55] },
            }}
            className={`grid grid-cols-[40px_auto] h-10 overflow-hidden max-w-[400px] w-auto rounded-sm border-2 border-white`}
          >
            <div
              className={`flex border-r-2 border-white items-center justify-center rounded-l-sm bg-[#232323] ${
                n.type === "error" ? "text-red-400" : "text-green-400"
              }`}
            >
              {(n.type == "error" && <BiSad className="text-2xl"></BiSad>) || (
                <BiSmile className="text-2xl"></BiSmile>
              )}
            </div>
            <div
              className={`flex items-center overflow-hidden text-ellipsis whitespace-nowrap ${
                n.type === "error" ? "bg-red-400" : "bg-green-400"
              }`}
              style={{ padding: "8px" }}
            >
              {n.message}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
