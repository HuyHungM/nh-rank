export type Submission = {
  id: string;
  userId: string;
  problemId: string;
  total: number;
  correct?: number;
  wrong?: number;
  tle?: number;
};
