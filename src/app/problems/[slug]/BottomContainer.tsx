/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import ReactCodeMirror, {
  EditorView,
  highlightActiveLine,
  highlightSpecialChars,
  keymap,
  lineNumbers,
} from "@uiw/react-codemirror";
import { Modal } from "antd";
import { OProblem } from "@/models/Problem";
import { OSubmission } from "@/models/Submission";

import "./style.css";
import { draculaHighlight, draculaTheme } from "@/lib/draculaTheme";
import { search, searchKeymap } from "@codemirror/search";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";

export interface CodeResponse {
  stdout: string;
  stderr: string;
  compile: string;
  message: string;
  status: string;
}

interface Props {
  problem: OProblem;
  curSubmission: OSubmission;
  stdin: string;
  codeResponse: CodeResponse | any;
  testResponse: CodeResponse | any;
  submissionResponse: OSubmission;
  setStdin: (value: string) => void;
}

export default function BottomContainer({
  problem,
  curSubmission,
  stdin,
  setStdin,
  codeResponse,
  testResponse,
  submissionResponse,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const [panelState, setPanelState] = useState<
    "stdout" | "stderr" | "compile" | "message" | "testcase"
  >("stdout");

  const initialPanelState = useMemo(
    () => (!curSubmission ? "testcase" : panelState),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [curSubmission]
  );

  useEffect(() => {
    setPanelState(initialPanelState);
  }, [initialPanelState]);

  const [stdout, setStdout] = useState("");
  const [stderr, setStdErr] = useState("");
  const [compileMessage, setCompileMessage] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setStdout(codeResponse?.output);
    setStdErr(codeResponse?.stderr);
    setCompileMessage(codeResponse?.compile);
    setMessage(codeResponse?.message);
  }, [codeResponse]);

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
    <div
      className="bottom-container w-full h-full flex max-[995px]:flex-col max-[995px]:h-auto"
      ref={containerRef}
    >
      <div
        className="stdin-container h-full flex flex-col max-[995px]:w-full max-[995px]:h-[250px]"
        style={{ ["--width" as any]: "50%" }}
        ref={leftRef}
      >
        <div className="flex w-full h-8 bg-ebony-clay border-b border-solid border-gray-700">
          <TabItem title="STDIN" active={true} onClick={() => {}} />
        </div>
        {problem && (
          <ReactCodeMirror
            className="flex-1 font-jetbrains overflow-auto"
            height="100%"
            value={stdin}
            onChange={setStdin}
            theme={draculaTheme}
            extensions={[
              search(),
              history(),
              lineNumbers(),
              highlightSpecialChars(),
              highlightActiveLine(),
              keymap.of([
                indentWithTab,
                ...defaultKeymap,
                ...searchKeymap,
                ...historyKeymap,
              ]),
              EditorView.lineWrapping,
              draculaHighlight,
            ]}
          />
        )}
      </div>
      <div
        className="bottom-drag-width h-full w-1.5 bg-gray-700 cursor-col-resize flex items-center justify-center overflow-hidden resize-line"
        ref={dragRef}
        onMouseDown={handleMouseDown}
      >
        <div className="h-10 w-[1.6px] rounded-lg bg-gray-400"></div>
      </div>
      <div
        className="others-container h-full flex flex-col max-[995px]:w-full max-[995px]:h-[250px]"
        style={{ ["--width" as any]: "50%" }}
        ref={rightRef}
      >
        <div className="flex w-full h-8 bg-ebony-clay border-b border-solid border-gray-700 overflow-y-hidden overflow-x-auto">
          {!curSubmission && (
            <>
              <TabItem
                title="STDOUT"
                active={panelState === "stdout"}
                onClick={() => setPanelState("stdout")}
              />
              <TabItem
                title="STDERR"
                active={panelState === "stderr"}
                onClick={() => {
                  setPanelState("stderr");
                }}
              />
              <TabItem
                title="COMPILE"
                active={panelState === "compile"}
                onClick={() => {
                  setPanelState("compile");
                }}
              />{" "}
              <TabItem
                title="MESSAGE"
                active={panelState === "message"}
                onClick={() => {
                  setPanelState("message");
                }}
              />
            </>
          )}

          <TabItem
            title="TESTCASE"
            active={panelState === "testcase"}
            onClick={() => {
              setPanelState("testcase");
            }}
          />
        </div>
        {(panelState === "stdout" && (
          <ReactCodeMirror
            className="flex-1 font-jetbrains overflow-auto select-text"
            height="100%"
            value={stdout}
            onChange={setStdout}
            theme={draculaTheme}
            extensions={[
              search(),
              history(),
              lineNumbers(),
              highlightSpecialChars(),
              highlightActiveLine(),
              keymap.of([
                indentWithTab,
                ...defaultKeymap,
                ...searchKeymap,
                ...historyKeymap,
              ]),
              EditorView.lineWrapping,
              draculaHighlight,
              EditorView.editable.of(false),
            ]}
          />
        )) ||
          (panelState === "stderr" && (
            <ReactCodeMirror
              className="flex-1 font-jetbrains overflow-auto select-text"
              height="100%"
              value={stderr}
              onChange={setStdErr}
              theme={draculaTheme}
              extensions={[
                search(),
                history(),
                lineNumbers(),
                highlightSpecialChars(),
                highlightActiveLine(),
                keymap.of([
                  indentWithTab,
                  ...defaultKeymap,
                  ...searchKeymap,
                  ...historyKeymap,
                ]),
                EditorView.lineWrapping,
                draculaHighlight,
                EditorView.editable.of(false),
              ]}
            />
          )) ||
          (panelState === "compile" && (
            <ReactCodeMirror
              className="flex-1 font-jetbrains overflow-auto select-text"
              height="100%"
              value={compileMessage}
              onChange={setCompileMessage}
              theme={draculaTheme}
              extensions={[
                search(),
                history(),
                lineNumbers(),
                highlightSpecialChars(),
                highlightActiveLine(),
                keymap.of([
                  indentWithTab,
                  ...defaultKeymap,
                  ...searchKeymap,
                  ...historyKeymap,
                ]),
                EditorView.lineWrapping,
                draculaHighlight,
                EditorView.editable.of(false),
              ]}
            />
          )) ||
          (panelState === "message" && (
            <ReactCodeMirror
              className="flex-1 font-jetbrains overflow-auto select-text"
              height="100%"
              value={message}
              onChange={setMessage}
              theme={draculaTheme}
              extensions={[
                search(),
                history(),
                lineNumbers(),
                highlightSpecialChars(),
                highlightActiveLine(),
                keymap.of([
                  indentWithTab,
                  ...defaultKeymap,
                  ...searchKeymap,
                  ...historyKeymap,
                ]),
                EditorView.lineWrapping,
                draculaHighlight,
                EditorView.editable.of(false),
              ]}
            />
          ))}
        {(panelState === "testcase" && curSubmission && (
          <TestcasePanel
            testcases={curSubmission.testcases}
            runtime={curSubmission.runtime}
            memory={curSubmission.memory}
            problem={problem}
          />
        )) ||
          (panelState === "testcase" && submissionResponse && (
            <TestcasePanel
              testcases={submissionResponse.testcases}
              runtime={submissionResponse.runtime}
              memory={submissionResponse.memory}
              problem={problem}
            />
          )) ||
          (panelState === "testcase" && testResponse && (
            <TestcasePanel
              testcases={[testResponse]}
              runtime={testResponse.time}
              memory={testResponse.memory}
              problem={problem}
            />
          )) ||
          (panelState === "testcase" && !curSubmission && !testResponse && (
            <div className="p-8 text-center text-gray-500">
              Chưa có submission để hiển thị
            </div>
          ))}
      </div>
    </div>
  );
}

