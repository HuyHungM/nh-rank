import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { Submission, Problem } from "@/models";

const JUDGE0_URL = "https://judge0-ce.p.rapidapi.com/submissions";
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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);

    if (submissionId) {
      const sub = await Submission.findById(submissionId)
        .populate("userId", "username name avatarUrl")
        .populate("problemId", "title rank point")
        .lean();

      if (!sub) {
        return NextResponse.json(
          { ok: false, error: "Không tìm thấy submission" },
          { status: 404 }
        );
      }

      return NextResponse.json({ ok: true, submission: toPlain(sub) });
    }

    if (problemId) {
      const submissions = await Submission.find({ problemId })
        .populate("userId", "username name avatarUrl")
        .sort({ point: -1, createdAt: 1 })
        .limit(100)
        .lean();

      return NextResponse.json({
        ok: true,
        submissions: toPlain(submissions),
        total: submissions.length,
      });
    }

    if (userId) {
      const total = await Submission.countDocuments({ userId });
      const submissions = await Submission.find({ userId })
        .populate("problemId", "title rank point topic")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      return NextResponse.json({
        ok: true,
        submissions: toPlain(submissions),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    }

    return NextResponse.json(
      { ok: false, error: "Thiếu tham số: id, problemId hoặc userId" },
      { status: 400 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, error: "Lỗi server" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { problemId, sourceCode, userId } = await req.json();

    if (!userId)
      return NextResponse.json(
        { ok: false, error: "Chưa đăng nhập" },
        { status: 401 }
      );

    if (!problemId || !sourceCode?.trim()) {
      return NextResponse.json(
        { ok: false, error: "Thiếu dữ liệu" },
        { status: 400 }
      );
    }

    const problem = await Problem.findById(problemId)
      .select("title point testcases timeLimit memoryLimit")
      .lean();

    if (!problem || problem.testcases.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Bài tập không tồn tại" },
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

    const batchRes = await fetch(`${JUDGE0_URL}/batch?base64_encoded=true`, {
      method: "POST",
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ submissions }),
    });

    if (!batchRes.ok) throw new Error("Judge0 batch failed");

    const tokens = await batchRes.json();

    let results: any[] = [];
    for (let i = 0; i < 12; i++) {
      await new Promise((r) => setTimeout(r, 800));
      results = await Promise.all(
        tokens.map((t: any) =>
          fetch(`${JUDGE0_URL}/${t.token}?base64_encoded=true&fields=*`, {
            headers: {
              "x-rapidapi-key": RAPIDAPI_KEY,
              "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
            },
          }).then((r) => r.json())
        )
      );
      if (results.every((r) => r.status?.id > 2)) break;
    }

    const testResults = results.map((res: any, i: number) => {
      const expected = problem.testcases[i].output.trim();
      const output = res.stdout
        ? Buffer.from(res.stdout, "base64").toString().trim()
        : "";
      const passed = res.status?.id === 3 && output === expected;

      const stderr = res.stderr
        ? Buffer.from(res.stderr, "base64").toString()
        : "";
      const compile_output = res.compile_output
        ? Buffer.from(res.compile_output, "base64").toString()
        : "";

      let message = "";
      if (res.status.id === 6) message = compile_output || "Compilation Error";
      else if (res.status.id >= 7 && res.status.id <= 12)
        message = stderr || "Runtime Error";
      else if (res.status.id === 4)
        message = `Expected: "${expected}" | Got: "${output}"`;
      else if (res.status.id === 5) message = "Time Limit Exceeded";
      else message = "Accepted";

      return {
        message,
        output,
        passed,
        time: res.time || 0,
        memory: res.memory || 0,
        status: getStatus(res.status?.id),
      };
    });

    const passedCount = testResults.filter((t) => t.passed).length;
    const point = Math.round(
      (passedCount / problem.testcases.length) * problem.point
    );
    const status = passedCount === problem.testcases.length ? "AC" : "WA";

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
  } catch (error) {
    console.error("Submit error:", error);
    return NextResponse.json(
      { ok: false, error: "Nộp bài thất bại" },
      { status: 500 }
    );
  }
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
