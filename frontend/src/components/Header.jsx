import React from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { LogOut, UserCircle } from "lucide-react";

export const Header = () => {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-4">
      {user && (
        <div className="flex justify-end items-center gap-2 mb-4 animate-fade-in">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 rounded-full border border-primary/10">
            <UserCircle className="size-4 text-primary" />
            <span className="text-sm font-medium">{user.name}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-destructive">
            <LogOut className="size-4 mr-2" />
            Đăng xuất
          </Button>
        </div>
      )}

      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-bold text-transparent bg-primary bg-clip-text">
          Quản lý công việc
        </h1>

        <p className="text-muted-foreground">
          Không có việc gì khó, chỉ sợ mình không làm 💪
        </p>
      </div>
    </div>
  );
};
