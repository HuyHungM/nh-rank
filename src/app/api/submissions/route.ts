import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { Submission, Problem } from "@/models";

const JUDGE0_URL = process.env.JUDGE0_URL;
const RAPIDAPI_KEY = process.env.JUDGE0_RAPIDAPI_KEY!;
if (!RAPIDAPI_KEY) throw new Error("Missing JUDGE0_RAPIDAPI_KEY in .env");

const CPP_LANGUAGE_ID = 105;

const toPlain = (doc: any) => JSON.parse(JSON.stringify(doc));

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const submissionId = searchParams.get("id");
    const problemId = searchParams.get("problemId");
    const userId = searchParams.get("userId");

    if (submissionId) {
      const sub = await Submission.findById(submissionId)
        .populate("userId", "username name avatarUrl")
        .populate("problemId", "title rank point")
        .lean();

      if (!sub) {
        return NextResponse.json(
          { ok: false, error: "Bài nộp không tồn tại!" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { ok: true, submission: toPlain(sub) },
        { status: 200 }
      );
    }

    if (problemId) {
      const submissions = await Submission.find({ problemId })
        .populate("userId", "username name avatarUrl")
        .sort({ createdAt: -1 })
        .lean();

      return NextResponse.json(
        {
          ok: true,
          submissions: toPlain(submissions),
          total: submissions.length,
        },
        { status: 200 }
      );
    }

    if (userId) {
      const submissions = await Submission.find({ userId })
        .populate("problemId", "title rank point topic")
        .sort({ createdAt: -1 })
        .lean();

      return NextResponse.json(
        {
          ok: true,
          submissions: toPlain(submissions),
        },
        { status: 200 }
      );
    }

    const submissions = await Submission.find()
      .populate("problemId", "title rank point topic")
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        ok: true,
        submissions: toPlain(submissions),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, error: "Lỗi máy chủ!" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const typeSubmit = searchParams.get("t")?.toLowerCase();

    const TYPE = ["submit", "code"];

    if (!typeSubmit || !TYPE.includes(typeSubmit))
      return NextResponse.json(
        { ok: false, error: "Loại không hợp lệ!" },
        { status: 400 }
      );

    if (typeSubmit === TYPE[0]) {
      const { problemId, sourceCode, userId } = await req.json();
      return await submitSubmission(problemId, sourceCode, userId);
    } else {
      const { sourceCode, stdin, userId, expected } = await req.json();
      return await runCode(sourceCode, stdin, userId, expected);
    }
  } catch (error) {
    console.error("Submit error:", error);
    return NextResponse.json(
      { ok: false, error: "Nộp bài thất bại!" },
      { status: 500 }
    );
  }
}

