import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/auth";

export async function POST() {
  let res: NextResponse = NextResponse.json({ ok: true });
  res = clearAuthCookies(res);
  return res;
}
