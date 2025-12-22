"use client";

import { forwardRef } from "react";
import { Tooltip } from "antd";
import { BsChatLeftText } from "react-icons/bs";
import { LuLayoutList } from "react-icons/lu";
import { TiClipboard } from "react-icons/ti";

import ProblemContainer from "@/app/problems/[slug]/ProblemContainer";
import HistoryContainer from "@/app/problems/[slug]/HistoryContainer";
import CommentContainer from "@/app/problems/[slug]/CommentContainer";
import useQueries from "@/hooks/useQueries";
import { OProblem } from "@/models/Problem";
import { OSubmission } from "@/models/Submission";

interface Props {
  problem: OProblem | null;
  submissions: OSubmission[] | null;
}

const SidebarContainer = forwardRef<HTMLDivElement, Props>(
  function SidebarContainer({ problem, submissions }, ref) {
    const query = useQueries();
    const tab = query.get("tab") ?? "problem";

    return (
      <div
        className={`sidebar-container h-full overflow-y-auto overflow-x-hidden max-w-full min-w-16 flex max-[995px]:w-full max-[995px]:h-auto max-[995px]:flex-col max-[995px]:overflow-hidden`}
        style={{ ["--width" as any]: "35%" }}
        ref={ref}
      >
        <div className="h-full w-16 min-w-16 bg-steel-gray flex flex-col max-[995px]:flex-row max-[995px]:h-16 max-[995px]:w-full max-[995px]:min-w-full">
          <Tooltip placement="right" title="Nội dung">
            <div
              className={`h-16 w-full flex flex-col items-center justify-center transition-colors duration-200 cursor-pointer ${
                tab === "problem"
                  ? "text-dodger-blue bg-ebony-clay border-l-2 border-solid border-dodger-blue max-[995px]:border-l-0 max-[995px]:border-b-2"
                  : "border-none hover:brightness-90 max-[995px]:border-b-2 max-[995px]:border-solid max-[995px]:border-white"
              } max-[995px]:p-2 max-[995px]:gap-1 max-[995px]:bg-ebony-clay`}
              onClick={() => query.set({ tab: "problem", submission: "" })}
            >
              <TiClipboard className="text-4xl max-[995px]:text-xl" />
              <span className="font-bold text-sm hidden max-[995px]:block">
                Nội dung
              </span>
            </div>
          </Tooltip>
          <Tooltip placement="right" title="Lịch sử nộp bài">
            <div
              className={`h-16 w-full flex flex-col items-center justify-center transition-colors duration-200 cursor-pointer ${
                tab === "history"
                  ? "text-dodger-blue bg-ebony-clay border-l-2 border-solid border-dodger-blue max-[995px]:border-l-0 max-[995px]:border-b-2"
                  : "border-none hover:brightness-90 max-[995px]:border-b-2 max-[995px]:border-solid max-[995px]:border-white"
              } max-[995px]:p-2 max-[995px]:gap-1 max-[995px]:bg-ebony-clay`}
              onClick={() => query.set({ tab: "history" })}
            >
              <LuLayoutList className="text-4xl max-[995px]:text-xl" />
              <span className="font-bold text-sm hidden max-[995px]:block">
                Lịch sử nộp bài
              </span>
            </div>
          </Tooltip>
          <Tooltip placement="right" title="Phản hồi">
            <div
              className={`h-16 w-full flex flex-col items-center justify-center transition-colors duration-200 cursor-pointer ${
                tab === "comment"
                  ? "text-dodger-blue bg-ebony-clay border-l-2 border-solid border-dodger-blue max-[995px]:border-l-0 max-[995px]:border-b-2"
                  : "border-none hover:brightness-90 max-[995px]:border-b-2 max-[995px]:border-solid max-[995px]:border-white"
              } max-[995px]:p-2 max-[995px]:gap-1 max-[995px]:bg-ebony-clay`}
              onClick={() => query.set({ tab: "comment", submission: "" })}
            >
              <BsChatLeftText className="text-4xl max-[995px]:text-xl" />
              <span className="font-bold text-sm hidden max-[995px]:block">
                Phản hồi
              </span>
            </div>
          </Tooltip>
        </div>
        <div className="h-full flex-1 bg-ebony-clay min-w-0 max-[995px]:h-auto max-[995px]:w-full max-[995px]:min-w-full max-[995px]:pb-6">
          {(tab === "problem" && <ProblemContainer problem={problem} />) ||
            (tab === "history" && (
              <HistoryContainer submissions={submissions} />
            )) ||
            (tab === "comment" && <CommentContainer />)}
        </div>
      </div>
    );
  }
);

export default SidebarContainer;
