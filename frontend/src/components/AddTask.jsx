import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const addTaskSchema = z.object({
  title: z.string().min(1, "Nội dung công việc không được để trống"),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: z.string().optional(),
  tagsInput: z.string().optional(),
});

const AddTask = ({ handleNewTaskAdded }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addTaskSchema),
    defaultValues: {
      title: "",
      priority: "medium",
      dueDate: "",
      tagsInput: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (newTaskData) => {
      return api.post("/tasks", newTaskData);
    },
    onSuccess: (_, variables) => {
      toast.success(`Nhiệm vụ "${variables.title}" đã được thêm.`);
      handleNewTaskAdded(); 
      queryClient.invalidateQueries({ queryKey: ["tasks"] });

      // Reset
      reset();
      setShowAdvanced(false);
    },
    onError: (error) => {
      console.error("Lỗi xảy ra khi thêm task.", error);
      toast.error("Lỗi xảy ra khi thêm nhiệm vụ mới.");
    },
  });

  const onSubmit = (data) => {
    const tags = data.tagsInput ? data.tagsInput.split(",").map((t) => t.trim()).filter((t) => t) : [];
    
    if (data.dueDate && new Date(data.dueDate) < new Date(new Date().setHours(0,0,0,0))) {
      toast.error("Ngày hết hạn không được nằm trong quá khứ!");
      return;
    }

    mutation.mutate({
      title: data.title,
      priority: data.priority,
      dueDate: data.dueDate || null,
      tags,
    });
  };

  return (
    <Card className="p-5 sm:p-6 bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/60 dark:border-white/10 shadow-custom-md rounded-[1.5rem] transition-all duration-300">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row items-start">
          <div className="flex-1 w-full relative">
            <Input
              type="text"
              placeholder="Cần phải làm gì?"
              className={`h-12 sm:h-14 w-full text-base bg-white/60 dark:bg-black/20 backdrop-blur-sm border-white/80 dark:border-white/10 focus:border-primary/50 focus:ring-primary/20 rounded-2xl transition-all ${errors.title ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              {...register("title")}
            />
            {errors.title && (
              <p className="absolute -bottom-5 left-2 text-xs text-destructive animate-fade-in">{errors.title.message}</p>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="h-12 sm:h-14 px-3 text-muted-foreground hover:bg-white/50 dark:hover:bg-white/10 rounded-2xl transition-all self-stretch"
            title="Tuỳ chọn nâng cao"
          >
            {showAdvanced ? <ChevronUp /> : <ChevronDown />}
          </Button>
          <Button
            type="submit"
            variant="gradient"
            size="xl"
            className="px-6 sm:px-8 h-12 sm:h-14 rounded-2xl font-bold shadow-md hover:shadow-glow transition-all self-stretch"
            disabled={mutation.isPending}
          >
            <Plus className="size-5 mr-1" />
            Thêm
          </Button>
        </div>

        {showAdvanced && (
          <div className="flex flex-col gap-4 sm:flex-row p-4 sm:p-5 mt-4 bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-2xl animate-fade-in border border-white/60 dark:border-white/10 shadow-sm">
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Độ ưu tiên</label>
              <select
                {...register("priority")}
                className="flex h-10 w-full items-center justify-between rounded-xl border border-white/80 dark:border-white/10 bg-white/60 dark:bg-black/20 backdrop-blur-sm px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              >
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
              </select>
            </div>
            <div className="flex-1 space-y-1 relative">
              <label className="text-xs font-medium text-muted-foreground">Ngày hết hạn</label>
              <Input
                type="date"
                {...register("dueDate")}
                className="h-10 bg-white/60 dark:bg-black/20 backdrop-blur-sm border-white/80 dark:border-white/10 rounded-xl transition-all focus:border-primary/50 focus:ring-primary/20"
              />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Nhãn (cách nhau bởi dấu phẩy)</label>
              <Input
                type="text"
                placeholder="VD: học tập, công việc..."
                {...register("tagsInput")}
                className="h-10 bg-white/60 dark:bg-black/20 backdrop-blur-sm border-white/80 dark:border-white/10 rounded-xl transition-all focus:border-primary/50 focus:ring-primary/20"
              />
            </div>
          </div>
        )}
      </form>
    </Card>
  );
};

export default AddTask;
