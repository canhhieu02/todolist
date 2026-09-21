import AddTask from "@/components/AddTask";
import DateTimeFilter from "@/components/DateTimeFilter";
import Footer from "@/components/Footer";
import { Header } from "@/components/Header";
import StatsAndFilters from "@/components/StatsAndFilters";
import TaskList from "@/components/TaskList";
import TaskListPagination from "@/components/TaskListPagination";
import Dashboard from "@/components/Dashboard";
import CalendarView from "@/components/CalendarView";
import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import { visibleTaskLimit } from "@/lib/data";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, ListTodo, CalendarDays } from "lucide-react";

const HomePage = () => {
  const [filter, setFilter] = useState("all");
  const [dateQuery, setDateQuery] = useState("all");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("tasks"); // "tasks" | "dashboard"
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["tasks", dateQuery],
    queryFn: async () => {
      const res = await api.get(`/tasks?filter=${dateQuery}`);
      return res.data;
    },
    enabled: !!user,
  });

  const taskBuffer = data?.tasks || [];
  const activeTaskCount = data?.activeCount || 0;
  const completeTaskCount = data?.completeCount || 0;

  useEffect(() => {
    setPage(1);
  }, [filter, dateQuery]);

  // Socket.io Real-time connection
  useEffect(() => {
    if (!user) return;

    const socket = io("http://localhost:5001", {
      withCredentials: true,
    });

    socket.emit("join_room", user.id);

    socket.on("task_changed", () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    });

    return () => {
      socket.disconnect();
    };
  }, [user, queryClient]);

  const handleTaskChanged = () => {
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  };

  const handleNext = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // biến
  const filteredTasks = taskBuffer.filter((task) => {
    switch (filter) {
      case "active":
        return task.status === "active";
      case "completed":
        return task.status === "complete";
      default:
        return true;
    }
  });

  const totalPages = Math.ceil(filteredTasks.length / visibleTaskLimit);

  // Tự lùi trang nếu trang hiện tại trống (ví dụ xoá task cuối cùng trên trang)
  useEffect(() => {
    if (page > 1 && page > totalPages) {
      setPage(totalPages || 1);
    }
  }, [page, totalPages]);

  const visibleTasks = filteredTasks.slice(
    (page - 1) * visibleTaskLimit,
    page * visibleTaskLimit
  );

  return (
    <div className="min-h-screen w-full bg-background relative text-foreground transition-colors duration-300">
      {/* Dreamy Sky Pink Glow (ẩn ở dark mode để tránh loá) */}
      <div
        className="absolute inset-0 z-0 dark:hidden"
        style={{
          backgroundImage: `
        radial-gradient(circle at 30% 70%, rgba(173, 216, 230, 0.35), transparent 60%),
        radial-gradient(circle at 70% 30%, rgba(255, 182, 193, 0.4), transparent 60%)`,
        }}
      />
      {/* Your Content/Components */}
      <div className="container relative z-10 pt-8 lg:pt-12 mx-auto pb-12 px-4 sm:px-6">
        <div className="w-full max-w-3xl p-6 sm:p-10 mx-auto space-y-8 bg-white/50 dark:bg-black/30 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-[2.5rem] shadow-custom-lg transition-all duration-300">
          {/* Đầu Trang */}
          <Header />

          {/* Tabs chuyển đổi Danh sách/Dashboard/Lịch */}
          <div className="flex flex-wrap justify-center gap-2 mb-6 bg-white/60 dark:bg-white/5 p-1.5 rounded-full w-fit mx-auto border border-white/80 dark:border-white/10 shadow-sm backdrop-blur-md">
            <Button
              variant={activeTab === "tasks" ? "default" : "ghost"}
              className="rounded-full px-5 sm:px-6 transition-all duration-300"
              onClick={() => setActiveTab("tasks")}
            >
              <ListTodo className="size-4 mr-2" />
              Danh Sách
            </Button>
            <Button
              variant={activeTab === "dashboard" ? "default" : "ghost"}
              className="rounded-full px-5 sm:px-6 transition-all duration-300"
              onClick={() => setActiveTab("dashboard")}
            >
              <LayoutDashboard className="size-4 mr-2" />
              Thống Kê
            </Button>
            <Button
              variant={activeTab === "calendar" ? "default" : "ghost"}
              className="rounded-full px-5 sm:px-6 transition-all duration-300"
              onClick={() => setActiveTab("calendar")}
            >
              <CalendarDays className="size-4 mr-2" />
              Lịch
            </Button>
          </div>

          {activeTab === "dashboard" ? (
            <Dashboard tasks={taskBuffer} />
          ) : activeTab === "calendar" ? (
            <CalendarView tasks={taskBuffer} />
          ) : (
            <>
              {/* Tạo Nhiệm Vụ */}
              <AddTask handleNewTaskAdded={handleTaskChanged} />

              {/* Thống Kê và Bộ lọc */}
              <StatsAndFilters
                filter={filter}
                setFilter={setFilter}
                activeTasksCount={activeTaskCount}
                completedTasksCount={completeTaskCount}
              />

              {/* Danh Sách Nhiệm Vụ */}
              <TaskList
                filteredTasks={visibleTasks}
                filter={filter}
                handleTaskChanged={handleTaskChanged}
                isLoading={isLoading}
              />

              {/* Phân Trang và Lọc Theo Date */}
              <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                <TaskListPagination
                  handleNext={handleNext}
                  handlePrev={handlePrev}
                  handlePageChange={handlePageChange}
                  page={page}
                  totalPages={totalPages}
                />
                <DateTimeFilter
                  dateQuery={dateQuery}
                  setDateQuery={setDateQuery}
                />
              </div>
            </>
          )}

          {/* Chân Trang */}
          <Footer
            activeTasksCount={activeTaskCount}
            completedTasksCount={completeTaskCount}
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;