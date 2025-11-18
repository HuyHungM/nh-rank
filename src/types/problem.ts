type Testcase = {
  input: string;
  output: string;
};

export const Rank = {
  HARDCORE: { id: "hardcore", name: "Cực khó" },
  HARD: { id: "hard", name: "Khó" },
  NORMAL: { id: "normal", name: "Trung bình" },
  EASY: { id: "easy", name: "Dễ" },
} as const;
export type Rank = (typeof Rank)[keyof typeof Rank];

type Comment = {
  name: string;
  avatarUrl: string;
  content: string;
};

export type ProblemType = {
  title: string;
  description: string;
  inputDescription: string;
  outputDescription: string;
  topic: {
    id: string;
    name: string;
  };
  testcases: Testcase[];
  point: number;
  rank: Rank;
  comments: Comment[];
};
