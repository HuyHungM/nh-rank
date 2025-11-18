import { NextResponse } from "next/server";
import * as jwt from "jsonwebtoken";

import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
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
        { ok: false, error: "No refresh token" },
        { status: 401 }
      );

    const payload = jwt.verify(refreshToken, REFRESH_SECRET) as {
      id: string;
      role: UserRole;
    };

    await dbConnect();

    const user = await User.findOne({ id: payload.id });
    if (!user)
      return NextResponse.json(
        { ok: false, error: "User không hợp lệ" },
        { status: 401 }
      );

    const newAccess = createAccessToken(payload);
    const newRefresh = createRefreshToken(payload);
    const { accessCookie, refreshCookie } = setTokenCookies(
      newAccess,
      newRefresh
    );

    return NextResponse.json(
      { ok: true },
      {
        headers: {
          "Set-Cookie": `${accessCookie}; ${refreshCookie}`,
        },
        status: 200,
      }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: "Refresh token không hợp lệ" },
      { status: 401 }
    );
  }
}
