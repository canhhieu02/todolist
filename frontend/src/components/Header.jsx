import React from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { LogOut, UserCircle, Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export const Header = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        {/* Nút chuyển đổi Theme */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="rounded-full"
        >
          {theme === "dark" ? <Sun className="h-[1.2rem] w-[1.2rem] transition-all" /> : <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />}
          <span className="sr-only">Toggle theme</span>
        </Button>

        {user && (
          <div className="flex items-center gap-2 animate-fade-in">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-full border border-primary/10">
              <UserCircle className="size-4 text-primary" />
              <span className="text-sm font-medium">{user.name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-destructive">
              <LogOut className="size-4 mr-2" />
              Đăng xuất
            </Button>
          </div>
        )}
      </div>

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
