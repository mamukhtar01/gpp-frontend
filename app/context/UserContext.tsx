"use client";

import React, { createContext, useContext } from "react";

type User = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  status: string;
};

type UserDataContextType = {
  user: User | null;
};

const UserDataContext = createContext<UserDataContextType>({
  user: null,
});

export function UserDataProvider({ user, children }: { user: User | null, children: React.ReactNode }) {
  return (
    <UserDataContext.Provider value={{ user }}>
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  return useContext(UserDataContext);
}