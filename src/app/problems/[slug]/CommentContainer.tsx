import { useState } from "react";
import { TfiReload } from "react-icons/tfi";

interface Comment {
  _id: string;
  name: string;
  avatarUrl: string;
  content: string;
}

export default function CommentContainer() {
  const comments: Comment[] = [
    {
      _id: "1",
      name: "Nguyen Huy Hung",
      avatarUrl: "none",
      content: "Goodjob!",
    },
  ];

  const [loading, setLoading] = useState(false);

  const handleButtonClick = () => {
    if (loading) return;
    setLoading(true);

    try {
      // getComment
      setLoading(true);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col w-full h-auto p-4">
      <div className="flex items-center justify-between py-2 px-3 text-orange-400 text-[17px]">
        <span className="font-bold">{comments.length} bài thảo luận</span>
        {!loading && (
          <button
            className="cursor-pointer hover:brightness-75 transition-[filter] duration-200"
            onClick={handleButtonClick}
          >
            <TfiReload />
          </button>
        )}
      </div>
    </div>
  );
}
