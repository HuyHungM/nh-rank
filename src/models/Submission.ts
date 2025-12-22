/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Document, Model, Schema, Types } from "mongoose";

type Testcase = {
  title: string;
  output?: string;
  passed: boolean;
  time?: number;
  memory?: number;
  status?: "AC" | "WA" | "TLE" | "MLE" | "RE" | "CE";
};

interface ISubmission extends Document {
  userId: Types.ObjectId;
  problemId: Types.ObjectId;
  sourceCode: string;
  point: number;
  testcases: Testcase[];
  status?: "AC" | "WA" | "TLE" | "MLE" | "RE" | "CE";
  runtime?: number;
  memory?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OSubmission {
  _id: string;
  userId: { _id: string; username: string; name: string; avatarUrl?: string };
  problemId: { _id: string; title: string; rank: string; point: number };
  sourceCode: string;
  point: number;
  testcases: Testcase[];
  status?: string;
  runtime?: number;
  memory?: number;
  createdAt: string;
  updatedAt: string;
}

const TestcaseSchema = new Schema<Testcase>(
  {
    title: { type: String, required: true, trim: true },
    output: { type: String, required: false, trim: true },
    passed: { type: Boolean, required: true },
    time: { type: Number, required: false },
    memory: { type: Number, required: false },
    status: {
      type: String,
      enum: ["AC", "WA", "TLE", "MLE", "RE", "CE"],
      default: "WA",
    },
  },
  { _id: false }
);

const SubmissionSchema = new Schema<ISubmission>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID là bắt buộc"],
    },
    problemId: {
      type: Schema.Types.ObjectId,
      ref: "Problem",
      required: [true, "Problem ID là bắt buộc"],
    },
    sourceCode: {
      type: String,
      required: [true, "Source code là bắt buộc"],
      maxlength: [65535, "Source code quá dài (tối đa 64KB)"],
    },
    point: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ["AC", "WA", "TLE", "MLE", "RE", "CE"],
      default: "WA",
    },
    runtime: { type: Number, min: 0 },
    memory: { type: Number, min: 0 },
    testcases: {
      type: [TestcaseSchema],
      required: true,
      default: [],
      validate: [
        (v: any) => Array.isArray(v) && v.length > 0,
        "Phải có ít nhất 1 testcase",
      ],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

SubmissionSchema.index({ problemId: 1, status: 1, point: -1, runtime: 1 });
SubmissionSchema.index({ userId: 1, createdAt: -1 });
SubmissionSchema.index({ problemId: 1, userId: 1 }, { unique: false });
SubmissionSchema.index({ createdAt: -1 });
SubmissionSchema.index({ problemId: 1, createdAt: -1 });
SubmissionSchema.index({ status: 1 });

const Submission: Model<ISubmission> =
  mongoose.models.Submission ||
  mongoose.model<ISubmission>("Submission", SubmissionSchema);

export default Submission;
