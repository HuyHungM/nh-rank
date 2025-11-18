import { useEffect, useRef, useState } from "react";
import { RiQrScan2Line } from "react-icons/ri";
import { BsCodeSlash } from "react-icons/bs";
import { CiCreditCard1 } from "react-icons/ci";
import { MdOutlineScoreboard } from "react-icons/md";
import { LuAlarmClock } from "react-icons/lu";
import { Table, Tooltip } from "antd";
import { ColumnsType } from "antd/es/table";

interface Submission {
  key: number;
  id: string;
  name: string;
  point: number;
  createdAt: string;
}

export default function HistoryContainer() {
  const [onlyMe, setOnlyMe] = useState(false);
  const [curWidth, setcurWidth] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        setcurWidth(width);
      }
    });

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  const submissions: Submission[] = [
    {
      key: 1,
      id: "1",
      name: "Nguyen Huy Hung",
      point: 9,
      createdAt: "16/11/2025 10:25 PM",
    },
    {
      key: 2,
      id: "2",
      name: "Le Tran Khanh Ly",
      point: 10,
      createdAt: "16/11/2025 10:25 PM",
    },
  ];

  const columns: ColumnsType<Submission> = [
    {
      title: "#",
      dataIndex: "key",
      key: "key",
      width: 60,
      render: (val: number, record: Submission) => (
        <span
          className={`${record.id === "1" ? "text-white" : "text-dodger-blue"}`}
        >
          {val}
        </span>
      ),
    },
    {
      title: curWidth > 500 ? "Tên" : <CiCreditCard1 className="text-base" />,
      dataIndex: "name",
      key: "name",
      render: (val: number, record: Submission) => (
        <div className={`h-full w-[${curWidth * 0.28}px] flex items-center`}>
          <span
            className={`${
              record.id === "1" ? "text-white" : "text-dodger-blue"
            } text-ellipsis overflow-hidden text-nowrap inline-block w-full`}
          >
            {val}
          </span>
        </div>
      ),
    },
    {
      title:
        curWidth > 500 ? "Điểm" : <MdOutlineScoreboard className="text-base" />,
      dataIndex: "point",
      key: "point",
      showSorterTooltip: { target: "full-header" },
      sorter: (a: Submission, b: Submission) => a.point - b.point,
      className: "ant-table-align-center",
      align: "center",
      width: 80,
      render: (val: number, record: Submission) => (
        <span
          className={`${record.id === "1" ? "text-white" : "text-dodger-blue"}`}
        >
          {val}
        </span>
      ),
    },
    {
      title: (
        <div className="ant-table-column-title">
          {curWidth > 500 ? (
            "Thời gian"
          ) : (
            <LuAlarmClock className="text-base" />
          )}
        </div>
      ),
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      className: "ant-table-align-center",
      ellipsis: true,
      render: (val: string, record: Submission) => (
        <div
          className={`ant-table-column-title ${
            record.id === "1" ? "text-white" : "text-dodger-blue"
          }`}
        >
          {(curWidth > 500 && <span className="font-medium">{val}</span>) || (
            <Tooltip placement="top" title={val}>
              <LuAlarmClock className="cursor-pointer text-base" />
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  return (
    <div
      className="flex flex-col h-full w-full overflow-x-hidden overflow-y-auto"
      ref={ref}
    >
      <div className="flex w-full px-4 py-2 h-auto justify-between">
        <div className="flex text-dodger-blue items-center gap-1">
          <BsCodeSlash />
          <span className="font-bold text-sm">{submissions.length}</span>
        </div>
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
      <Table
        className="min-w-[300px]"
        dataSource={
          onlyMe ? submissions.filter((x) => x.id === "1") : submissions
        }
        columns={columns}
        pagination={false}
      />
    </div>
  );
}
