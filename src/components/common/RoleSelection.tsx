import { GraduationCap, User, ArrowRight, Compass, BookOpen, ShieldCheck } from "lucide-react";
import { AppConfig } from "../../types";

interface RoleSelectionProps {
  config: AppConfig;
  onSelectRole: (role: "TEACHER" | "STUDENT") => void;
}

export function RoleSelection({ config, onSelectRole }: RoleSelectionProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-sky-50/30 to-indigo-50/20 px-4 py-12">
      {/* Brand */}
      <div className="text-center mb-10 sm:mb-14">
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-200">
          <Compass className="w-9 h-9 sm:w-11 sm:h-11" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          QUẢN LÝ HỌC SINH
        </h1>
        <p className="text-sm sm:text-base text-slate-500 font-medium mt-2">
          {config.subject} • Năm học {config.schoolYear}
        </p>
        {config.schoolName && (
          <p className="text-xs text-slate-400 mt-1">{config.schoolName}</p>
        )}
      </div>

      {/* Role Cards */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-8 w-full max-w-2xl">
        {/* Teacher Card */}
        <button
          onClick={() => onSelectRole("TEACHER")}
          className="group relative w-full sm:w-72 bg-white rounded-2xl border-2 border-slate-200 hover:border-sky-400 shadow-sm hover:shadow-xl hover:shadow-sky-100 transition-all duration-300 p-8 text-center cursor-pointer"
        >
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-200 group-hover:scale-110 transition-transform duration-300">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Giáo viên</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-5">
            Quản lý lớp học, tạo đề thi, theo dõi kết quả học sinh
          </p>
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-sky-600 group-hover:text-sky-700">
            <span>Vào hệ thống</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Divider */}
        <div className="hidden sm:flex flex-col items-center gap-2 text-slate-300">
          <div className="w-px h-16 bg-slate-200" />
          <span className="text-xs font-bold uppercase tracking-widest">hoặc</span>
          <div className="w-px h-16 bg-slate-200" />
        </div>
        <div className="sm:hidden flex items-center gap-3 text-slate-300">
          <div className="h-px w-12 bg-slate-200" />
          <span className="text-xs font-bold uppercase tracking-widest">hoặc</span>
          <div className="h-px w-12 bg-slate-200" />
        </div>

        {/* Student Card */}
        <button
          onClick={() => onSelectRole("STUDENT")}
          className="group relative w-full sm:w-72 bg-white rounded-2xl border-2 border-slate-200 hover:border-emerald-400 shadow-sm hover:shadow-xl hover:shadow-emerald-100 transition-all duration-300 p-8 text-center cursor-pointer"
        >
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform duration-300">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Học sinh</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-5">
            Ôn tập bài học, làm bài kiểm tra, xem kết quả học tập
          </p>
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 group-hover:text-emerald-700">
            <span>Vào lớp học</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* Footer info */}
      <div className="mt-12 sm:mt-16 text-center space-y-3">
        <div className="flex items-center justify-center gap-5 text-slate-400">
          <div className="flex items-center gap-1.5 text-xs">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{config.subject}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Bảo mật dữ liệu</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-400">
          Hệ thống quản lý học sinh theo Chương trình GDPT 2018
        </p>
      </div>
    </div>
  );
}
