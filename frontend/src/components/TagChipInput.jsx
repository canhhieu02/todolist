import React, { useState } from 'react';
import { X, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from './ui/input';

const TagChipInput = ({ tags = [], onChange, placeholder = "Thêm tag (nhấn Enter)...", className }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = inputValue.trim();
      if (val && !tags.includes(val)) {
        onChange([...tags, val]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Nhấn backspace khi input rỗng sẽ xoá tag cuối cùng
      onChange(tags.slice(0, tags.length - 1));
    }
  };

  const removeTag = (indexToRemove) => {
    onChange(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-1.5 bg-background border border-input rounded-xl focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm font-medium animate-in fade-in zoom-in-95 duration-200"
          >
            <Tag className="size-3" />
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="hover:bg-primary/20 rounded-full p-0.5 transition-colors focus:outline-none"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : "Thêm tag..."}
          className="flex-1 bg-transparent min-w-[120px] outline-none text-sm px-2 text-foreground placeholder:text-muted-foreground/60 h-8"
        />
      </div>
      <p className="text-[11px] text-muted-foreground ml-1">Nhấn Enter để thêm tag, Backspace để xóa</p>
    </div>
  );
};

export default TagChipInput;
