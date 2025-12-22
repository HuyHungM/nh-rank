"use client";

import Link from "next/link";
import { BiHome } from "react-icons/bi";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import Navbar from "@/components/home/Navbar";
import { ErrorContainer } from "@/components/home/ErrorContainer";
import Table from "antd/es/table";
import formatDate from "@/hooks/formatDate";

export default function Submission() {
  const router = useRouter();

  const {
    data: submissionsData = null,
    isLoading: loadingSubmissions,
    isError: errorSubmissions,
  } = useQuery({
    queryKey: ["submissions"],
    queryFn: async () => {
      const res = await fetch(`/api/submissions`, {
        method: "GET",
      });
      const data = await res.json();
      if (!data.ok) {
        data.status = res.status;
      }
      if (data?.submissions)
        data.submissions = data.submissions.map((sub: any, index: number) => ({
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
    router.push(`/problems/${record.problemId._id}`);
  };

  const StatusColor = {
    AC: "text-green-400",
    WA: "text-red-400",
    TLE: "text-gray-400",
    CE: "text-orange-400",
    RE: "text-yellow-400",
  };

  const statuses = ["AC", "WA", "TLE", "CE", "RE"] as const;
  type StatusType = (typeof statuses)[number];

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
      render: (val: string) => <span className="font-normal">{val}</span>,
    },
    {
      title: "Tên",
      dataIndex: "userId",
      key: "userId",
      render: (val: any) => <>{val.name}</>,
      minWidth: 200,
    },
    {
      title: "Bài",
      dataIndex: "problemId",
      key: "problemId",
      render: (val: any) => (
        <span className="font-normal text-yellow-400">{val.title}</span>
      ),
    },
    {
      title: <div className="text-center w-full">Trạng thái</div>,
      dataIndex: "status",
      key: "status",
      className: "text-center",
      render: (val: StatusType) => (
        <span className={`font-normal ${StatusColor[val]}`}>{val}</span>
      ),
      width: 100,
    },
    {
      title: <div className="text-center w-full">Điểm</div>,
      dataIndex: "point",
      key: "point",
      className: "text-center",
      render: (val: string, record: any) => (
        <div className="font-normal">
          <span className="text-dodger-blue">{val}</span>/
          <span>{record.problemId.point}</span>
        </div>
      ),
      width: 80,
    },
    {
      title: <div className="text-center w-full">Bộ nhớ</div>,
      dataIndex: "memory",
      key: "memory",
      className: "text-center",
      render: (val: number) => (
        <span className={`font-normal`}>
          <span className="text-dodger-blue">
            {Number((val / 1024).toFixed(2))}
          </span>{" "}
          MB
        </span>
      ),
      width: 100,
    },
    {
      title: <div className="text-center w-full">Thời gian</div>,
      dataIndex: "runtime",
      key: "runtime",
      className: "text-center",
      render: (val: number) => (
        <span className={`font-normal`}>
          <span className="text-dodger-blue">{val * 1000}</span>ms
        </span>
      ),
      width: 100,
    },
    {
      title: <div className="text-center w-full">Nộp lúc</div>,
      dataIndex: "createdAt",
      key: "createdAt",
      className: "text-center",
      render: (val: string) => (
        <span className="font-normal">{formatDate(val)}</span>
      ),
      width: 160,
    },
  ];

  return (
    <div className="h-screen w-full flex flex-col pt-[76px] overflow-hidden max-[995px]:h-auto">
      <Navbar collapse={false} />

      {(!loadingSubmissions && !submissionsData?.submissions && (
        <div className="flex-1 w-full">
          <ErrorContainer
            status={submissionsData?.status}
            error={submissionsData?.error}
          />
        </div>
      )) || (
        <>
          {(!loadingSubmissions && (
            <Table
              dataSource={submissionsData?.submissions}
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
