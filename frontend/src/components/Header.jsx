import React from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { LogOut, UserCircle, Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { Link } from "react-router";

export const Header = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-row justify-between items-center gap-4 w-full">
      
      <div className="space-y-1.5 text-left min-w-0 flex-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-gradient-primary bg-clip-text drop-shadow-sm tracking-tight truncate">
          Quản lý công việc
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground font-medium hidden sm:block">
          Không có việc gì khó, chỉ sợ mình không làm 💪
        </p>
      </div>

      <div className="flex items-center gap-1.5 bg-white/50 dark:bg-black/20 p-1 rounded-full border border-white/60 dark:border-white/10 backdrop-blur-md shadow-sm shrink-0">
        {/* Nút chuyển đổi Theme */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="rounded-full size-8 hover:bg-white/80 dark:hover:bg-white/10 transition-all"
        >
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          <span className="sr-only">Toggle theme</span>
        </Button>

        {user && (
          <div className="flex items-center gap-1 pr-1">
            <Link to="/profile" className="flex items-center gap-2 px-2 py-1 bg-white/60 dark:bg-black/40 rounded-full border border-white/80 dark:border-white/10 shadow-sm hover:bg-white/80 dark:hover:bg-black/60 transition-colors group cursor-pointer">
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" className="size-5 rounded-full object-cover border border-primary/20" />
              ) : (
                <UserCircle className="size-4 text-primary group-hover:scale-110 transition-transform" />
              )}
              <span className="text-xs font-semibold whitespace-nowrap max-w-[80px] sm:max-w-[120px] truncate">{user.name}</span>
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={logout} 
              className="rounded-full size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
              title="Đăng xuất"
            >
              <LogOut className="size-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
