import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import * as jwt from "jsonwebtoken";

import { NotificationProvider } from "@/context/NotificationProvider";
import NotificationContainer from "@/components/home/NotificationContainer";
import { UserProvider, UserRole } from "@/context/UserContext";
import User, { OUser } from "@/models/User";
import dbConnect from "@/lib/mongoose";

import "./globals.css";

const inter = Inter({ style: "normal", subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "NHRank",
  description: "Hakerrank but ...",
};

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  let user: OUser | null = null;

  if (refreshToken) {
    await dbConnect();

    try {
      const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as {
        id: string;
        role: UserRole;
      };
      user = (await User.findById(payload.id)
        .select("-password")
        .lean()) as OUser | null;

      if (user) {
        user = {
          ...user,
          _id: user?._id?.toString(),
        };
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <html lang="en">
      <body
        className={`${inter.className} relative w-screen h-auto overflow-x-hidden overflow-y-auto min-h-screen antialiased`}
      >
        <NotificationProvider>
          {user ? (
            <UserProvider user={user}>{children}</UserProvider>
          ) : (
            children
          )}
          <NotificationContainer />
        </NotificationProvider>
      </body>
    </html>
  );
}
