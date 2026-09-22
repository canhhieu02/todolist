import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Eye, Edit2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const MarkdownEditor = ({ 
  value, 
  onChange, 
  placeholder = "Thêm mô tả chi tiết (hỗ trợ Markdown)...",
  className 
}) => {
  const [isPreview, setIsPreview] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Mở rộng khi có nội dung hoặc đang focus
  const isExpanded = isFocused || value?.trim().length > 0 || isPreview;

  return (
    <div className={cn(
      "relative flex flex-col border rounded-xl overflow-hidden transition-all duration-300",
      isExpanded ? "min-h-[150px] shadow-custom-sm bg-white/50 dark:bg-black/20" : "h-[44px] bg-background",
      isFocused ? "border-primary ring-1 ring-primary" : "border-input hover:border-primary/50",
      className
    )}>
      {/* Toolbar chỉ hiện khi mở rộng */}
      {isExpanded && (
        <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
          <div className="text-xs font-medium text-muted-foreground">Mô tả chi tiết</div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant={!isPreview ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setIsPreview(false)}
            >
              <Edit2 className="size-3 mr-1" /> Chỉnh sửa
            </Button>
            <Button
              type="button"
              variant={isPreview ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setIsPreview(true)}
            >
              <Eye className="size-3 mr-1" /> Xem trước
            </Button>
          </div>
        </div>
      )}

      {/* Editor / Preview Area */}
      <div className={cn("flex-1 relative", isExpanded ? "p-3" : "p-0")}>
        {isPreview ? (
          <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-foreground/90 markdown-body h-full min-h-[100px] overflow-y-auto">
            {value ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {value}
              </ReactMarkdown>
            ) : (
              <p className="text-muted-foreground/60 italic">Chưa có mô tả...</p>
            )}
          </div>
        ) : (
          <Textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className={cn(
              "resize-none bg-transparent border-0 focus-visible:ring-0 p-0 text-sm h-full min-h-[100px]",
              !isExpanded && "h-[44px] min-h-0 py-3 px-4"
            )}
          />
        )}
      </div>

      {/* Helper text Markdown */}
      {isExpanded && !isPreview && isFocused && (
        <div className="absolute bottom-2 right-3 text-[10px] text-muted-foreground/50 animate-in fade-in">
          Hỗ trợ Markdown (*nghiêng*, **đậm**, - list, [] task)
        </div>
      )}
    </div>
  );
};

export default MarkdownEditor;
