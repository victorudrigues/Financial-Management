"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient, TOKEN_STORAGE_KEY } from "@/lib/api-client";
import { CheckEmailResponse, LoginResponse, RegisterResponse } from "@/types/dtos";

interface AuthUser {
  userId: string;
  email: string;
  fullName: string;
  roles: string[];
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  checkEmail: (email: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const USER_STORAGE_KEY = "fm.user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  function persistSession(data: LoginResponse | RegisterResponse) {
    localStorage.setItem(TOKEN_STORAGE_KEY, data.accessToken);
    const authUser: AuthUser = {
      userId: data.userId,
      email: data.email,
      fullName: data.fullName,
      roles: data.roles,
    };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authUser));
    setUser(authUser);
  }

  async function login(email: string, password: string) {
    const { data } = await apiClient.post<LoginResponse>("/api/auth/login", { email, password });
    persistSession(data);
    router.push("/dashboard");
  }

  async function register(fullName: string, email: string, password: string) {
    const { data } = await apiClient.post<RegisterResponse>("/api/auth/register", {
      fullName,
      email,
      password,
      role: "Administrador",
    });
    persistSession(data);
    router.push("/dashboard");
  }

  async function checkEmail(email: string) {
    const { data } = await apiClient.get<CheckEmailResponse>("/api/auth/check-email", { params: { email } });
    return data.exists;
  }

  function logout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, register, checkEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider.");
  }
  return context;
}
