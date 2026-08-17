import { useState, useEffect } from "react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";

export function NetworkStatusBanner() {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [justReconnected, setJustReconnected] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setJustReconnected(true);
      const timer = setTimeout(() => setJustReconnected(false), 5000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setJustReconnected(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline && !justReconnected) return null;

  return (
    <div
      id="network-status-banner"
      className={`fixed top-0 left-0 right-0 z-50 px-4 py-2 text-sm font-medium transition-all shadow-md flex items-center justify-center gap-2 ${
        isOnline
          ? "bg-emerald-600 text-white"
          : "bg-amber-600 text-white"
      }`}
    >
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4 animate-pulse" />
          <span>Đã khôi phục kết nối mạng! Câu trả lời của bạn đã được an toàn.</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 animate-bounce" />
          <span>Mất kết nối mạng. Hệ thống đang lưu tạm bài làm trên thiết bị của bạn. Bạn vẫn có thể tiếp tục làm bài bình thường!</span>
        </>
      )}
    </div>
  );
}
