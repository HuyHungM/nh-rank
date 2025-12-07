import { PointImage, RankImage } from "@/assets/images";
import { OProblem, Rank } from "@/models/Problem";
import Image from "next/image";

interface Props {
  problem: OProblem | null;
}

export default function ProblemContainer({ problem }: Props) {
  return (
    <div className="w-full h-full flex flex-col px-4 overflow-x-hidden overflow-y-auto pb-4 max-[995px]:h-auto">
      <div className="min-h-16 flex items-center gap-4 font-bold text-sm">
        <div className="flex gap-1 items-center">
          {(problem && (
            <>
              <Image src={RankImage} alt="rank" width={20} />
              <span>{Rank[problem.rank]}</span>
            </>
          )) || (
            <div className="h-6 w-12 rounded-md bg-gray-400 animate-pulse"></div>
          )}
        </div>
        <div className="flex gap-1 items-center">
          {(problem && (
            <>
              <Image src={PointImage} alt="point" width={20} />
              <span>{problem.point}</span>
            </>
          )) || (
            <div className="h-6 w-12 rounded-md bg-gray-400 animate-pulse"></div>
          )}
        </div>
      </div>
      <div className="gap-y-6 flex flex-col">
        <div className="flex flex-col gap-y-4">
          {(problem && (
            <h1 className="font-bold text-dodger-blue uppercase text-xl">
              {problem.title}
            </h1>
          )) || (
            <div className="h-6 w-[200px] max-w-full rounded-md bg-gray-400 animate-pulse"></div>
          )}

          {(problem && (
            <p className="whitespace-pre-line">{problem.description}</p>
          )) || (
            <>
              <div className="h-6 w-full rounded-md bg-gray-400 animate-pulse"></div>
              <div className="h-6 w-full rounded-md bg-gray-400 animate-pulse"></div>
              <div className="h-6 w-full rounded-md bg-gray-400 animate-pulse"></div>
              <div className="h-6 w-[220px] max-w-full rounded-md bg-gray-400 animate-pulse"></div>
            </>
          )}
        </div>
        <div className="flex flex-col gap-y-4">
          <h1 className="font-bold text-dodger-blue text-xl">Mô tả đầu vào</h1>
          {(problem && (
            <p className="whitespace-pre-line">{problem.example.input}</p>
          )) || (
            <div className="h-6 w-[330px] max-w-full rounded-md bg-gray-400 animate-pulse"></div>
          )}
        </div>
        <div className="flex flex-col gap-y-4">
          <h1 className="font-bold text-dodger-blue text-xl">Mô tả đầu ra</h1>
          {(problem && (
            <p className="whitespace-pre-line">{problem.example.input}</p>
          )) || (
            <div className="h-6 w-[300px] max-w-full rounded-md bg-gray-400 animate-pulse"></div>
          )}
        </div>
        <div className="flex flex-col gap-y-4">
          <h1 className="font-bold text-dodger-blue text-xl">Testcase mẫu</h1>
          <div className="flex flex-col gap-y-2 w-full h-fit">
            <h2 className="text-[16px] font-semibold text-white">
              Đầu vào mẫu 1
            </h2>
            {(problem && (
              <pre className="w-full p-4 rounded-lg bg-steel-gray">
                {problem.testcases[0].input}
              </pre>
            )) || (
              <div className="h-6 w-full rounded-md bg-gray-400 animate-pulse"></div>
            )}
          </div>
          <div className="flex flex-col gap-y-2 w-full h-fit">
            <h2 className="text-[16px] font-semibold text-white">
              Đầu ra mẫu 1
            </h2>
            {(problem && (
              <pre className="w-full p-4 rounded-lg bg-steel-gray">
                {problem.testcases[0].output}
              </pre>
            )) || (
              <div className="h-6 w-full rounded-md bg-gray-400 animate-pulse"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
