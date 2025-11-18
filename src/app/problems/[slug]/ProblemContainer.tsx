import { ProblemType } from "@/types/problem";

interface props {
  problem: ProblemType;
}

export default function ProblemContainer({ problem }: props) {
  return (
    <div className="w-full h-full flex flex-col px-4 overflow-x-hidden overflow-y- pb-4">
      <div className="min-h-16 flex items-center gap-2 font-bold">
        <span>{problem.rank.name}</span>
        <span>{problem.point}</span>
      </div>
      <div className="gap-y-6 flex flex-col">
        <div className="flex flex-col gap-y-4">
          <h1 className="font-bold text-dodger-blue uppercase text-xl">
            {problem.title}
          </h1>
          <p className="whitespace-pre-line">{problem.description}</p>
        </div>
        <div className="flex flex-col gap-y-4">
          <h1 className="font-bold text-dodger-blue text-xl">Mô tả đầu vào</h1>
          <p className="whitespace-pre-line">{problem.inputDescription}</p>
        </div>
        <div className="flex flex-col gap-y-4">
          <h1 className="font-bold text-dodger-blue text-xl">Mô tả đầu ra</h1>
          <p className="whitespace-pre-line">{problem.outputDescription}</p>
        </div>
        <div className="flex flex-col gap-y-4">
          <h1 className="font-bold text-dodger-blue text-xl">Testcase mẫu</h1>
          <div className="flex flex-col gap-y-2 w-full h-fit">
            <h2 className="text-[16px] font-semibold text-white">
              Đầu vào mẫu 1
            </h2>
            <pre className="w-full p-4 rounded-lg bg-steel-gray">
              {problem.testcases[0].input}
            </pre>
          </div>
          <div className="flex flex-col gap-y-2 w-full h-fit">
            <h2 className="text-[16px] font-semibold text-white">
              Đầu ra mẫu 1
            </h2>
            <pre className="w-full p-4 rounded-lg bg-steel-gray">
              {problem.testcases[0].output}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
