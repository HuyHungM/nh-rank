/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { use, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { BiHome } from "react-icons/bi";

import Navbar from "@/components/home/Navbar";
import EditorContainer from "@/app/problems/[slug]/EditorContainer";
import SidebarContainer from "@/app/problems/[slug]/SidebarContainer";
import { OSubmission } from "@/models/Submission";
import { ErrorContainer } from "@/components/home/ErrorContainer";

export default function Problem({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const {
    data: problemData = null,
    isLoading: loadingProblem,
    isError: errorProblem,
  } = useQuery({
    queryKey: ["problem", slug],
    queryFn: async () => {
      const res = await fetch(`/api/problems/${slug}`, {
        method: "GET",
      });
      const data = await res.json();
      if (!data.ok) {
        data.status = res.status;
      }
      return data;
    },
    enabled: true,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const {
    data: submissions = null,
    isLoading: loadingSubmissions,
    isError: errorSubmissions,
    refetch: refetchSubmissions,
  } = useQuery({
    queryKey: ["submissions", problemData?.problem?._id],
    queryFn: async () => {
      const res = await fetch(
        `/api/submissions?problemId=${problemData.problem?._id}`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      return data.submissions as OSubmission[];
    },
    enabled: !!problemData?.problem?._id,
    staleTime: 1000 * 30,
  });

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

    leftRef.current.style.setProperty("--width", `${newLeftWidth}px`);
    rightRef.current.style.setProperty(
      "--width",
      `${containerWidth - newLeftWidth - 2}px`
    );
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="h-screen w-full flex flex-col pt-10 overflow-hidden max-[995px]:h-auto">
      <Navbar collapse={true} />

      {(!loadingProblem && !problemData.problem && (
        <div className="flex-1 w-full">
          <ErrorContainer
            status={problemData?.status}
            error={problemData?.error}
          />
        </div>
      )) || (
        <>
          <div className="h-10 w-full bg-ebony-clay flex gap-x-1 items-center py-2 px-4 border-b border-solid border-gray-700">
            {(problemData?.problem && (
              <>
                <span>
                  <BiHome />
                </span>
                /
                <Link
                  href={`/problems?topic=${problemData?.problem.topic._id}`}
                  className="hover:text-dodger-blue transition-colors duration-300"
                >
                  {problemData?.problem.topic.name}
                </Link>
                /
                <span className="font-bold uppercase">
                  {problemData?.problem.title}
                </span>
              </>
            )) || (
              <div className="h-full w-[200px] max-w-full rounded-md bg-gray-400 animate-pulse"></div>
            )}
          </div>
          <div
            className="w-full h-full overflow-hidden flex relative select-none max-[995px]:flex-col max-[995px]:h-auto max-[995px]:overflow-auto"
            ref={containerRef}
          >
            <SidebarContainer
              ref={leftRef}
              problem={problemData?.problem}
              submissions={submissions}
            />
            <div
              className="h-full w-1.5 bg-gray-700 cursor-col-resize flex items-center justify-center overflow-hidden resize-line"
              ref={dragRef}
              onMouseDown={handleMouseDown}
            >
              <div className="h-10 w-[1.6px] rounded-lg bg-gray-400"></div>
            </div>
            <EditorContainer
              ref={rightRef}
              problem={problemData?.problem}
              submissions={submissions}
            />
          </div>
        </>
      )}
    </div>
  );
}
