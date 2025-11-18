"use client";

import { createContext, ReactNode, useContext, useState } from "react";
import { OUser } from "@/models/User";

export type UserRole = "teacher" | "student";

interface UserContextType {
  user: OUser;
  setUser: (user: OUser) => void;
}

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({
  children,
  user,
}: {
  children: ReactNode;
  user: OUser;
}) => {
  const [currentUser, setCurrentUser] = useState<OUser>(user);
  return (
    <UserContext.Provider
      value={{ user: currentUser, setUser: setCurrentUser }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};
