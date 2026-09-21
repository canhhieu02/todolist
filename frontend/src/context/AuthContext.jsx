import React, { createContext, useState, useEffect, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/axios";
import { toast } from "sonner";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
      queryClient.setQueryData(["user"], null);
    }
  }, [token, queryClient]);

  const { data: user, isLoading: loading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      if (!token) return null;
      try {
        const res = await api.get("/auth/me");
        return res.data;
      } catch (error) {
        console.error("Lỗi xác thực:", error);
        setToken(null);
        return null;
      }
    },
    enabled: true, // Always run, it returns null if no token
  });

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }) => {
      const res = await api.post("/auth/login", { email, password });
      return res.data;
    },
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(["user"], data);
      toast.success("Đăng nhập thành công!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Đăng nhập thất bại");
    }
  });

  const registerMutation = useMutation({
    mutationFn: async ({ name, email, password }) => {
      const res = await api.post("/auth/register", { name, email, password });
      return res.data;
    },
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(["user"], data);
      toast.success("Đăng ký thành công!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Đăng ký thất bại");
    }
  });

  const login = async (email, password) => {
    try {
      await loginMutation.mutateAsync({ email, password });
      return true;
    } catch {
      return false;
    }
  };

  const register = async (name, email, password) => {
    try {
      await registerMutation.mutateAsync({ name, email, password });
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    queryClient.setQueryData(["user"], null);
    toast.info("Đã đăng xuất");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