const TabItem = ({
  title,
  active,
  onClick,
}: {
  title: string;
  active: boolean;
  onClick: () => void;
}) => {
  return (
    <div
      className={`w-[100px] py-1 px-4 flex items-center justify-center border-solid border-dodger-blue  uppercase text-sm font-bold cursor-pointer transition-colors duration-200 ${
        active ? "bg-steel-gray text-white border-t-3" : "text-gray-500"
      }`}
      onClick={onClick}
    >
      {title}
    </div>
  );
};

const TestcasePanel = ({ testcases, runtime, memory, problem }: any) => (
  <div className="h-[calc(100%-32px)] flex flex-col">
    {/* Stats */}
    <div className="p-4 bg-gray-900 border-b border-gray-700 flex justify-between items-center">
      <div className="flex gap-6 text-sm">
        <div>
          <span className="text-gray-500">Thời gian:</span>{" "}
          <span className="font-bold text-white">
            {(runtime * 1000).toFixed(0)} ms
          </span>
        </div>
        <div>
          <span className="text-gray-500">Bộ nhớ:</span>{" "}
          <span className="font-bold text-white">
            {(memory / 1024).toFixed(1)} MB
          </span>
        </div>
      </div>
      <div className="text-sm text-gray-400">
        {testcases.filter((t: any) => t.passed).length}/{testcases.length}{" "}
        passed
      </div>
    </div>

    {/* Testcase List */}
    <div className="flex-1 overflow-y-auto">
      {testcases.map((tc: any, i: number) => (
        <Testcase key={i} testcase={tc} i={i} problem={problem} />
      ))}
    </div>
  </div>
);

