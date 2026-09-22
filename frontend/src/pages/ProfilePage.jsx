import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User, Lock, Download, Camera, ArrowLeft } from "lucide-react";
import { Link } from "react-router";

const ProfilePage = () => {
  const { user, login } = useAuth(); // Dùng login(token, user) để update state AuthContext

  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    bio: "",
    emailReminders: true,
    avatar: null,
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    // Fetch profile
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/profile");
        setProfile({
          name: data.name || "",
          bio: data.bio || "",
          emailReminders: data.emailReminders ?? true,
          avatar: data.avatar || null,
        });
      } catch {
        toast.error("Không thể tải thông tin người dùng");
      }
    };
    fetchProfile();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePasswordChange = (e) => {
    setPasswords(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ảnh đại diện không được vượt quá 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile(prev => ({ ...prev, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const submitProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await api.put("/profile", profile);
      toast.success("Cập nhật thông tin thành công");
      // Update auth context
      login(localStorage.getItem("token"), { ...user, name: data.name, avatar: data.avatar });
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi cập nhật thông tin");
    } finally {
      setIsLoading(false);
    }
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    setIsLoading(true);
    try {
      await api.put("/profile/password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success("Đổi mật khẩu thành công");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi đổi mật khẩu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await api.get(`/profile/export?format=${format}`, {
        responseType: format === 'csv' ? 'blob' : 'json' // Quan trọng để tải file
      });
      
      let url, filename;
      
      if (format === 'csv') {
        const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
        url = URL.createObjectURL(blob);
        filename = `tasks_export_${new Date().toISOString().slice(0, 10)}.csv`;
      } else {
        const jsonString = JSON.stringify(response.data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        url = URL.createObjectURL(blob);
        filename = `tasks_export_${new Date().toISOString().slice(0, 10)}.json`;
      }

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Đã tải xuống file ${format.toUpperCase()}`);
    } catch {
      toast.error("Lỗi xuất dữ liệu");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link to="/"><ArrowLeft className="size-5" /></Link>
          </Button>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-light">
            Hồ Sơ Của Tôi
          </h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Cột 1: Thông tin cơ bản */}
          <div className="md:col-span-2 space-y-6">
            <div className="p-6 bg-card border rounded-2xl shadow-custom-sm">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <User className="size-5 text-primary" /> Thông tin cá nhân
              </h2>
              
              <form onSubmit={submitProfile} className="space-y-4">
                <div className="flex items-center gap-6 mb-6">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20 bg-muted flex items-center justify-center">
                      {profile.avatar ? (
                        <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="size-10 text-muted-foreground" />
                      )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity">
                      <Camera className="size-6" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                    </label>
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">{user?.email}</h3>
                    <p className="text-sm text-muted-foreground">Nhấn vào ảnh để thay đổi avatar</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tên hiển thị</label>
                  <Input 
                    name="name" 
                    value={profile.name} 
                    onChange={handleProfileChange} 
                    required 
                    placeholder="Nhập tên của bạn"
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Giới thiệu (Bio)</label>
                  <Textarea 
                    name="bio" 
                    value={profile.bio} 
                    onChange={handleProfileChange} 
                    placeholder="Vài dòng giới thiệu bản thân..."
                    className="resize-none bg-background h-24"
                  />
                </div>

                <label className="flex items-center gap-2 mt-4 cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="emailReminders"
                    checked={profile.emailReminders}
                    onChange={handleProfileChange}
                    className="rounded border-input text-primary focus:ring-primary size-4"
                  />
                  <span className="text-sm">Nhận thông báo qua email khi task sắp tới hạn</span>
                </label>

                <Button type="submit" disabled={isLoading} className="w-full mt-4">
                  Lưu thay đổi
                </Button>
              </form>
            </div>

            {/* Cột 1.5: Export Data */}
            <div className="p-6 bg-card border rounded-2xl shadow-custom-sm">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Download className="size-5 text-primary" /> Xuất dữ liệu
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Tải xuống toàn bộ dữ liệu nhiệm vụ của bạn để sao lưu.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => handleExport('json')} className="flex-1">
                  Xuất JSON
                </Button>
                <Button variant="outline" onClick={() => handleExport('csv')} className="flex-1">
                  Xuất CSV
                </Button>
              </div>
            </div>
          </div>

          {/* Cột 2: Đổi mật khẩu */}
          <div className="space-y-6">
            <div className="p-6 bg-card border rounded-2xl shadow-custom-sm">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Lock className="size-5 text-primary" /> Đổi mật khẩu
              </h2>
              <form onSubmit={submitPassword} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mật khẩu hiện tại</label>
                  <Input 
                    type="password"
                    name="currentPassword" 
                    value={passwords.currentPassword} 
                    onChange={handlePasswordChange} 
                    required 
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mật khẩu mới</label>
                  <Input 
                    type="password"
                    name="newPassword" 
                    value={passwords.newPassword} 
                    onChange={handlePasswordChange} 
                    required 
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Xác nhận mật khẩu mới</label>
                  <Input 
                    type="password"
                    name="confirmPassword" 
                    value={passwords.confirmPassword} 
                    onChange={handlePasswordChange} 
                    required 
                    className="bg-background"
                  />
                </div>
                <Button type="submit" variant="secondary" disabled={isLoading} className="w-full">
                  Đổi mật khẩu
                </Button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
