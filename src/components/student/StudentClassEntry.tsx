import { useState, useEffect, useRef } from "react";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { AppConfig } from "../../types";

interface StudentClassEntryProps {
  config: AppConfig;
  onEnter: (className: string, studentName: string, dateOfBirth: string, classId?: string) => void;
  onSwitchRole: () => void;
}

// Google Identity Services types
declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export function StudentClassEntry({ config, onEnter, onSwitchRole }: StudentClassEntryProps) {
  const [studentName, setStudentName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [className, setClassName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Check URL for ?class= param
  const urlClassId = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("class")
    : null;

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  // Load Google Identity Services script
  useEffect(() => {
    if (!clientId) return;
    if (window.google?.accounts?.id) {
      setGoogleLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => setGoogleLoaded(true);
    document.head.appendChild(script);
  }, [clientId]);

  // Initialize Google button when loaded
  useEffect(() => {
    if (!googleLoaded || !clientId || !googleBtnRef.current || !window.google?.accounts?.id) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: any) => {
        try {
          // Decode JWT token to get user info
          const payload = JSON.parse(atob(response.credential.split(".")[1]));
          if (payload.name) setStudentName(payload.name);
          if (payload.email) {
            // Use email as dateOfBirth fallback for Google users
            // They still need to enter DOB for teacher verification
          }
        } catch {
          // Ignore decode errors
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    window.google.accounts.id.renderButton(googleBtnRef.current, {
      type: "standard",
      size: "large",
      text: "signin_with",
      shape: "rectangular",
      theme: "outline",
      logo_alignment: "left",
      width: 300,
    });
  }, [googleLoaded, clientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !dateOfBirth.trim()) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    if (!urlClassId && !className.trim()) {
      setError("Vui lòng nhập tên lớp");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (urlClassId) {
        const res = await fetch(`/api/classes/${urlClassId}`);
        const json = await res.json();
        if (json.success && json.data) {
          onEnter(json.data.name || json.data.className, studentName.trim(), dateOfBirth, urlClassId);
        } else {
          onEnter("Lớp " + urlClassId, studentName.trim(), dateOfBirth, urlClassId);
        }
      } else {
        onEnter(className.trim(), studentName.trim(), dateOfBirth);
      }
    } catch {
      onEnter(urlClassId ? "Lớp " + urlClassId : className.trim(), studentName.trim(), dateOfBirth, urlClassId || undefined);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        {/* Back button */}
        <button
          onClick={onSwitchRole}
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-6 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Đổi vai trò
        </button>

        <h1 className="text-xl font-extrabold text-slate-900 mb-1">Vào lớp học</h1>
        <p className="text-sm text-slate-400 mb-6">Nhập thông tin để bắt đầu</p>

        {/* Google Login Button */}
        {clientId && googleLoaded && (
          <div className="mb-6">
            <div ref={googleBtnRef} className="flex justify-center" />
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-slate-400">hoặc nhập thủ công</span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Họ và tên</label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Ngày sinh</label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {!urlClassId && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Tên lớp</label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="Ví dụ: 8A1"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          )}

          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Đang tải..." : "Vào học"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
