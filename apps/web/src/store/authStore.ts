import { create } from "zustand";

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: "admin" | "student" | "teacher";
}

interface AuthStore {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => {
  const savedToken = localStorage.getItem("token");
  const savedUser = localStorage.getItem("user");

  return {
    isAuthenticated: !!savedToken,
    user: savedUser ? JSON.parse(savedUser) : null,
    token: savedToken,

    login: async (email: string, password: string) => {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error("Login failed");

      const data = await response.json();
      const { token, user } = data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      set({ isAuthenticated: true, token, user });
    },

    logout: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      set({ isAuthenticated: false, token: null, user: null });
    },

    setAuth: (token: string, user: AuthUser) => {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      set({ isAuthenticated: true, token, user });
    },

    clearAuth: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      set({ isAuthenticated: false, token: null, user: null });
    },
  };
});