async function submitSubmission(
  problemId: string,
  sourceCode: string,
  userId: string
) {
  if (!userId)
    return NextResponse.json(
      { ok: false, error: "Chưa đăng nhập!" },
      { status: 401 }
    );

  if (!problemId || !sourceCode?.trim()) {
    return NextResponse.json(
      { ok: false, error: "Thiếu dữ liệu!" },
      { status: 400 }
    );
  }

  const problem = await Problem.findById(problemId)
    .select("title point testcases timeLimit memoryLimit")
    .lean();

  if (!problem || problem.testcases.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Bài tập không tồn tại!" },
      { status: 404 }
    );
  }

  const submissions = problem.testcases.map((tc: any) => ({
    language_id: CPP_LANGUAGE_ID,
    source_code: Buffer.from(sourceCode).toString("base64"),
    stdin: Buffer.from(tc.input || "").toString("base64"),
    expected_output: Buffer.from(tc.output).toString("base64"),
    cpu_time_limit: 1,
    wall_time_limit: 3,
    memory_limit: 1048576,
  }));

  const batchRes = await fetch(
    `${JUDGE0_URL}/submissions/batch?base64_encoded=true`,
    {
      method: "POST",
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ submissions }),
    }
  );

  if (!batchRes.ok) throw new Error("Judge0 batch failed");

  const tokens = await batchRes.json();

  let results: any[] = [];
  for (let i = 0; i < 12; i++) {
    await new Promise((r) => setTimeout(r, 800));
    results = await Promise.all(
      tokens.map((t: any) =>
        fetch(
          `${JUDGE0_URL}/submissions/${t.token}?base64_encoded=true&fields=*`,
          {
            headers: {
              "x-rapidapi-key": RAPIDAPI_KEY,
              "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
            },
          }
        ).then((r) => r.json())
      )
    );
    if (results.every((r) => r.status?.id > 2)) break;
  }

  const testResults = results.map((res: any, i: number) => {
    const output = res.stdout
      ? Buffer.from(res.stdout, "base64").toString().trim()
      : "";
    const passed = res.status?.id === 3;

    return {
      title: res.status?.description,
      output,
      passed,
      time: res.time || 0,
      memory: res.memory || 0,
      status: getStatus(res.status?.id),
    };
  });

  const passedCount = testResults.filter((t) => t.passed).length;
  const failedCount = problem.testcases.length - passedCount;
  const point = Number(
    ((passedCount / problem.testcases.length) * problem.point).toFixed(2)
  );

  let status;

  if (failedCount === 0) {
    status = "AC";
  } else if (testResults.some((t) => t.status === "TLE")) {
    status = "TLE";
  } else if (testResults.some((t) => t.status === "CE")) {
    status = "CE";
  } else if (testResults.some((t) => t.status === "RE")) {
    status = "RE";
  } else {
    status = "WA";
  }

  const newSub = await Submission.create({
    userId: userId,
    problemId,
    sourceCode: sourceCode,
    point,
    status,
    runtime: Math.max(...testResults.map((t) => t.time || 0)),
    memory: Math.max(...testResults.map((t) => t.memory || 0)),
    testcases: testResults,
  });

  const populated = await Submission.findById(newSub._id)
    .populate("userId", "username name avatarUrl")
    .populate("problemId", "title rank point")
    .lean();

  return NextResponse.json({
    ok: true,
    submission: JSON.parse(JSON.stringify(populated)),
  });
}

async function runCode(
  sourceCode: string,
  stdin: string,
  userId: string,
  expected: string
) {
  if (!userId)
    return NextResponse.json(
      { ok: false, error: "Chưa đăng nhập!" },
      { status: 401 }
    );

  if (!sourceCode?.trim()) {
    return NextResponse.json(
      { ok: false, error: "Thiếu dữ liệu!" },
      { status: 400 }
    );
  }

  const res = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=true`, {
    method: "POST",
    headers: {
      "x-rapidapi-key": RAPIDAPI_KEY,
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      language_id: CPP_LANGUAGE_ID,
      source_code: Buffer.from(sourceCode).toString("base64"),
      stdin: Buffer.from(stdin).toString("base64"),
      cpu_time_limit: 1,
      wall_time_limit: 3,
      memory_limit: 1048576,
      expected_output: Buffer.from(expected).toString("base64"),
    }),
  });

  if (!res.ok)
    return NextResponse.json(
      { ok: false, error: "Lỗi máy chủ!" },
      { status: 500 }
    );

  const data = await res.json();
  let result;

  for (let i = 0; i < 12; i++) {
    await new Promise((r) => setTimeout(r, 800));
    const res = await fetch(
      `${JUDGE0_URL}/submissions/${data.token}?base64_encoded=true&fields=*`,
      {
        headers: {
          "x-rapidapi-key": RAPIDAPI_KEY,
          "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
        },
      }
    );
    if (!res.ok) continue;
    result = await res.json();

    if (result.status?.id > 2) break;
  }

  const output = result.stdout
    ? Buffer.from(result.stdout, "base64").toString()
    : "";
  const stderr = result.stderr
    ? Buffer.from(result.stderr, "base64").toString()
    : "";
  const compile = result.compile_output
    ? Buffer.from(result.compile_output, "base64").toString()
    : "";
  const message = result.message
    ? Buffer.from(result.message, "base64").toString()
    : "";

  const submission = {
    output: output,
    stderr: stderr,
    compile: compile,
    message: message,
    status: getStatus(result.status?.id),
    title: result.status?.description,
    time: result.time,
    memory: result.memory,
    passed: result.status?.id === 3,
  };
  return NextResponse.json({ ok: true, submission });
}

function getStatus(id?: number): string {
  switch (id) {
    case 3:
      return "AC";
    case 4:
      return "WA";
    case 5:
      return "TLE";
    case 6:
      return "CE";
    default:
      return "RE";
  }
}
