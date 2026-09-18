import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../lib/axios";
import { toast } from "sonner";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      fetchUser();
    } else {
      localStorage.removeItem("token");
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
    } catch (error) {
      console.error("Lỗi xác thực:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      setToken(res.data.token);
      setUser(res.data);
      toast.success("Đăng nhập thành công!");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Đăng nhập thất bại");
      return false;
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await api.post("/auth/register", { name, email, password });
      setToken(res.data.token);
      setUser(res.data);
      toast.success("Đăng ký thành công!");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Đăng ký thất bại");
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    toast.info("Đã đăng xuất");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
