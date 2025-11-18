import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import {
  createAccessToken,
  createRefreshToken,
  setTokenCookies,
} from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { name, username, password } = await req.json();
    await dbConnect();

    const exists = await User.findOne({ username });
    if (exists)
      return NextResponse.json(
        { ok: false, error: "Tên đăng nhập đã tồn tại" },
        { status: 400 }
      );

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      username,
      password: passwordHash,
    });
    await newUser.save();

    const payload = { id: newUser._id!.toString(), role: newUser.role };
    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken(payload);

    let res: NextResponse = NextResponse.json({ ok: true });
    res = setTokenCookies(res, accessToken, refreshToken);

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: "Đăng ký thất bại" },
      { status: 500 }
    );
  }
}
