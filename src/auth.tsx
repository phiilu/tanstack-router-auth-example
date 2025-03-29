import * as React from "react";

import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { sleep } from "./utils";

export type Permission = "READ_INVOICES";

interface User {
  name: string;
  permissions: Permission[];
}

export interface AuthContext {
  isAuthenticated: () => Promise<boolean>;
  login: (username: string) => Promise<void>;
  logout: () => Promise<void>;
  user: User | undefined;
  canAsync: (permission: Permission) => Promise<boolean>;
  can: (permission: Permission) => boolean;
}

const AuthContext = React.createContext<AuthContext | null>(null);

const key = "tanstack.auth.user";

const users: Record<string, User | undefined> = {
  admin: {
    name: "Administrator",
    permissions: ["READ_INVOICES"],
  },
  accountant: {
    name: "Accountant",
    permissions: ["READ_INVOICES"],
  },
  employee: {
    name: "Employee",
    permissions: [],
  },
};

function getStoredUser() {
  return localStorage.getItem(key);
}

function setStoredUser(user: string | null) {
  if (user) {
    localStorage.setItem(key, user);
  } else {
    localStorage.removeItem(key);
  }
}

const userQueryOptions = queryOptions({
  queryKey: ["user"],
  queryFn: async () => {
    console.log("debug: fetching user...");
    await sleep(300);
    const userName = getStoredUser();

    if (!userName) {
      throw Error("Unauthenticated");
    }

    const user = users[userName];
    if (!user) {
      throw Error("Invalid Credentials");
    }

    return user;
  },
  retry: 1,
  staleTime: 1000 * 60 * 60,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const userQuery = useQuery(userQueryOptions);
  const user = React.useMemo(() => userQuery.data, [userQuery.data]);

  const getUser = React.useCallback(() => {
    return queryClient.ensureQueryData(userQueryOptions);
  }, [queryClient]);

  const isAuthenticated = React.useCallback(async () => {
    try {
      await getUser();
      return true;
    } catch {
      return false;
    }
  }, [getUser]);

  const logout = React.useCallback(async () => {
    setStoredUser(null);
    queryClient.removeQueries({ queryKey: userQueryOptions.queryKey });
    window.location.reload();
  }, []);

  const login = React.useCallback(async (username: string) => {
    await sleep(500);

    setStoredUser(username);
  }, []);

  const canAsync = React.useCallback(
    async (permission: Permission) => {
      try {
        const user = await getUser();
        return user.permissions.includes(permission);
      } catch {
        return false;
      }
    },
    [getUser],
  );

  const can = React.useCallback(
    (permission: Permission) => {
      return user?.permissions.includes(permission) ?? false;
    },
    [user],
  );

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, canAsync, can }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
