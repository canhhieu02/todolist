import React, { useState, useEffect } from "react";
import TaskEmptyState from "./TaskEmptyState";
import TaskCard from "./TaskCard";
import { Card } from "./ui/card";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import api from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    setTasks(filteredTasks || []);
  }, [filteredTasks]);

  const queryClient = useQueryClient();

  const reorderMutation = useMutation({
    mutationFn: async (itemsToUpdate) => {
      return api.put("/tasks/reorder", { items: itemsToUpdate });
    },
    onSuccess: () => {
      handleTaskChanged(); // Still calling this to keep it consistent
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      console.error("Reorder failed", error);
      setTasks(filteredTasks); // Revert on failure
    }
  });

  const onDragEnd = (result) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    if (sourceIndex === destinationIndex) return;

    const reorderedTasks = Array.from(tasks);
    const [movedTask] = reorderedTasks.splice(sourceIndex, 1);
    reorderedTasks.splice(destinationIndex, 0, movedTask);
    
    const itemsToUpdate = reorderedTasks.map((task, index) => ({
      id: task._id,
      order: index
    }));

    // Optimistic UI update
    setTasks(reorderedTasks);
    
    // Call mutation
    reorderMutation.mutate(itemsToUpdate);
  };

  if (isLoading) {
    return <TaskListSkeleton />;
  }

  if (!tasks || tasks.length === 0) {
    return <TaskEmptyState filter={filter} />;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="task-list">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-3"
          >
            {tasks.map((task, index) => (
              <Draggable key={task._id || `task-${index}`} draggableId={task._id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    style={{
                      ...provided.draggableProps.style,
                      opacity: snapshot.isDragging ? 0.8 : 1,
                    }}
                  >
                    <TaskCard
                      task={task}
                      index={index}
                      handleTaskChanged={handleTaskChanged}
                      dragHandleProps={provided.dragHandleProps}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default TaskList;
