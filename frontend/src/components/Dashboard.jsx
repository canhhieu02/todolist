import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, subDays, isSameDay } from "date-fns";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
const PRIORITY_COLORS = { low: "#22c55e", medium: "#eab308", high: "#ef4444" };

const Dashboard = ({ tasks }) => {
  const activeCount = tasks.filter(t => t.status === "active").length;
  const completeCount = tasks.filter(t => t.status === "complete").length;
  
  const statusData = [
    { name: "Chưa xong", value: activeCount },
    { name: "Đã hoàn thành", value: completeCount },
  ];

  const priorityData = [
    { name: "Cao", count: tasks.filter(t => t.priority === "high").length, fill: PRIORITY_COLORS.high },
    { name: "Trung bình", count: tasks.filter(t => t.priority === "medium").length, fill: PRIORITY_COLORS.medium },
    { name: "Thấp", count: tasks.filter(t => t.priority === "low").length, fill: PRIORITY_COLORS.low },
  ];

  const overdueCount = tasks.filter(t => t.status !== "complete" && t.dueDate && new Date(t.dueDate) < new Date()).length;

  // Trend data (7 ngày gần nhất)
  const trendData = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    const count = tasks.filter(t => t.status === "complete" && t.completedAt && isSameDay(new Date(t.completedAt), d)).length;
    return {
      date: format(d, 'dd/MM'),
      completed: count
    };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-card shadow-sm border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Tổng Công Việc</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{tasks.length}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card shadow-sm border-success/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Đã Hoàn Thành</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{completeCount}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-sm border-destructive/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Quá Hạn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{overdueCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-center text-sm text-muted-foreground">Trạng Thái Công Việc</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex justify-center">
            {tasks.length === 0 ? (
              <div className="flex items-center text-muted-foreground">Không có dữ liệu</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? "#FFBB28" : "#00C49F"} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-center text-sm text-muted-foreground">Phân Bố Độ Ưu Tiên</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex justify-center">
             {tasks.length === 0 ? (
              <div className="flex items-center text-muted-foreground">Không có dữ liệu</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart (Line Chart) */}
      <Card className="bg-gradient-card shadow-sm border-white/40 dark:border-white/5">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
            Biểu Đồ Hoàn Thành (7 ngày qua)
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.2)" vertical={false} />
              <Line type="monotone" dataKey="completed" name="Hoàn thành" stroke="#0088FE" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ stroke: 'hsl(var(--muted-foreground) / 0.2)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
