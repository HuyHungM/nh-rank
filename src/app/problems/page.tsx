"use client";

import Link from "next/link";
import { BiHome } from "react-icons/bi";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import Navbar from "@/components/home/Navbar";
import { ErrorContainer } from "@/components/home/ErrorContainer";
import useQueries from "@/hooks/useQueries";
import Table from "antd/es/table";
import { Rank } from "@/models/Problem";

export default function Problem() {
  const query = useQueries();
  const topicId = query.get("topic");
  const router = useRouter();

  const {
    data: problemsData = null,
    isLoading: loadingProblems,
    isError: errorProblems,
  } = useQuery({
    queryKey: ["problems"],
    queryFn: async () => {
      const res = await fetch(
        `/api/problems${topicId ? `?topic=${topicId}` : ""}`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      if (!data.ok) {
        data.status = res.status;
      }
      if (data?.problems)
        data.problems = data.problems.map((sub: any, index: number) => ({
          ...sub,
          number: index + 1,
        }));
      return data;
    },
    enabled: true,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const handleRowClick = (record: any) => {
    router.push(`/problems/${record._id}`);
  };

  const RankColor = {
    easy: "text-green-400",
    normal: "text-yellow-400",
    hard: "text-red-400",
    hardcore: "text-red-600",
  };

  const columns = [
    {
      title: (
        <div className="text-center w-full h-[55px] flex items-center justify-center">
          #
        </div>
      ),
      dataIndex: "number",
      key: "number",
      width: 70,
      className: "text-center",
      render: (val: any) => <span className="font-normal">{val}</span>,
    },
    {
      title: "Tên",
      dataIndex: "title",
      key: "title",
      minWidth: 200,
    },
    {
      title: "Chủ đề",
      dataIndex: "topic",
      key: "topic",
      render: (val: any) => (
        <span className="font-normal text-green-400">{val.name}</span>
      ),
    },
    {
      title: <div className="text-center w-full">Độ khó</div>,
      dataIndex: "rank",
      key: "rank",
      className: "text-center",
      render: (val: Rank) => (
        <span className={`font-normal ${RankColor[val]}`}>{Rank[val]}</span>
      ),
      width: 100,
    },
    {
      title: <div className="text-center w-full">Điểm</div>,
      dataIndex: "point",
      key: "point",
      className: "text-center",
      render: (val: any) => (
        <span className="font-normal text-dodger-blue">{val}</span>
      ),
      width: 80,
    },
  ];

  return (
    <div className="h-screen w-full flex flex-col pt-[76px] overflow-hidden max-[995px]:h-auto">
      <Navbar collapse={false} />

      {(!loadingProblems && !problemsData?.problems && (
        <div className="flex-1 w-full">
          <ErrorContainer
            status={problemsData?.status}
            error={problemsData?.error}
          />
        </div>
      )) || (
        <>
          <div className="h-10 w-full bg-ebony-clay flex gap-x-1 items-center py-2 px-4 border-b border-solid border-gray-700">
            {(problemsData?.problems && (
              <>
                <span>
                  <BiHome />
                </span>
                {problemsData?.topic && (
                  <>
                    /
                    <Link
                      href={`/problems?topic=${topicId}`}
                      className="hover:text-dodger-blue transition-colors duration-300 font-bold"
                    >
                      {problemsData?.topic.name}
                    </Link>
                  </>
                )}
              </>
            )) || (
              <div className="h-full w-[200px] max-w-full rounded-md bg-gray-400 animate-pulse"></div>
            )}
          </div>
          {(!loadingProblems && (
            <Table
              dataSource={problemsData?.problems}
              columns={columns}
              rowClassName={() =>
                "cursor-pointer text-[#c8c8c8] hover:bg-[#1e293b] transition-colors"
              }
              rowKey={"_id"}
              className="bg-ebony-clay mt-15 mx-5 rounded-lg"
              pagination={{ pageSize: 10 }}
              onRow={(record) => ({
                onClick: () => handleRowClick(record),
              })}
            />
          )) || (
            <div className="w-[calc(100%- 40px)] box-border mt-15 mx-5 rounded-lg h-[200px] bg-gray-400 animate-pulse"></div>
          )}
        </>
      )}
    </div>
  );
}