const Testcase = ({ testcase, i, problem }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  return (
    <>
      <div
        className={`p-4 border-b border-gray-800 cursor-pointer transition-all hover:bg-gray-900`}
        onClick={showModal}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {testcase.passed ? (
              <CheckCircle2 className="text-green-500" size={20} />
            ) : (
              <XCircle className="text-red-500" size={20} />
            )}
            <span className="font-medium">Testcase #{i + 1}</span>
          </div>
          <div className="text-sm text-gray-500">
            {testcase.time ? `${(testcase.time * 1000).toFixed(0)}ms` : "-"} ·{" "}
            {testcase.memory ? `${(testcase.memory / 1024).toFixed(1)}MB` : "-"}
          </div>
        </div>
        {!testcase.passed && testcase.title && (
          <div className="mt-2 text-xs text-red-400 font-mono w-full overflow-hidden text-ellipsis whitespace-nowrap">
            {testcase.title}
          </div>
        )}
      </div>
      <Modal
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[]}
        centered
        width={950}
      >
        <div className="flex flex-col w-full items-center gap-2 p-2">
          <span className="font-bold text-gray-400 text-[20px]">
            Testcase #{i + 1}
          </span>
          <span
            className={`mt-3 mb-[30px] text-3xl italic ${
              !testcase.passed ? "text-red-400" : "text-green-500"
            }`}
          >
            ({testcase.title})
          </span>
          <div className="flex flex-col w-full gap-3">
            <span className="font-semibold text-base">Đầu vào</span>
            <pre className="whitespace-pre-wrap w-full p-2.5 rounded-lg bg-steel-gray text-base text-[#ffffffcc] max-h-[200px] min-h-11 overflow-x-hidden overflow-y-auto">
              {problem ? problem.testcases[i]?.input : "Đang tải..."}
            </pre>
          </div>
          <div className="w-full grid grid-cols-2 gap-3">
            <div className="flex flex-col w-full gap-3">
              <span className="font-semibold text-base">Đầu ra</span>
              <pre
                className={`max-h-[200px] whitespace-pre-wrap w-full p-2.5 rounded-lg text-base min-h-11 overflow-x-hidden overflow-y-auto text-[#ffffffcc] ${
                  !testcase.passed
                    ? "bg-[#f33b2033]"
                    : "bg-[oklch(72.887%_0.21192_147.841/0.317)]"
                }`}
              >
                {testcase.output}
              </pre>
            </div>
            <div className="flex flex-col w-full gap-3">
              <span className="font-semibold text-base">Dự kiến</span>
              <pre className="max-h-[200px] whitespace-pre-wrap w-full p-2.5 rounded-lg text-base min-h-11 overflow-x-hidden overflow-y-auto text-[#ffffffcc] bg-[#329bff33]">
                {problem ? problem.testcases[i]?.output : "Đang tải..."}
              </pre>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
