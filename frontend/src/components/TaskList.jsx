import React from "react";
import TaskEmptyState from "./TaskEmptyState";
import TaskCard from "./TaskCard";
import { Card } from "./ui/card";

const TaskListSkeleton = () => (
  <div className="space-y-3">
    {[...Array(3)].map((_, i) => (
      <Card
        key={i}
        className="p-4 border-0 bg-gradient-card shadow-custom-md animate-pulse"
      >
        <div className="flex items-center gap-4">
          <div className="rounded-full size-8 bg-muted flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 rounded bg-muted w-3/4" />
            <div className="h-3 rounded bg-muted w-1/2" />
          </div>
        </div>
      </Card>
    ))}
  </div>
);

const TaskList = ({ filteredTasks, filter, handleTaskChanged, isLoading }) => {
  if (isLoading) {
    return <TaskListSkeleton />;
  }

  if (!filteredTasks || filteredTasks.length === 0) {
    return <TaskEmptyState filter={filter} />;
  }

  return (
    <div className="space-y-3">
      {filteredTasks.map((task, index) => (
        <TaskCard
          key={task._id ?? index}
          task={task}
          index={index}
          handleTaskChanged={handleTaskChanged}
        />
      ))}
    </div>
  );
};

export default TaskList;
