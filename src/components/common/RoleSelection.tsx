import { GraduationCap, User } from "lucide-react";
import { AppConfig } from "../../types";

interface RoleSelectionProps {
  config: AppConfig;
  onSelectRole: (role: "TEACHER" | "STUDENT") => void;
}

export function RoleSelection({ config, onSelectRole }: RoleSelectionProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      {/* Brand */}
      <div className="text-center mb-12">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          QUẢN LÝ HỌC SINH
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          {config.subject} • Năm học {config.schoolYear}
        </p>
      </div>

      {/* Role Buttons */}
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={() => onSelectRole("TEACHER")}
          className="flex items-center gap-4 w-full p-5 rounded-xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="text-left">
            <p className="font-bold text-slate-900">Giáo viên</p>
            <p className="text-xs text-slate-400">Quản lý lớp & bài tập</p>
          </div>
        </button>

        <button
          onClick={() => onSelectRole("STUDENT")}
          className="flex items-center gap-4 w-full p-5 rounded-xl border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <User className="w-6 h-6" />
          </div>
          <div className="text-left">
            <p className="font-bold text-slate-900">Học sinh</p>
            <p className="text-xs text-slate-400">Vào lớp học</p>
          </div>
        </button>
      </div>
    </div>
  );
}
