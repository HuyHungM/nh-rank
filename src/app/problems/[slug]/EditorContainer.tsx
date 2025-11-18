import CodeEditor from "@/app/problems/[slug]/CodeEditor";
import { FaPlay } from "react-icons/fa";

interface props {
  ref: React.Ref<HTMLDivElement | null>;
}

export default function EditorContainer({ ref }: props) {
  return (
    <div
      className="h-full flex-1 bg-steel-gray overflow-auto flex flex-col"
      ref={ref}
    >
      <div className="w-full h-[34px] border-b border-solid bg-ebony-clay border-gray-700 p-1 flex justify-end">
        <button className="px-3 flex items-center w-fit justify-center bg-dodger-blue rounded-2xl h-full cursor-pointer hover:brightness-75 transition-all duration-300">
          <FaPlay />
        </button>
      </div>
      <CodeEditor
        value={`#include <bits/stdc++.h>
using namespace std;

int main() {

    cout << "Hello World" << endl;
    return 0;
}
`}
      ></CodeEditor>
    </div>
  );
}
