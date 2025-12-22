import Problem from "@/models/Problem";
import dbConnect from "@/lib/mongoose";
import { OProblem, Rank } from "@/models/Problem";
import { Topic } from "@/models";
import { NextResponse } from "next/server";
import { OTopic } from "@/models/Topic";

interface CreateProblemBody {
  title: string;
  description?: string;
  example?: { input: string; output: string };
  testcases: { input: string; output: string }[];
  rank: Rank;
  topic: string;
  point: number;
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const topicId = searchParams.get("topic");
    let topic = null;
    if (topicId) {
      if (topicId.length > 0 && topicId.length != 24) {
        return NextResponse.json(
          { ok: false, error: "Chủ đề không tồn tại!" },
          { status: 404 }
        );
      }
      topic = await Topic.findById(topicId).select("name").lean<OTopic>();
      if (!topic) {
        return NextResponse.json(
          { ok: false, error: "Chủ đề không tồn tại!" },
          { status: 404 }
        );
      }
    }

    const filter = topicId ? { topic: topicId } : {};
    const problems = await Problem.find(filter)
      .select("title _id rank point topic")
      .populate<{ topic: { _id: string; name: string } }>("topic", "name")
      .sort({ createdAt: -1 });
    return NextResponse.json({
      ok: true,
      topic: topic,
      problems: problems,
    });
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
    const body = (await req.json()) as CreateProblemBody;

    if (!body.title?.trim()) {
      return NextResponse.json(
        { ok: false, error: "Tiêu đề là bắt buộc!" },
        { status: 400 }
      );
    }
    if (!body.topic) {
      return NextResponse.json(
        { ok: false, error: "Chủ đề là bắt buộc!" },
        { status: 400 }
      );
    }
    if (!body.testcases || body.testcases.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Phải có ít nhất 1 testcase!" },
        { status: 400 }
      );
    }
    if (!body.rank || !Object.keys(Rank).includes(body.rank)) {
      return NextResponse.json(
        { ok: false, error: "Độ khó không hợp lệ!" },
        { status: 400 }
      );
    }
    if (typeof body.point !== "number" || body.point < 0 || body.point > 100) {
      return NextResponse.json(
        { ok: false, error: "Điểm phải từ 0-100!" },
        { status: 400 }
      );
    }

    await dbConnect();

    const topicExists = await Topic.findById(body.topic).select("_id name");
    if (!topicExists) {
      return NextResponse.json(
        { ok: false, error: "Chủ đề không tồn tại!" },
        { status: 404 }
      );
    }

    const newProblem = await Problem.create({
      title: body.title.trim(),
      description: body.description?.trim() || "",
      example: body.example || null,
      testcases: body.testcases,
      topic: body.topic,
      rank: body.rank,
      point: body.point,
    });

    const populated = await Problem.findById(newProblem._id)
      .populate<{ topic: { _id: string; name: string } }>("topic", "name")
      .lean();

    const plain = JSON.parse(JSON.stringify(populated)) as any;

    const responseProblem: OProblem = {
      _id: plain._id,
      title: plain.title,
      description: plain.description,
      example: plain.example,
      topic: plain.topic,
      testcases: plain.testcases,
      rank: plain.rank,
      point: plain.point,
      createdAt: plain.createdAt,
      updatedAt: plain.updatedAt,
    };

    return NextResponse.json(
      { ok: true, problem: responseProblem },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, error: "Tạo bài thất bại!" },
      { status: 500 }
    );
  }
}
