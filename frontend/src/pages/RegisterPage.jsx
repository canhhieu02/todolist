import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

const registerSchema = z.object({
  name: z.string().min(1, "Tên không được để trống"),
  email: z.string().min(1, "Email không được để trống").email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

const RegisterPage = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    const success = await registerAuth(data.name, data.email, data.password);
    if (success) {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground relative flex items-center justify-center p-4 transition-colors duration-300">
      {/* Dreamy Sky Pink Glow */}
      <div
        className="absolute inset-0 z-0 dark:hidden"
        style={{
          backgroundImage: `
        radial-gradient(circle at 30% 70%, rgba(173, 216, 230, 0.35), transparent 60%),
        radial-gradient(circle at 70% 30%, rgba(255, 182, 193, 0.4), transparent 60%)`,
        }}
      />
      
      <Card className="z-10 w-full max-w-md p-8 bg-white/80 backdrop-blur-md shadow-custom-lg border-0 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-primary bg-clip-text">Tạo Tài Khoản</h1>
          <p className="text-muted-foreground mt-2">Bắt đầu quản lý công việc của bạn ngay hôm nay.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tên của bạn</label>
            <Input 
              type="text" 
              placeholder="VD: Nguyễn Văn A" 
              {...register("name")}
              className={`h-12 bg-white/50 ${errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}`}
            />
            {errors.name && (
              <p className="text-sm text-destructive animate-fade-in">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input 
              type="email" 
              placeholder="Nhập email của bạn" 
              {...register("email")}
              className={`h-12 bg-white/50 ${errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
            />
            {errors.email && (
              <p className="text-sm text-destructive animate-fade-in">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Mật khẩu</label>
            <Input 
              type="password" 
              placeholder="Tạo mật khẩu (ít nhất 6 ký tự)" 
              {...register("password")}
              className={`h-12 bg-white/50 ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
            />
            {errors.password && (
              <p className="text-sm text-destructive animate-fade-in">{errors.password.message}</p>
            )}
          </div>
          <Button type="submit" variant="gradient" className="w-full h-12 mt-6" disabled={isSubmitting}>
            {isSubmitting ? "Đang xử lý..." : "Đăng Ký"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Đăng nhập
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;
