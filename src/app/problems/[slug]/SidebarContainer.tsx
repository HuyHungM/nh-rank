"use client";

import React, { useState } from "react";
import { BsChatLeftText } from "react-icons/bs";
import { LuLayoutList } from "react-icons/lu";
import { TiClipboard } from "react-icons/ti";
import { Tooltip } from "antd";

import ProblemContainer from "@/app/problems/[slug]/ProblemContainer";
import { ProblemType } from "@/types/problem";
import HistoryContainer from "@/app/problems/[slug]/HistoryContainer";
import CommentContainer from "@/app/problems/[slug]/CommentContainer";

interface props {
  ref: React.RefObject<HTMLDivElement | null>;
  problem: ProblemType;
}

type SelectItem = "problem" | "history" | "comment";

export default function SidebarContainer({ ref, problem }: props) {
  const [item, setItem] = useState<SelectItem>("problem");
  return (
    <div
      className={`h-full w-[30%] overflow-y-auto overflow-x-hidden max-w-full min-w-16 flex`}
      ref={ref}
    >
      <div className="h-full w-16 min-w-16 bg-steel-gray flex flex-col">
        <Tooltip placement="right" title="Nội dung">
          <div
            className={`h-16 w-full flex flex-col items-center justify-center transition-colors duration-200 cursor-pointer ${
              item === "problem"
                ? "text-dodger-blue bg-ebony-clay border-l-2 border-solid border-dodger-blue"
                : "border-none hover:brightness-90"
            }`}
            onClick={() => setItem("problem")}
          >
            <TiClipboard className="text-4xl" />
          </div>
        </Tooltip>
        <Tooltip placement="right" title="Lịch sử nộp bài">
          <div
            className={`h-16 w-full flex flex-col items-center justify-center transition-colors duration-200 cursor-pointer ${
              item === "history"
                ? "text-dodger-blue bg-ebony-clay border-l-2 border-solid border-dodger-blue"
                : "border-none hover:brightness-90"
            }`}
            onClick={() => setItem("history")}
          >
            <LuLayoutList className="text-4xl" />
          </div>
        </Tooltip>
        <Tooltip placement="right" title="Phản hồi">
          <div
            className={`h-16 w-full flex flex-col items-center justify-center transition-colors duration-200 cursor-pointer ${
              item === "comment"
                ? "text-dodger-blue bg-ebony-clay border-l-2 border-solid border-dodger-blue"
                : "border-none hover:brightness-90"
            }`}
            onClick={() => setItem("comment")}
          >
            <BsChatLeftText className="text-4xl" />
          </div>
        </Tooltip>
      </div>
      <div className="h-full flex-1 bg-ebony-clay min-w-0">
        {(item === "problem" && <ProblemContainer problem={problem} />) ||
          (item === "history" && <HistoryContainer />) ||
          (item === "comment" && <CommentContainer />)}
      </div>
    </div>
  );
}
