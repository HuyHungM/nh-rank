import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const publicPaths = ["/login"];

  if (publicPaths.includes(pathname)) return NextResponse.next();

  const token = req.cookies.get("refresh_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const payload = jwt.verify(token, JWT_REFRESH_SECRET) as {
      id: string;
      role?: string;
    };

    const headers = new Headers(req.headers);
    headers.set("x-user-id", payload.id);

    return NextResponse.next({ request: { headers } });
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/((?!api/auth/|_next/|favicon.ico|static/).*)"],
};
