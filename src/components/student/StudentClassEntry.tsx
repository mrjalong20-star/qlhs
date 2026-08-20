import { useState, type FormEvent } from "react";
import { User, ArrowRight, ShieldCheck, GraduationCap } from "lucide-react";
import { AppConfig } from "../../types";

interface StudentClassEntryProps {
  config: AppConfig;
  onEnter: (className: string) => void;
  onSwitchRole: () => void;
}

export function StudentClassEntry({ config, onEnter, onSwitchRole }: StudentClassEntryProps) {
  const [className, setClassName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const clean = className.trim();
    if (!clean) {
      setError("Vui lòng nhập tên lớp.");
      return;
    }
    if (clean.length < 2) {
      setError("Tên lớp quá ngắn.");
      return;
    }
    onEnter(clean);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Vào lớp học</h1>
          <p className="text-sm text-slate-500 mt-1">
            Nhập tên lớp để bắt đầu học
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20">
              <User className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold">Nhập tên lớp của bạn</h2>
            <p className="text-xs text-emerald-100 mt-1">Ví dụ: 11A1, 10A2, 9A1...</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Tên lớp <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={className}
                onChange={(e) => {
                  setClassName(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Ví dụ: 11A1"
                autoFocus
                className="w-full px-4 py-3.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900 text-center text-lg tracking-wider"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
            >
              <span>VÀO HỌC</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onSwitchRole}
              className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              ← Quay lại chọn vai trò
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Không cần mật khẩu</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
