import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { Dropdown, MenuProps } from "antd";
import { IoCodeSlash } from "react-icons/io5";
import { FaPlay } from "react-icons/fa";
import { PiGitBranchFill } from "react-icons/pi";
import { SlPaperPlane } from "react-icons/sl";
import ReactCodeMirror, {
  EditorView,
  highlightActiveLine,
  highlightSpecialChars,
  keymap,
  lineNumbers,
} from "@uiw/react-codemirror";
import { draculaHighlight, draculaTheme } from "@/lib/draculaTheme";
import { cpp } from "@codemirror/lang-cpp";
import { search, searchKeymap } from "@codemirror/search";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";

import BottomContainer, {
  CodeResponse,
} from "@/app/problems/[slug]/BottomContainer";
import useQueries from "@/hooks/useQueries";
import { OSubmission } from "@/models/Submission";
import { OProblem } from "@/models/Problem";
import { useNotification } from "@/context/NotificationProvider";
import { useUser } from "@/context/UserContext";

interface Props {
  problem: OProblem | null;
  submissions: OSubmission[] | null;
}

const EditorContainer = forwardRef<HTMLDivElement, Props>(
  function EditorContainer({ problem, submissions }, ref) {
    const { user } = useUser();

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

    const query = useQueries();
    const tab = query.get("tab") ?? "problem";
    const submissionId = query.get("submission");

    const curSubmission = useMemo(() => {
      if (!submissionId || !submissions?.length) return null;
      return submissions.find((s) => s._id === submissionId) || null;
    }, [submissionId, submissions]);

    const [stdin, setStdin] = useState(problem?.testcases[0].input || "");
    const [codeResponse, setCodeResponse] = useState<CodeResponse | any>(null);
    const [testResponse, setTestResponse] = useState<CodeResponse | any>(null);
    const [submissionResponse, setSubmissionResponse] = useState(null);

    const [sourceCode, setSourceCode] = useState<string>(
      curSubmission
        ? curSubmission.sourceCode
        : `#include <bits/stdc++.h>
using namespace std;

int main() {
  
  cout << "Hello World" << endl;
  return 0;
}`
    );

    useEffect(() => {
      setSourceCode(
        curSubmission
          ? curSubmission.sourceCode
          : `#include <bits/stdc++.h>
using namespace std;

int main() {
  
  cout << "Hello World" << endl;
  return 0;
}`
      );
    }, [curSubmission]);

    const runCodeController = new AbortController();
    const { addNotification } = useNotification();
    const [loadingRunCode, setLoadingRunCode] = useState(false);
    const [loadingRunTest, setLoadingRunTest] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false);

    const initialStdin = useMemo(
      () => problem?.testcases?.[0]?.input ?? "",
      [problem]
    );

    useEffect(() => {
      setStdin(initialStdin);
    }, [initialStdin]);

    const handleRunCode = async () => {
      if (!loadingRunCode && !loadingRunTest && !loadingSubmit) {
        setLoadingRunCode(true);

        try {
          const res = await fetch("/api/submissions?t=code", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sourceCode,
              stdin,
              userId: user._id,
              expected: problem?.testcases[0].output,
            }),
            signal: runCodeController.signal,
          });
          const data = await res.json();
          if (!data.ok) {
            setLoadingRunCode(false);
            return addNotification(data.error, "error");
          }
          setCodeResponse(data.submission);
          console.log(testResponse);
          setLoadingRunCode(false);
        } catch (error) {
          console.error(error);
          setLoadingRunCode(false);
          addNotification("Đã xảy ra lỗi!", "error");
        }
      } else if (loadingRunCode) {
        runCodeController.abort();
        setLoadingRunCode(false);
      }
    };

    const handleRunTest = async () => {
      if (loadingRunCode || loadingRunTest || loadingSubmit) return;
      setLoadingRunTest(true);
      setSubmissionResponse(null);
      try {
        const res = await fetch("/api/submissions?t=code", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sourceCode,
            stdin,
            userId: user._id,
            expected: problem?.testcases[0].output,
          }),
        });
        const data = await res.json();
        if (!data.ok) {
          setLoadingRunTest(false);
          return addNotification(data.error, "error");
        }
        setTestResponse(data.submission);
        setLoadingRunTest(false);
      } catch (error) {
        console.error(error);
        setLoadingRunTest(false);
        addNotification("Đã xảy ra lỗi!", "error");
      }
    };

    const handleSubmit = async () => {
      if (loadingRunCode || loadingRunTest || loadingSubmit) return;
      setLoadingSubmit(true);
      setTestResponse(null);
      try {
        const res = await fetch("/api/submissions?t=submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sourceCode,
            userId: user._id,
            problemId: problem?._id,
          }),
        });
        const data = await res.json();
        if (!data.ok) {
          setLoadingSubmit(false);
          return addNotification(data.error, "error");
        }
        setSubmissionResponse(data.submission);
        setLoadingSubmit(false);
      } catch (error) {
        console.error(error);
        setLoadingSubmit(false);
        addNotification("Đã xảy ra lỗi!", "error");
      }
    };

    const items: MenuProps["items"] = [
      {
        label: (
          <button
            className="w-full flex items-center px-3 py-1 gap-2 text-gray-300 font-bold text-base cursor-pointer transition-colors duration-300 hover:bg-steel-gray"
            onClick={handleRunCode}
          >
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
                <button
                  className="w-full flex items-center px-3 py-1 gap-2 text-orange-400 font-bold text-base cursor-pointer transition-colors duration-300 hover:bg-steel-gray"
                  onClick={handleRunTest}
                >
                  <PiGitBranchFill />
                  <span>Chạy TEST</span>
                </button>
              ),
              key: 1,
            },
            {
              label: (
                <button
                  className="w-full flex items-center px-3 py-1 gap-2 text-dodger-blue font-bold text-base cursor-pointer transition-colors duration-300 hover:bg-steel-gray"
                  onClick={handleSubmit}
                >
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
          <button
            disabled={loadingRunTest || loadingSubmit}
            className={`px-3 flex items-center w-fit justify-center rounded-2xl h-full cursor-pointer hover:brightness-75 transition-all duration-300 font-bold text-sm text-white gap-2 full-btn ${
              !loadingRunCode
                ? "bg-dodger-blue cursor-pointer"
                : "bg-red-500 cursor-pointer"
            }`}
            onClick={handleRunCode}
          >
            {(!loadingRunCode && (
              <>
                <IoCodeSlash />
                <span>Chạy CODE</span>
              </>
            )) || (
              <>
                <span className="spinner"></span>
                <span>Dừng lại</span>
              </>
            )}
          </button>
          {!curSubmission && (
            <button
              disabled={loadingRunCode || loadingRunTest || loadingSubmit}
              className={`px-3 flex items-center w-fit justify-center rounded-2xl h-full transition-all duration-300 font-bold text-sm text-white gap-2 full-btn ${
                !loadingRunTest
                  ? "cursor-pointer bg-dodger-blue hover:brightness-75"
                  : "bg-dodger-blue brightness-50"
                // : "bg-transparent border-gray-500 cursor-not-allowed"
              }`}
              onClick={handleRunTest}
            >
              {(!loadingRunTest && <PiGitBranchFill />) || (
                <span className="spinner"></span>
              )}
              <span>Chạy TEST</span>
            </button>
          )}
          {!curSubmission && (
            <button
              disabled={loadingRunCode || loadingRunTest || loadingSubmit}
              className={`px-3 flex items-center w-fit justify-center rounded-2xl h-full hover:brightness-75 transition-all duration-300 font-bold text-sm text-white gap-2 full-btn ${
                !loadingSubmit
                  ? "cursor-pointer bg-dodger-blue hover:brightness-75"
                  : "bg-dodger-blue brightness-50"
                // : "bg-transparent border-gray-500 cursor-not-allowed"
              }`}
              onClick={handleSubmit}
            >
              {(!loadingSubmit && <SlPaperPlane />) || (
                <span className="spinner"></span>
              )}
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
            <ReactCodeMirror
              className="h-full font-jetbrains"
              value={sourceCode}
              onChange={setSourceCode}
              height="100%"
              theme={draculaTheme}
              extensions={[
                cpp(),
                search(),
                lineNumbers(),
                highlightSpecialChars(),
                highlightActiveLine(),
                history(),
                keymap.of([
                  indentWithTab,
                  ...defaultKeymap,
                  ...searchKeymap,
                  ...historyKeymap,
                ]),
                EditorView.lineWrapping,
                draculaHighlight,
                EditorView.editable.of(curSubmission === null),
              ]}
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
            <BottomContainer
              problem={problem!}
              stdin={stdin}
              setStdin={setStdin}
              codeResponse={codeResponse}
              testResponse={testResponse}
              submissionResponse={submissionResponse!}
              curSubmission={curSubmission!}
            />
          </div>
        </div>
      </div>
    );
  }
);

export default EditorContainer;
