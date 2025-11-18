import { OTopic } from "@/models/Topic";
import mongoose, { Document, Model, Schema } from "mongoose";

type Testcase = {
  input: string;
  output: string;
};

export const Rank = {
  hardcore: "Cực khó",
  hard: "Khó",
  normal: "Trung bình",
  easy: "Dễ",
} as const;
export type Rank = keyof typeof Rank;

interface IProblem extends Document {
  title: string;
  description: string;
  example: Testcase;
  topic: OTopic;
  testcases: Testcase[];
  rank: Rank;
  point: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OProblem {
  _id: string;
  title: string;
  description: string;
  example: Testcase;
  topic: OTopic;
  testcases: Testcase[];
  rank: Rank;
  point: number;
  createdAt: string;
  updatedAt: string;
}

const TestcaseSchema = new Schema<Testcase>({
  input: {
    type: String,
    required: true,
  },
  output: {
    type: String,
    required: true,
  },
});

const ProblemSchema = new Schema<IProblem>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    example: {
      type: TestcaseSchema,
      required: false,
    },
    topic: {
      type: Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
    },
    testcases: {
      type: [TestcaseSchema],
      required: true,
    },
    rank: {
      type: String,
      enum: Object.keys(Rank),
      required: true,
    },
    point: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Problem: Model<IProblem> =
  mongoose.models.Problem || mongoose.model<IProblem>("Problem", ProblemSchema);

export default Problem;
