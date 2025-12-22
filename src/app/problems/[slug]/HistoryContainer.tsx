import { useEffect, useRef, useState } from "react";
import { Table, Tooltip } from "antd";
import { ColumnsType } from "antd/es/table";
import { RiQrScan2Line } from "react-icons/ri";
import { BsCodeSlash } from "react-icons/bs";
import { CiCreditCard1 } from "react-icons/ci";
import { MdOutlineScoreboard } from "react-icons/md";
import { LuAlarmClock } from "react-icons/lu";
import useQueries from "@/hooks/useQueries";
import { OSubmission } from "@/models/Submission";
import { useUser } from "@/context/UserContext";
import Image from "next/image";
import formatDate from "@/hooks/formatDate";

interface Props {
  submissions: OSubmission[] | null;
}

export default function HistoryContainer({
  submissions: rawSubmissions,
}: Props) {
  const [onlyMe, setOnlyMe] = useState(false);
  const [width, setWidth] = useState(0);
  const { user } = useUser();
  const ref = useRef<HTMLDivElement | null>(null);
  const query = useQueries();

  const rankedSubmissions = rawSubmissions?.map((sub, index) => ({
    ...sub,
    rank: index + 1,
  }));

  const dataSource = onlyMe
    ? rankedSubmissions?.filter((s) => s.userId._id === user?._id)
    : rankedSubmissions;

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        setWidth(width);
      }
    });

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  const columns: ColumnsType<OSubmission> = [
    {
      title: "#",
      dataIndex: "rank",
      key: "rank",
      width: 60,
    },
    {
      title:
        width > 500 ? "Họ và tên" : <CiCreditCard1 className="text-base" />,
      dataIndex: "userId",
      key: "user",
      render: (val: any) => (
        <div className={`h-full w-[${width * 0.28}px] flex items-center gap-1`}>
          <Image
            src={val.avatarUrl}
            alt="avt"
            width={28}
            height={28}
            className="rounded-full"
          />
          <span
            className={`text-ellipsis overflow-hidden text-nowrap inline-block w-full`}
          >
            {val?.name}
          </span>
        </div>
      ),
    },
    {
      title:
        width > 500 ? "Điểm" : <MdOutlineScoreboard className="text-base" />,
      dataIndex: "point",
      key: "point",
      showSorterTooltip: { target: "sorter-icon" },
      sorter: (a: OSubmission, b: OSubmission) => a.point - b.point,
      className: "ant-table-align-center",
      align: "center",
      width: 80,
    },
    {
      title: (
        <div className="ant-table-column-title">
          {width > 500 ? "Thời gian" : <LuAlarmClock className="text-base" />}
        </div>
      ),
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      className: "ant-table-align-center",
      ellipsis: true,
      render: (val: string) => (
        <div className={`ant-table-column-title`}>
          {(width > 500 && (
            <span className="font-medium">{formatDate(val)}</span>
          )) || (
            <Tooltip placement="top" title={formatDate(val)}>
              <LuAlarmClock className="cursor-pointer text-base" />
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  const handleMyRowClick = (record: OSubmission) => {
    if (record.userId._id === user._id) {
      query.set({ submission: record._id });
    }
  };

  return (
    <div
      className="flex flex-col h-full w-full overflow-x-hidden overflow-y-auto max-[995px]:h-auto"
      ref={ref}
    >
      <div className="flex w-full px-4 py-2 h-auto justify-between">
        {(dataSource && (
          <div className="flex text-dodger-blue items-center gap-1">
            <BsCodeSlash />
            <span className="font-bold text-sm">{dataSource.length}</span>
          </div>
        )) || (
          <div className="h-5 w-[50px] max-w-full rounded-md bg-gray-400 animate-pulse"></div>
        )}
        <Tooltip placement="top" title="Chỉ mình tôi">
          <button
            className={`text-lg cursor-pointer hover:brightness-75 transition-all duration-300 px-3 py-0.75 rounded-3xl ${
              onlyMe ? "bg-dodger-blue" : "text-dodger-blue"
            }`}
            onClick={() => setOnlyMe(!onlyMe)}
          >
            <RiQrScan2Line />
          </button>
        </Tooltip>
      </div>
      {(dataSource && (
        <Table
          className="min-w-[300px]"
          dataSource={dataSource}
          rowKey={"_id"}
          rowClassName={(record) => {
            const isMe = record.userId._id === user._id;
            return isMe ? "text-white cursor-pointer" : "text-dodger-blue";
          }}
          onRow={(record) => ({
            onClick: () => handleMyRowClick(record),
          })}
          columns={columns}
          pagination={false}
        />
      )) || (
        <div className="flex flex-col px-2 gap-3 mt-5">
          <div className="h-[74px] w-full rounded-md bg-gray-400 animate-pulse"></div>
          <div className="h-[74px] w-full rounded-md bg-gray-400 animate-pulse"></div>
          <div className="h-[74px] w-full rounded-md bg-gray-400 animate-pulse"></div>
        </div>
      )}
    </div>
  );
}
