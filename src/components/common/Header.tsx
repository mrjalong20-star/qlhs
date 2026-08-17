import { useState } from "react";
import {
  Compass,
  BookOpen,
  FileCheck2,
  Trophy,
  User,
  Lock,
  Menu,
  X,
  Sparkles,
  LogOut,
} from "lucide-react";
import { StudentProfile, AppConfig } from "../../types";

interface HeaderProps {
  config: AppConfig;
  studentProfile: StudentProfile | null;
  currentView: "LESSONS" | "EXAMS" | "MY_RESULTS" | "QUIZ" | "RESULT" | "ADMIN";
  onOpenStudentGate: () => void;
  onOpenAdminLogin: () => void;
  onStudentLogout: () => void;
  onNavigate: (view: "LESSONS" | "EXAMS" | "MY_RESULTS" | "ADMIN") => void;
  isAdmin: boolean;
  authSession?: { role: "SUPER_ADMIN" | "TEACHER"; username: string; displayName: string } | null;
  onLogout: () => void;
}

export function Header({
  config,
  studentProfile,
  currentView,
  onOpenStudentGate,
  onOpenAdminLogin,
  onStudentLogout,
  onNavigate,
  isAdmin,
  authSession,
  onLogout,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sessionMenuOpen, setSessionMenuOpen] = useState(false);

  return (
    <header
      id="main-header"
      className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & School Branding */}
          <div
            id="brand-logo-container"
            onClick={() => onNavigate("LESSONS")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900">
                  QUẢN LÝ HỌC SINH
                </span>
                <span className="hidden md:inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                  GDPT 2018
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate max-w-[200px] sm:max-w-none">
                {config.schoolName} • Năm học {config.schoolYear}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav id="desktop-nav" className="hidden lg:flex items-center gap-1">
            <button
              id="nav-tab-lessons"
              onClick={() => onNavigate("LESSONS")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all cursor-pointer ${
                currentView === "LESSONS"
                  ? "bg-sky-50 text-sky-700 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Hệ thống bài học</span>
            </button>

            <button
              id="nav-tab-exams"
              onClick={() => onNavigate("EXAMS")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all cursor-pointer ${
                currentView === "EXAMS"
                  ? "bg-sky-50 text-sky-700 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Đề kiểm tra thử</span>
            </button>

            <button
              id="nav-tab-results"
              onClick={() => onNavigate("MY_RESULTS")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all cursor-pointer ${
                currentView === "MY_RESULTS"
                  ? "bg-sky-50 text-sky-700 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Kết quả của em</span>
            </button>
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Student Info Pill */}
            {studentProfile ? (
              <div
                id="student-profile-badge"
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 px-3 py-1.5 rounded-full transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs font-bold">
                  {studentProfile.studentName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left leading-tight hidden sm:block">
                  <p className="text-xs font-semibold text-slate-800 truncate max-w-[120px]">
                    {studentProfile.studentName}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Lớp {studentProfile.className}
                  </p>
                </div>
                <button
                  id="btn-change-student"
                  onClick={onOpenStudentGate}
                  title="Đăng nhập lại / đổi học sinh"
                  className="text-xs text-sky-600 hover:text-sky-800 font-medium ml-1 underline cursor-pointer"
                >
                  Đổi
                </button>
                <button
                  id="btn-student-logout"
                  onClick={onStudentLogout}
                  title="Thoát phiên học sinh"
                  className="text-slate-400 hover:text-rose-600 ml-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                id="btn-enter-student"
                onClick={onOpenStudentGate}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700 shadow-xs cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Nhập thông tin</span>
              </button>
            )}

            {/* Unified session badge / login / logout */}
            {authSession ? (
              <div className="relative">
                <button
                  id="btn-session-profile"
                  onClick={() => setSessionMenuOpen((v) => !v)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 text-white border border-slate-700 cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center text-[10px] font-black">
                    {authSession.displayName.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-left leading-tight">
                    <p className="text-[11px] font-bold">{authSession.displayName}</p>
                    <p className="text-[9px] text-slate-400">{authSession.role === "SUPER_ADMIN" ? "Quản trị viên" : "Giáo viên"}</p>
                  </div>
                </button>
                {sessionMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl p-3 z-50">
                    <p className="text-xs font-bold text-slate-900">{authSession.displayName}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Tài khoản: {authSession.username}</p>
                    <p className="text-[11px] text-slate-500">Quyền: {authSession.role === "SUPER_ADMIN" ? "Quản trị viên" : "Giáo viên"}</p>
                    <button onClick={() => { setSessionMenuOpen(false); onLogout(); }} className="mt-3 w-full py-2 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 flex items-center justify-center gap-2">
                      <LogOut className="w-3.5 h-3.5" /> Thoát đăng nhập
                    </button>
                  </div>
                )}
              </div>
            ) : null}

            {/* Teacher Area Button */}
            {isAdmin ? (
              <button
                id="btn-admin-portal"
                onClick={() => onNavigate("ADMIN")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  currentView === "ADMIN"
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-slate-800 text-slate-100 hover:bg-slate-900 border-slate-700"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Khu vực quản trị</span>
                <span className="sm:hidden">Admin</span>
              </button>
            ) : (
              <button
                id="btn-open-teacher-login"
                onClick={onOpenAdminLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Đăng nhập giáo viên / quản trị viên</span>
                <span className="sm:hidden">GV</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              id="btn-mobile-menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden cursor-pointer"
              aria-label="Mở menu điều hướng"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            id="mobile-nav-drawer"
            className="lg:hidden border-t border-slate-200 py-3 space-y-1 bg-white animate-in slide-in-from-top-2 duration-200"
          >
            <button
              id="mobile-tab-lessons"
              onClick={() => {
                onNavigate("LESSONS");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium cursor-pointer ${
                currentView === "LESSONS"
                  ? "bg-sky-50 text-sky-700 font-semibold"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <BookOpen className="w-5 h-5 text-sky-600" />
              <span>Hệ thống bài học SGK</span>
            </button>

            <button
              id="mobile-tab-exams"
              onClick={() => {
                onNavigate("EXAMS");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium cursor-pointer ${
                currentView === "EXAMS"
                  ? "bg-sky-50 text-sky-700 font-semibold"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <FileCheck2 className="w-5 h-5 text-indigo-600" />
              <span>Đề kiểm tra định kì & thử</span>
            </button>

            <button
              id="mobile-tab-results"
              onClick={() => {
                onNavigate("MY_RESULTS");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium cursor-pointer ${
                currentView === "MY_RESULTS"
                  ? "bg-sky-50 text-sky-700 font-semibold"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>Kết quả học tập của em</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
