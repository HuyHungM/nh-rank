import dbConnect from "@/lib/mongoose";
import { Problem } from "@/models";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = await params;
    if (slug.length != 24)
      return NextResponse.json(
        {
          ok: false,
          problem: null,
          error: "Bài tập không tồn tại!",
        },
        { status: 404 }
      );
    await dbConnect();

    const problem = await Problem.findById(slug).populate("topic").lean();
    if (!problem)
      return NextResponse.json(
        {
          ok: false,
          problem: null,
          error: "Bài tập không tồn tại!",
        },
        { status: 404 }
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
      {
        ok: false,
        problem: null,
        error: "Lỗi máy chủ!",
      },
      { status: 500 }
    );
  }
}
