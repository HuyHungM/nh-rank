import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import * as jwt from "jsonwebtoken";

import { NotificationProvider } from "@/context/NotificationProvider";
import NotificationContainer from "@/components/home/NotificationContainer";
import { UserProvider, UserRole } from "@/context/UserContext";
import { OUser } from "@/models/User";
import { User } from "@/models";
import dbConnect from "@/lib/mongoose";

import "./globals.css";
import QueryProvider from "@/context/QueryProvider";

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
      const dbUser = await User.findById(payload.id)
        .select("username name avatarUrl role _id createdAt")
        .lean<OUser>({ virtuals: true });

      if (dbUser) {
        user = {
          ...dbUser,
          _id: dbUser._id.toString(),
          createdAt: dbUser.createdAt.toString(),
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
        <QueryProvider>
          <NotificationProvider>
            {user ? (
              <UserProvider user={user}> {children}</UserProvider>
            ) : (
              children
            )}
            <NotificationContainer />
          </NotificationProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
