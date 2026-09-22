import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from './ui/button';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      // Ngăn trình duyệt hiện prompt mặc định
      e.preventDefault();
      // Lưu lại event để trigger sau
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-white dark:bg-zinc-900 border border-border shadow-custom-lg rounded-2xl p-4 z-50 flex gap-4 items-start animate-in slide-in-from-bottom-5">
      <div className="bg-primary/10 p-2 rounded-xl text-primary mt-1">
        <Download className="size-5" />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-sm">Cài đặt ứng dụng</h4>
        <p className="text-xs text-muted-foreground mt-1 mb-3 leading-relaxed">
          Cài đặt Todo App Pro vào thiết bị của bạn để truy cập nhanh hơn và hỗ trợ sử dụng offline.
        </p>
        <div className="flex gap-2">
          <Button size="sm" className="flex-1 text-xs h-8" onClick={handleInstall}>
            Cài đặt ngay
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-8 px-2" onClick={() => setShowPrompt(false)}>
            Để sau
          </Button>
        </div>
      </div>
      <button 
        onClick={() => setShowPrompt(false)}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
      >
        <X className="size-4" />
      </button>
    </div>
  );
};

export default PWAInstallPrompt;
