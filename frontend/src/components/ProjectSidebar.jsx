import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Folder, Plus, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const ProjectSidebar = ({ selectedProjectId, onSelectProject }) => {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await api.get('/projects');
      return res.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (name) => api.post('/projects', { name, color: '#6366f1' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setNewProjectName('');
      setIsAdding(false);
      toast.success('Đã tạo dự án mới');
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || 'Không thể tạo dự án';
      toast.error(msg);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/projects/${id}`),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (selectedProjectId === deletedId) onSelectProject(null);
      toast.success('Đã xóa dự án');
    },
    onError: () => toast.error('Không thể xóa dự án'),
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      createMutation.mutate(newProjectName);
    }
  };

  return (
    <Card className="p-4 bg-white/40 dark:bg-black/20 backdrop-blur-md border-white/60 dark:border-white/10 shadow-custom-sm sticky top-4 h-fit hidden lg:block w-[250px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2 text-foreground">
          <Folder className="size-4 text-primary" /> Dự Án
        </h3>
        <Button 
          variant="ghost" 
          size="icon" 
          className="size-7 rounded-full text-muted-foreground hover:text-primary"
          onClick={() => setIsAdding(!isAdding)}
        >
          <Plus className="size-4" />
        </Button>
      </div>

      <div className="space-y-1">
        <button
          onClick={() => onSelectProject(null)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedProjectId === null 
              ? 'bg-primary/10 text-primary' 
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
          }`}
        >
          <div className="size-2 rounded-full bg-muted-foreground/50" />
          Tất cả nhiệm vụ
        </button>

        {projects.map(project => (
          <div key={project._id} className="group flex items-center">
            <button
              onClick={() => onSelectProject(project._id)}
              className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedProjectId === project._id
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
            >
              <div 
                className="size-2 rounded-full" 
                style={{ backgroundColor: project.color || '#6366f1' }}
              />
              <span className="truncate flex-1 text-left">{project.name}</span>
            </button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="size-6 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={() => deleteMutation.mutate(project._id)}>
                  <Trash2 className="size-4 mr-2" /> Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="mt-3 animate-in fade-in slide-in-from-top-2 space-y-2">
          <Input 
            autoFocus
            value={newProjectName}
            onChange={e => setNewProjectName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Escape') { setIsAdding(false); setNewProjectName(''); } }}
            placeholder="Tên dự án..."
            className="h-8 text-sm"
          />
          <div className="flex gap-1.5">
            <button
              type="submit"
              disabled={!newProjectName.trim() || createMutation.isPending}
              className="flex-1 h-7 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {createMutation.isPending ? '...' : 'Tạo'}
            </button>
            <button
              type="button"
              onClick={() => { setIsAdding(false); setNewProjectName(''); }}
              className="h-7 px-2 rounded-md text-muted-foreground text-xs hover:bg-muted/50 transition-colors"
            >
              Hủy
            </button>
          </div>
        </form>
      )}
    </Card>
  );
};

export default ProjectSidebar;
