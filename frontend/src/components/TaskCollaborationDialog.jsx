import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Send, Share2, MessageSquare, UserCircle } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { io } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";

const TaskCollaborationDialog = ({ open, onOpenChange, task }) => {
  const { user } = useAuth();
  const [shareEmail, setShareEmail] = useState("");
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [sharedWith, setSharedWith] = useState(task?.sharedWith || []);
  const scrollRef = useRef(null);

  // Fetch comments khi mở dialog
  useEffect(() => {
    if (open && task) {
      const fetchComments = async () => {
        try {
          const res = await api.get(`/collaboration/tasks/${task._id}/comments`);
          setComments(res.data);
          setTimeout(() => {
            if (scrollRef.current) {
              scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
          }, 100);
        } catch (error) {
          console.error("Lỗi tải bình luận:", error);
        }
      };
      fetchComments();
      setSharedWith(task.sharedWith || []);
    }
  }, [open, task]);

  // Socket.io cho comments
  useEffect(() => {
    if (!open || !task) return;
    
    // Khởi tạo socket connection (có thể dùng chung file socket instance nhưng demo tạm ở đây)
    const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5001");
    
    socket.on(`comment_${task._id}`, (newComment) => {
      setComments((prev) => [...prev, newComment]);
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    });

    return () => {
      socket.disconnect();
    };
  }, [open, task]);

  const handleShare = async (e) => {
    e.preventDefault();
    if (!shareEmail.trim()) return;
    try {
      await api.post(`/collaboration/tasks/${task._id}/share`, { email: shareEmail });
      toast.success(`Đã chia sẻ nhiệm vụ với ${shareEmail}`);
      setSharedWith([...sharedWith, { email: shareEmail, role: 'viewer' }]); // local update UI nhanh
      setShareEmail("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi chia sẻ nhiệm vụ");
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      // POST API, server sẽ emit event qua socket
      await api.post(`/collaboration/tasks/${task._id}/comments`, { content: commentText });
      setCommentText("");
    } catch {
      toast.error("Lỗi khi gửi bình luận");
    }
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-white/10 shadow-custom-lg">
        <DialogHeader className="p-4 pb-2 border-b">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            Thảo luận & Chia sẻ
          </DialogTitle>
          <p className="text-sm text-muted-foreground truncate">{task.title}</p>
        </DialogHeader>

        <Tabs defaultValue="comments" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
            <TabsTrigger 
              value="comments"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-2 font-semibold"
            >
              <MessageSquare className="size-4 mr-2" /> Bình luận
            </TabsTrigger>
            <TabsTrigger 
              value="share"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-2 font-semibold"
            >
              <Share2 className="size-4 mr-2" /> Chia sẻ
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="comments" className="m-0 flex flex-col h-[350px]">
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-2 opacity-50">
                  <MessageSquare className="size-8" />
                  <p className="text-sm">Chưa có bình luận nào</p>
                </div>
              ) : (
                comments.map((comment, idx) => {
                  const isMine = typeof comment.userId === 'object' 
                    ? comment.userId._id === user?.id 
                    : comment.userId === user?.id; // Tùy thuộc vào populate
                  
                  // Handle populated user or raw object
                  const userName = comment.userId?.name || user?.name || "Người dùng";
                  const userAvatar = comment.userId?.avatar || null;

                  return (
                    <div key={idx} className={`flex gap-3 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className="size-8 rounded-full bg-muted overflow-hidden flex-shrink-0 flex items-center justify-center border border-primary/20">
                        {userAvatar ? (
                          <img src={userAvatar} alt="avatar" className="size-full object-cover" />
                        ) : (
                          <UserCircle className="size-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[75%]`}>
                        <span className="text-xs text-muted-foreground mb-1">{userName}</span>
                        <div className={`px-3 py-2 rounded-2xl text-sm ${
                          isMine 
                            ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                            : 'bg-muted text-foreground rounded-tl-sm'
                        }`}>
                          {comment.content}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="p-3 border-t bg-card/50">
              <form onSubmit={handleComment} className="flex gap-2">
                <Input 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Viết bình luận..."
                  className="flex-1 rounded-full bg-background"
                />
                <Button type="submit" size="icon" className="rounded-full shrink-0">
                  <Send className="size-4" />
                </Button>
              </form>
            </div>
          </TabsContent>
          
          <TabsContent value="share" className="m-0 p-4 h-[350px]">
            <form onSubmit={handleShare} className="flex gap-2 mb-6">
              <Input 
                type="email"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                placeholder="Nhập email người nhận..."
                className="flex-1"
                required
              />
              <Button type="submit">Chia sẻ</Button>
            </form>

            <h4 className="text-sm font-semibold mb-3">Người đã được chia sẻ:</h4>
            {sharedWith.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Chưa chia sẻ với ai.</p>
            ) : (
              <div className="space-y-3">
                {sharedWith.map((sw, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-muted/50 p-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <UserCircle className="size-5 text-primary" />
                      <span className="text-sm font-medium">{typeof sw === 'object' ? sw.email : sw}</span>
                    </div>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Viewer</span>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default TaskCollaborationDialog;
