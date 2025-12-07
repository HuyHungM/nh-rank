import dbConnect from "@/lib/mongoose";
import { Problem } from "@/models";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = await params;
    await dbConnect();

    const problem = await Problem.findById(slug).populate("topic").lean();
    if (!problem)
      return NextResponse.json(
        { ok: false, problem: null, error: "Không tìm thấy bài này" },
        { status: 500 }
      );

    return NextResponse.json({
      ok: true,
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
