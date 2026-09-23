import AddTask from "@/components/AddTask";
import DateTimeFilter from "@/components/DateTimeFilter";
import Footer from "@/components/Footer";
import { Header } from "@/components/Header";
import StatsAndFilters from "@/components/StatsAndFilters";
import TaskList from "@/components/TaskList";
import TaskListPagination from "@/components/TaskListPagination";
import Dashboard from "@/components/Dashboard";
import CalendarView from "@/components/CalendarView";
import ProjectSidebar from "@/components/ProjectSidebar";
import SearchBar from "@/components/SearchBar";
import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import { visibleTaskLimit } from "@/lib/data";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, ListTodo, CalendarDays } from "lucide-react";

const HomePage = () => {
  // ── Status filter (gửi lên server) ──────────────────────────────────────
  // "all" | "active" | "completed"
  const [statusFilter, setStatusFilter] = useState("all");

  // ── Date filter (gửi lên server) ────────────────────────────────────────
  const [dateQuery, setDateQuery] = useState("all");

  // ── Project filter (gửi lên server) ─────────────────────────────────────
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  // ── Search & Advanced Filters (gửi lên server) ─────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [advancedFilters, setAdvancedFilters] = useState({});

  // ── Phân trang (gửi lên server) ─────────────────────────────────────────
  const [page, setPage] = useState(1);

  const [activeTab, setActiveTab] = useState("tasks"); // "tasks" | "dashboard" | "calendar"
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // ── Fetch tasks (server-side pagination + filter) ────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ["tasks", dateQuery, statusFilter, page, selectedProjectId, searchQuery, advancedFilters],
    queryFn: async () => {
      // Nếu có search query hoặc advanced filters -> gọi API search mới
      if (searchQuery || Object.keys(advancedFilters).length > 0) {
        const queryParams = new URLSearchParams({
          q: searchQuery,
          page: page,
          limit: visibleTaskLimit,
          ...(selectedProjectId && { projectId: selectedProjectId }),
          ...(statusFilter !== "all" && { status: statusFilter }),
          ...advancedFilters
        });
        const res = await api.get(`/collaboration/search?${queryParams.toString()}`);
        return res.data;
      }

      // Ngược lại, gọi API tasks thông thường (tối ưu hóa aggregate)
      const res = await api.get(
        `/tasks?filter=${dateQuery}&status=${statusFilter}&page=${page}&limit=${visibleTaskLimit}${selectedProjectId ? `&projectId=${selectedProjectId}` : ""}`
      );
      return res.data;
    },
    enabled: !!user,
    // Giữ data cũ khi chuyển trang (tránh nhấp nháy)
    placeholderData: (prev) => prev,
  });

  // Dữ liệu từ server — tasks đã được phân trang sẵn
  const visibleTasks = data?.tasks || [];
  const activeTaskCount = data?.activeCount || 0;
  const completeTaskCount = data?.completeCount || 0;
  const totalPages = data?.totalPages || 1;

  // Dùng cho Dashboard và Calendar: cần toàn bộ tasks (không phân trang)
  // Fetch riêng khi ở tab Dashboard/Calendar
  const { data: allTasksData } = useQuery({
    queryKey: ["tasks", "all_for_charts"],
    queryFn: async () => {
      const res = await api.get("/tasks?filter=all&limit=1000");
      return res.data;
    },
    enabled: !!user && (activeTab === "dashboard" || activeTab === "calendar"),
    staleTime: 2 * 60 * 1000, // cache 2 phút cho charts
  });
  const allTasks = allTasksData?.tasks || [];

  // ── Reset trang khi đổi filter ───────────────────────────────────────────
  useEffect(() => {
    setPage(1);
  }, [statusFilter, dateQuery]);

  // ── Tự lùi trang nếu trang vượt quá totalPages ──────────────────────────
  useEffect(() => {
    if (page > 1 && page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  // ── Socket.io Real-time ──────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    // Dùng biến môi trường để linh hoạt giữa dev và production
    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5001";
    const socket = io(socketUrl, { withCredentials: true });

    // user._id: ID từ MongoDB document (thay vì user.id bị undefined)
    socket.emit("join_room", user._id?.toString());

    socket.on("task_changed", () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    });

    return () => {
      // Cleanup listener trước khi disconnect tránh memory leak
      socket.off("task_changed");
      socket.disconnect();
    };
  }, [user, queryClient]);

  // ── Invalidate queries sau khi thêm/sửa/xóa task ───────────────────────
  const handleTaskChanged = () => {
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  };

  // ── Handlers phân trang ──────────────────────────────────────────────────
  const handleNext = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

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
        <div className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row gap-6">
          
          {/* Sidebar (Projects) */}
          <div className="lg:w-[250px] shrink-0">
            <ProjectSidebar 
              selectedProjectId={selectedProjectId} 
              onSelectProject={setSelectedProjectId} 
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-8 bg-white/50 dark:bg-black/30 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-[2.5rem] shadow-custom-lg p-6 sm:p-10 transition-all duration-300 min-w-0">
            {/* Đầu Trang */}
            <div className="border-b border-border/50 pb-6 mb-6">
              <Header />
            </div>

            {/* Thanh tìm kiếm và Tabs */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-6">
              <div className="w-full lg:w-auto flex-1 lg:max-w-md">
                <SearchBar 
                  onSearch={setSearchQuery} 
                  filters={advancedFilters} 
                  setFilters={setAdvancedFilters} 
                />
              </div>

              {/* Tabs chuyển đổi Danh sách/Dashboard/Lịch */}
              <div className="flex flex-wrap justify-center gap-2 bg-white/60 dark:bg-white/5 p-1.5 rounded-full w-fit mx-auto lg:mx-0 border border-white/80 dark:border-white/10 shadow-sm backdrop-blur-md">
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
        </div>

          {activeTab === "dashboard" ? (
            <Dashboard tasks={allTasks} />
          ) : activeTab === "calendar" ? (
            <CalendarView tasks={allTasks} />
          ) : (
            <>
              {/* Tạo Nhiệm Vụ */}
              <AddTask handleNewTaskAdded={handleTaskChanged} selectedProjectId={selectedProjectId} />

              {/* Thống Kê và Bộ lọc trạng thái */}
              <StatsAndFilters
                filter={statusFilter}
                setFilter={(val) => setStatusFilter(val)}
                activeTasksCount={activeTaskCount}
                completedTasksCount={completeTaskCount}
              />

              {/* Danh Sách Nhiệm Vụ — đã phân trang sẵn từ server */}
              <TaskList
                filteredTasks={visibleTasks}
                filter={statusFilter}
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
          </div> {/* Đóng Main Content */}
        </div> {/* Đóng flex container */}
      </div>
    </div>
  );
};

export default HomePage;