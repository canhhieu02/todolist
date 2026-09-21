import React, { useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { vi } from 'date-fns/locale';

import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { useState } from 'react';
import { CheckCircle2, Circle, Clock, Flag, Tag } from 'lucide-react';
import { Button } from './ui/button';

const locales = {
  'vi': vi,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const priorityColors = {
  high: "bg-destructive text-destructive-foreground",
  medium: "bg-warning text-warning-foreground",
  low: "bg-success text-success-foreground"
};

const priorityLabels = {
  high: "Cao",
  medium: "Trung bình",
  low: "Thấp"
};

const CustomToolbar = ({ label, onNavigate, onView, view }) => {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <div className="flex bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-lg p-1 border border-white/80 dark:border-white/10 shadow-sm">
             <Button variant={view === "month" ? "default" : "ghost"} size="sm" onClick={() => onView("month")} className="rounded-md">Tháng</Button>
             <Button variant={view === "week" ? "default" : "ghost"} size="sm" onClick={() => onView("week")} className="rounded-md">Tuần</Button>
             <Button variant={view === "day" ? "default" : "ghost"} size="sm" onClick={() => onView("day")} className="rounded-md">Ngày</Button>
             <Button variant={view === "agenda" ? "default" : "ghost"} size="sm" onClick={() => onView("agenda")} className="rounded-md">Lịch trình</Button>
          </div>
          <div className="flex items-center gap-4 text-lg font-semibold text-foreground">
            <span className="w-px h-6 bg-border"></span>
            <span className="capitalize">{label}</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-5 right-5 sm:bottom-6 sm:right-6 flex items-center gap-1 bg-white/80 dark:bg-black/40 backdrop-blur-md rounded-lg p-1.5 border border-white/80 dark:border-white/10 shadow-custom-sm z-10">
         <Button variant="ghost" size="sm" onClick={() => onNavigate('PREV')} className="rounded-md px-3 text-muted-foreground hover:text-foreground">Trước</Button>
         <Button variant="default" size="sm" onClick={() => onNavigate('TODAY')} className="rounded-md px-4 shadow-sm">Hôm nay</Button>
         <Button variant="ghost" size="sm" onClick={() => onNavigate('NEXT')} className="rounded-md px-3 text-muted-foreground hover:text-foreground">Tiếp</Button>
      </div>
    </>
  );
};

const CalendarView = ({ tasks }) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('month');

  const handleSelectEvent = (event) => {
    setSelectedTask(event.resource);
  };

  const events = useMemo(() => {
    return tasks
      .filter((task) => task.dueDate) // Chỉ lấy các task có ngày hết hạn
      .map((task) => ({
        id: task._id,
        title: task.title,
        start: new Date(task.dueDate),
        end: new Date(task.dueDate),
        resource: task,
      }));
  }, [tasks]);

  const eventStyleGetter = (event) => {
    const task = event.resource;
    let backgroundColor = "#3b82f6"; // Default blue
    
    if (task.status === "complete") {
      backgroundColor = "#9ca3af"; // Gray for complete
    } else if (task.priority === "high") {
      backgroundColor = "#ef4444"; // Red
    } else if (task.priority === "medium") {
      backgroundColor = "#eab308"; // Yellow
    } else if (task.priority === "low") {
      backgroundColor = "#22c55e"; // Green
    }

    const style = {
      backgroundColor,
      borderRadius: '4px',
      opacity: task.status === 'complete' ? 0.7 : 1,
      color: 'white',
      border: '0px',
      display: 'block',
      textDecoration: task.status === 'complete' ? 'line-through' : 'none',
    };
    return { style };
  };

  return (
    <div className="w-full mt-4 bg-white/50 dark:bg-black/10 backdrop-blur rounded-[2rem] p-5 sm:p-6 pb-20 sm:pb-24 shadow-custom-lg border border-border/50 relative flex flex-col">
      <div className="h-[600px] w-full">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          culture="vi"
          date={currentDate}
          onNavigate={(newDate) => setCurrentDate(newDate)}
          view={currentView}
          onView={(newView) => setCurrentView(newView)}
          style={{ height: '100%' }}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleSelectEvent}
          components={{
            toolbar: CustomToolbar
          }}
          messages={{
            next: "Tiếp",
            previous: "Trước",
            today: "Hôm nay",
            month: "Tháng",
            week: "Tuần",
            day: "Ngày",
            agenda: "Lịch trình",
            date: "Ngày",
            time: "Thời gian",
            event: "Nhiệm vụ",
            noEventsInRange: "Không có nhiệm vụ nào trong khoảng thời gian này.",
          }}
        />
      </div>

      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent className="sm:max-w-md">
          {selectedTask && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedTask.status === 'complete' ? (
                    <CheckCircle2 className="size-5 text-success" />
                  ) : (
                    <Circle className="size-5 text-muted-foreground" />
                  )}
                  <span className={selectedTask.status === 'complete' ? "line-through text-muted-foreground" : ""}>
                    {selectedTask.title}
                  </span>
                </DialogTitle>
                <DialogDescription>
                  Chi tiết nhiệm vụ
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3 py-4">
                <div className="flex flex-wrap gap-2">
                   {selectedTask.priority && (
                     <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium", priorityColors[selectedTask.priority] || priorityColors.medium)}>
                       <Flag className="size-3" />
                       {priorityLabels[selectedTask.priority] || "Trung bình"}
                     </span>
                   )}
                   {selectedTask.dueDate && (
                     <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-muted text-muted-foreground">
                       <Clock className="size-3" />
                       {format(new Date(selectedTask.dueDate), "dd/MM/yyyy")}
                     </span>
                   )}
                   {selectedTask.tags?.map((tag, i) => (
                     <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary">
                       <Tag className="size-3" />
                       {tag}
                     </span>
                   ))}
                </div>
                {selectedTask.subTasks?.length > 0 && (
                  <div className="mt-2 space-y-2">
                    <h4 className="text-sm font-semibold text-foreground">Nhiệm vụ con:</h4>
                    {selectedTask.subTasks.map((sub, i) => (
                       <div key={i} className="flex items-center gap-2">
                         {sub.isCompleted ? <CheckCircle2 className="size-4 text-success" /> : <Circle className="size-4 text-muted-foreground" />}
                         <span className={cn("text-sm", sub.isCompleted ? "line-through text-muted-foreground" : "text-foreground")}>
                           {sub.title}
                         </span>
                       </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarView;
