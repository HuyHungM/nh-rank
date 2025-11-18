"use client";

import Link from "next/link";
import { useRef } from "react";
import { BiHome } from "react-icons/bi";

import Navbar from "@/components/home/Navbar";
import EditorContainer from "@/app/problems/[slug]/EditorContainer";
import SidebarContainer from "@/app/problems/[slug]/SidebarContainer";
import { ProblemType, Rank } from "@/types/problem";

export default function Problem() {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (
      !isDragging.current ||
      !containerRef.current ||
      !leftRef.current ||
      !rightRef.current
    )
      return;

    const containerWidth = containerRef.current.offsetWidth;
    const newLeftWidth =
      e.clientX - containerRef.current.getBoundingClientRect().left;

    leftRef.current.style.width = `${newLeftWidth}px`;
    rightRef.current.style.width = `${containerWidth - newLeftWidth - 2}px`;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const problem: ProblemType = {
    title: "BÀI TOÁN BIỂU THỨC",
    description: `Cho xâu S (chỉ gồm các ký tự ‘0′ đến ‘9′, độ dài nhỏ hơn 10) và số nguyên M.
Yêu cầu: Không thay đổi thứ tự của các ký tự trong xâu S. Hãy đếm số cách lấy ra một số ký tự trong xâu S và chèn vào trước nó các dấu ‘+′ hoặc ‘−‘ để thu được số M cho trước?`,
    inputDescription: `1234
6`,
    outputDescription: `4
Giải thích`,
    topic: {
      id: "topic",
      name: "Topic",
    },
    testcases: [{ input: "https://", output: "https://" }],
    point: 10,
    rank: Rank.NORMAL,
    comments: [
      {
        name: "A",
        avatarUrl: "a",
        content: "hello",
      },
    ],
  };

  return (
    <div className="h-screen w-full flex flex-col pt-10">
      <Navbar collapse={true} />
      <div className="h-10 w-full bg-ebony-clay flex gap-x-1 items-center py-2 px-4 border-b border-solid border-gray-700">
        <span>
          <BiHome />
        </span>
        /
        <Link
          href={`/topics/${problem.topic.id}`}
          className="hover:text-dodger-blue transition-colors duration-300"
        >
          {problem.topic.name}
        </Link>
        / <span className="font-bold uppercase">{problem.title}</span>
      </div>
      <div
        className="w-full h-full overflow-hidden flex relative select-none"
        ref={containerRef}
      >
        <SidebarContainer ref={leftRef} problem={problem} />
        <div
          className="h-full w-1.5 bg-gray-700 cursor-col-resize flex items-center justify-center"
          ref={dragRef}
          onMouseDown={handleMouseDown}
        >
          <div className="h-10 w-[1.6px] rounded-lg bg-gray-400"></div>
        </div>
        <EditorContainer ref={rightRef} />
      </div>
    </div>
  );
}
