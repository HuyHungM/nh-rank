import { NextResponse } from "next/server";
import * as jwt from "jsonwebtoken";

import dbConnect from "@/lib/mongoose";
import { OUser } from "@/models/User";
import { User } from "@/models";
import {
  createAccessToken,
  createRefreshToken,
  setTokenCookies,
} from "@/lib/auth";
import { UserRole } from "@/context/UserContext";

const REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!;

export async function POST(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader
      .split(";")
      .find((c) => c.startsWith("refresh_token="));
    const refreshToken = match?.split("=")[1];

    if (!refreshToken)
      return NextResponse.json(
        { ok: false, error: "No refresh token!" },
        { status: 401 }
      );

    const payload = jwt.verify(refreshToken, REFRESH_SECRET) as {
      id: string;
      role: UserRole;
    };

    await dbConnect();

    const user = await User.findOne({ id: payload.id }).lean<OUser>();
    if (!user)
      return NextResponse.json(
        { ok: false, error: "User không hợp lệ!" },
        { status: 401 }
      );

    const newAccess = createAccessToken(payload);
    const newRefresh = createRefreshToken(payload);
    let res: NextResponse = NextResponse.json({ ok: true });
    res = setTokenCookies(res, newAccess, newRefresh);

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: "Refresh token không hợp lệ!" },
      { status: 401 }
    );
  }
}
