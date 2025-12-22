import { NextResponse } from "next/server";
import * as jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongoose";
import { User } from "@/models";
import { OUser } from "@/models/User";

const ACCESS_SECRET = process.env.JWT_SECRET!;

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader
      .split("; ")
      .find((c) => c.startsWith("access_token="));
    const accessToken = match?.split("=")[1];
    if (!accessToken)
      return NextResponse.json(
        { ok: false, error: "Chưa xác minh!" },
        { status: 401 }
      );

    const payload = jwt.verify(accessToken, ACCESS_SECRET) as {
      id: string;
      role?: string;
    };

    await dbConnect();
    const user = await User.findById(payload.id).lean<OUser>();
    if (!user)
      return NextResponse.json(
        { ok: false, error: "User không hợp lệ!" },
        { status: 404 }
      );

    return NextResponse.json({ ok: true, user });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: true, error: "Token không hợp lệ!" },
      { status: 401 }
    );
  }
}
