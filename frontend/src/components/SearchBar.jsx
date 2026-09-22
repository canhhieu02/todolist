import React, { useState, useEffect } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import api from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';

const SearchBar = ({ onSearch, filters, setFilters }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => (await api.get('/projects')).data
  });

  return (
    <div className="flex items-center gap-2 w-full max-w-md relative">
      <div className="relative flex-1 group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Tìm kiếm nhiệm vụ, nội dung, tag..." 
          className="pl-9 pr-9 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/60 dark:border-white/10 h-10 rounded-xl w-full"
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 rounded-xl bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/60 dark:border-white/10">
            <SlidersHorizontal className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-4 space-y-4 rounded-xl">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Bộ lọc nâng cao</h4>
            <p className="text-xs text-muted-foreground">Kết hợp nhiều điều kiện để tìm kiếm chính xác.</p>
          </div>
          
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Mức độ ưu tiên</label>
              <select 
                value={filters.priority || ''} 
                onChange={e => setFilters({...filters, priority: e.target.value})}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              >
                <option value="">Tất cả</option>
                <option value="high">Cao</option>
                <option value="medium">Trung bình</option>
                <option value="low">Thấp</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium">Dự án</label>
              <select 
                value={filters.projectId || ''} 
                onChange={e => setFilters({...filters, projectId: e.target.value})}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              >
                <option value="">Tất cả</option>
                {projects.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-medium">Từ ngày</label>
                <Input 
                  type="date" 
                  value={filters.dateFrom || ''} 
                  onChange={e => setFilters({...filters, dateFrom: e.target.value})}
                  className="h-9 text-xs" 
                />
              </div>
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-medium">Đến ngày</label>
                <Input 
                  type="date" 
                  value={filters.dateTo || ''} 
                  onChange={e => setFilters({...filters, dateTo: e.target.value})}
                  className="h-9 text-xs" 
                />
              </div>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-xs mt-2"
            onClick={() => setFilters({})}
          >
            Xóa bộ lọc
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SearchBar;
