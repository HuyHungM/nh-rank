import User from "@/models/User";
import { UserResponse } from "@/types/user";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const id = req.headers.get("x-user-id");
  const user: UserResponse | null = await User.findById(id);

  if (!user) return NextResponse.json({ user: null }, { status: 404 });

  return NextResponse.json({ user }, { status: 200 });
}
