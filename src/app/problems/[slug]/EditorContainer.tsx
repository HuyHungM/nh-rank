import { useEffect, useMemo, useRef, useState } from "react";
import { Dropdown, MenuProps } from "antd";
import { IoCodeSlash } from "react-icons/io5";
import { FaPlay } from "react-icons/fa";
import { PiGitBranchFill } from "react-icons/pi";
import { SlPaperPlane } from "react-icons/sl";

import BottomContainer from "@/app/problems/[slug]/BottomContainer";
import { CodeEditor } from "@/app/problems/[slug]/CodeEditor";
import useQuery from "@/hooks/useQuery";
import { OSubmission } from "@/models/Submission";
import { OProblem } from "@/models/Problem";

interface Props {
  ref: React.Ref<HTMLDivElement | null>;
  problem: OProblem | null;
  submissions: OSubmission[] | null;
}

export default function EditorContainer({ ref, problem, submissions }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
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
      !topRef.current ||
      !bottomRef.current
    )
      return;

    const containerHeight = containerRef.current.offsetHeight;
    const newHeight =
      e.clientY - containerRef.current.getBoundingClientRect().top;

    topRef.current.style.setProperty("--height", `${newHeight}px`);
    topRef.current.style.maxHeight = `${newHeight}px`;
    bottomRef.current.style.setProperty(
      "--height",
      `${containerHeight - newHeight - 2}px`
    );
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const query = useQuery();
  const tab = query.get("tab") ?? "problem";
  const submissionId = query.get("submission");

  const curSubmission = useMemo(() => {
    if (!submissionId || !submissions?.length) return null;
    return submissions.find((s) => s._id === submissionId) || null;
  }, [submissionId, submissions]);

  useEffect(() => {
    console.log(curSubmission);
  }, [curSubmission]);

  const items: MenuProps["items"] = [
    {
      label: (
        <button className="w-full flex items-center px-3 py-1 gap-2 text-gray-300 font-bold text-base cursor-pointer transition-colors duration-300 hover:bg-steel-gray">
          <IoCodeSlash />
          <span>Chạy CODE</span>
        </button>
      ),
      key: 0,
    },
    ...(curSubmission
      ? []
      : [
          {
            label: (
              <button className="w-full flex items-center px-3 py-1 gap-2 text-orange-400 font-bold text-base cursor-pointer transition-colors duration-300 hover:bg-steel-gray">
                <PiGitBranchFill />
                <span>Chạy TEST</span>
              </button>
            ),
            key: 1,
          },
          {
            label: (
              <button className="w-full flex items-center px-3 py-1 gap-2 text-dodger-blue font-bold text-base cursor-pointer transition-colors duration-300 hover:bg-steel-gray">
                <SlPaperPlane />
                <span>Chấm bài</span>
              </button>
            ),
            key: 2,
          },
        ]),
  ];

  return (
    <div
      className={`h-auto bg-steel-gray overflow-hidden flex flex-col editor-container max-[995px]:h-auto ${
        tab === "comment" ? "max-[995px]:hidden" : ""
      }`}
      style={{ ["--width" as any]: "65%" }}
      ref={ref}
    >
      <div className="w-full min-h-[34px] h-[34px] border-b border-solid bg-ebony-clay border-gray-700 p-1 flex justify-end gap-1">
        <button className="px-3 flex items-center w-fit justify-center bg-dodger-blue rounded-2xl h-full cursor-pointer hover:brightness-75 transition-all duration-300 font-bold text-sm text-white gap-2 full-btn">
          <IoCodeSlash />
          <span>Chạy CODE</span>
        </button>
        {!curSubmission && (
          <button className="px-3 flex items-center w-fit justify-center bg-dodger-blue rounded-2xl h-full cursor-pointer hover:brightness-75 transition-all duration-300 font-bold text-sm text-white gap-2 full-btn">
            <PiGitBranchFill />
            <span>Chạy TEST</span>
          </button>
        )}
        {!curSubmission && (
          <button className="px-3 flex items-center w-fit justify-center bg-dodger-blue rounded-2xl h-full cursor-pointer hover:brightness-75 transition-all duration-300 font-bold text-sm text-white gap-2 full-btn">
            <SlPaperPlane />
            <span>Chấm bài</span>
          </button>
        )}
        <Dropdown menu={{ items }} trigger={["click"]}>
          <button className="px-3 hidden items-center w-fit justify-center bg-dodger-blue rounded-2xl h-full cursor-pointer hover:brightness-75 transition-all duration-300 minimize-btn">
            <FaPlay />
          </button>
        </Dropdown>
      </div>
      <div
        className="flex h-[calc(100%-34px)] w-full flex-col max-[995px]:h-auto"
        ref={containerRef}
      >
        <div
          className="top-ref w-full overflow-auto max-[995px]:h-[450px]"
          style={{ ["--height" as any]: "70%" }}
          ref={topRef}
        >
          <CodeEditor
            editable={curSubmission === null}
            value={
              curSubmission
                ? curSubmission.sourceCode
                : `#include <bits/stdc++.h>
using namespace std;

int main() {
  
  cout << "Hello World" << endl;
  return 0;
}`
            }
          />
        </div>
        <div
          className="h-1.5 w-full bg-gray-700 cursor-row-resize flex items-center justify-center overflow-hidden resize-line"
          ref={dragRef}
          onMouseDown={handleMouseDown}
        >
          <div className="w-10 h-[1.6px] rounded-lg bg-gray-400"></div>
        </div>
        <div
          className="bottom-ref w-full max-[995px]:h-[500px]"
          style={{ ["--height" as any]: "30%" }}
          ref={bottomRef}
        >
          <BottomContainer problem={problem} curSubmission={curSubmission!} />
        </div>
      </div>
    </div>
  );
}
