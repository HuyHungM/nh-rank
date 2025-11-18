import dbConnect from "@/lib/mongoose";
import Problem, { OProblem } from "@/models/Problem";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params?: { slug?: string } }
) {
  try {
    const slug = params?.slug;
    await dbConnect();

    const problem = await Problem.findById(slug).lean();
    if (!problem)
      return NextResponse.json(
        { ok: false, problem: null, error: "Không tìm thấy bài này" },
        { status: 500 }
      );

    return NextResponse.json({
      problem: {
        ...problem,
        _id: problem._id.toString(),
        createdAt: problem.createdAt.toString(),
        updatedAt: problem.updatedAt.toString(),
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, problem: null, error: "Không tìm thấy bài này" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { title, description, example, testcases, rank, point }: OProblem =
      await req.json();
    await dbConnect();

    const newProblem = new Problem({
      title,
      description,
      example,
      testcases,
      rank,
      point,
    });

    await newProblem.save();

    const problem: OProblem = {
      ...newProblem,
      _id: newProblem._id!.toString(),
      createdAt: newProblem.createdAt.toString(),
      updatedAt: newProblem.updatedAt.toString(),
    };

    return NextResponse.json({ problem });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, problem: null, error: "Đã xảy ra lỗi" },
      { status: 500 }
    );
  }
}
