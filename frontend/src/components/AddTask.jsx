import React, { useState } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

const AddTask = ({ handleNewTaskAdded }) => {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  const addTask = async () => {
    if (newTaskTitle.trim()) {
      try {
        const tags = tagsInput.split(",").map((t) => t.trim()).filter((t) => t);

        await api.post("/tasks", {
          title: newTaskTitle,
          priority,
          dueDate: dueDate || null,
          tags,
        });

        toast.success(`Nhiệm vụ "${newTaskTitle}" đã được thêm.`);
        handleNewTaskAdded();

        // Reset
        setNewTaskTitle("");
        setPriority("medium");
        setDueDate("");
        setTagsInput("");
        setShowAdvanced(false);
      } catch (error) {
        console.error("Lỗi xảy ra khi thêm task.", error);
        toast.error("Lỗi xảy ra khi thêm nhiệm vụ mới.");
      }
    } else {
      toast.error("Bạn cần nhập nội dung của nhiệm vụ.");
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      addTask();
    }
  };

  return (
    <Card className="p-6 border-0 bg-gradient-card shadow-custom-lg transition-all duration-300">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            type="text"
            placeholder="Cần phải làm gì?"
            className="h-12 text-base bg-slate-50 sm:flex-1 border-border/50 focus:border-primary/50 focus:ring-primary/20"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button
            variant="ghost"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="h-12 px-3 text-muted-foreground"
            title="Tuỳ chọn nâng cao"
          >
            {showAdvanced ? <ChevronUp /> : <ChevronDown />}
          </Button>
          <Button
            variant="gradient"
            size="xl"
            className="px-6"
            onClick={addTask}
            disabled={!newTaskTitle.trim()}
          >
            <Plus className="size-5" />
            Thêm
          </Button>
        </div>

        {showAdvanced && (
          <div className="flex flex-col gap-3 sm:flex-row p-4 mt-2 bg-white/50 rounded-xl animate-fade-in border border-primary/10">
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Độ ưu tiên</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
              </select>
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Ngày hết hạn</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-10 bg-white"
              />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Nhãn (cách nhau bởi dấu phẩy)</label>
              <Input
                type="text"
                placeholder="VD: học tập, công việc..."
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="h-10 bg-white"
                onKeyDown={(e) => {
                  if (e.key === "Enter") addTask();
                }}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AddTask;
