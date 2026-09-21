import React from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { LogOut, UserCircle, Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export const Header = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        
        <div className="space-y-1.5 text-center sm:text-left order-2 sm:order-1">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-gradient-primary bg-clip-text drop-shadow-sm tracking-tight">
            Quản lý công việc
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground font-medium">
            Không có việc gì khó, chỉ sợ mình không làm 💪
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/50 dark:bg-black/20 p-1.5 rounded-full border border-white/60 dark:border-white/10 backdrop-blur-md shadow-sm order-1 sm:order-2">
          {/* Nút chuyển đổi Theme */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="rounded-full hover:bg-white/80 dark:hover:bg-white/10 transition-all"
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {user && (
            <div className="flex items-center gap-2 animate-fade-in pr-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/60 dark:bg-black/40 rounded-full border border-white/80 dark:border-white/10 shadow-sm">
                <UserCircle className="size-4 text-primary" />
                <span className="text-sm font-semibold">{user.name}</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={logout} 
                className="rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                title="Đăng xuất"
              >
                <LogOut className="size-4" />
              </Button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
