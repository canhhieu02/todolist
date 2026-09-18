import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fefcff] relative p-4">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
        radial-gradient(circle at 30% 70%, rgba(173, 216, 230, 0.35), transparent 60%),
        radial-gradient(circle at 70% 30%, rgba(255, 182, 193, 0.4), transparent 60%)`,
        }}
      />
      
      <Card className="z-10 w-full max-w-md p-8 bg-white/80 backdrop-blur-md shadow-custom-lg border-0 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-primary bg-clip-text">Đăng Nhập</h1>
          <p className="text-muted-foreground mt-2">Chào mừng trở lại! Hãy đăng nhập để quản lý công việc.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input 
              type="email" 
              placeholder="Nhập email của bạn" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 bg-white/50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Mật khẩu</label>
            <Input 
              type="password" 
              placeholder="Nhập mật khẩu" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 bg-white/50"
            />
          </div>
          <Button type="submit" variant="gradient" className="w-full h-12 mt-6">
            Đăng Nhập
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="text-primary hover:underline font-medium">
            Đăng ký ngay
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
