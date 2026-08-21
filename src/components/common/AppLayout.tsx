import { useState, useEffect } from "react";
import {
  BookOpen, FileCheck2, ClipboardList, Settings2, Users, Menu, X,
  LogOut, Compass, BarChart3, GraduationCap, User
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: any;
  adminOnly?: boolean;
}

interface AppLayoutProps {
  children: React.ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
  userRole: "TEACHER" | "STUDENT";
  userName?: string;
  userSubtitle?: string;
  onLogout?: () => void;
  onSwitchRole?: () => void;
  isAdmin?: boolean;
}

const TEACHER_NAV: NavItem[] = [
  { id: "DASHBOARD", label: "Trang chủ", icon: Compass },
  { id: "ADMIN", label: "Quản lý", icon: Settings2, adminOnly: true },
  { id: "ASSIGNMENTS", label: "Giao bài", icon: ClipboardList, adminOnly: true },
];

const STUDENT_NAV: NavItem[] = [
  { id: "DASHBOARD", label: "Trang chủ", icon: Compass },
  { id: "HOMEWORK", label: "Bài tập về nhà", icon: ClipboardList },
  { id: "LESSONS", label: "Bài giảng", icon: BookOpen },
  { id: "EXAMS", label: "Đề thi", icon: FileCheck2 },
  { id: "MY_RESULTS", label: "Kết quả", icon: BarChart3 },
];

export function AppLayout({
  children, currentView, onNavigate, userRole, userName, userSubtitle,
  onLogout, onSwitchRole, isAdmin
}: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Close sidebar on mobile when navigating
  const handleNav = (view: string) => {
    onNavigate(view);
    if (isMobile) setSidebarOpen(false);
  };

  const navItems = userRole === "TEACHER" ? TEACHER_NAV : STUDENT_NAV;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar - desktop: always visible, mobile: overlay */}
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-56 md:fixed md:inset-y-0 bg-white border-r border-slate-200 z-30">
        {/* Brand */}
        <div className="h-14 flex items-center gap-2 px-4 border-b border-slate-100 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-sm text-slate-900">QLHS</span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            if (item.adminOnly && !isAdmin) return null;
            const Icon = item.icon;
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  active
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-4.5 h-4.5 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User info at bottom */}
        <div className="p-3 border-t border-slate-100 shrink-0">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${
              userRole === "TEACHER" ? "bg-blue-500" : "bg-emerald-500"
            }`}>
              {userName?.charAt(0) || (userRole === "TEACHER" ? "GV" : "HS")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">{userName || (userRole === "TEACHER" ? "Giáo viên" : "Học sinh")}</p>
              {userSubtitle && <p className="text-[10px] text-slate-400 truncate">{userSubtitle}</p>}
            </div>
            {onLogout && (
              <button onClick={onLogout} className="text-slate-400 hover:text-red-500 cursor-pointer" title="Đăng xuất">
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
          {onSwitchRole && (
            <button
              onClick={onSwitchRole}
              className="w-full mt-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-center"
            >
              Đổi vai trò
            </button>
          )}
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 h-full bg-white shadow-xl flex flex-col">
            {/* Brand */}
            <div className="h-14 flex items-center justify-between px-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                  <Compass className="w-5 h-5" />
                </div>
                <span className="font-extrabold text-sm text-slate-900">QLHS</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav items */}
            <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                if (item.adminOnly && !isAdmin) return null;
                const Icon = item.icon;
                const active = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      active
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5 shrink-0" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* User info */}
            <div className="p-3 border-t border-slate-100 shrink-0">
              <div className="flex items-center gap-3 px-2 py-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                  userRole === "TEACHER" ? "bg-blue-500" : "bg-emerald-500"
                }`}>
                  {userName?.charAt(0) || (userRole === "TEACHER" ? "GV" : "HS")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">{userName || (userRole === "TEACHER" ? "Giáo viên" : "Học sinh")}</p>
                  {userSubtitle && <p className="text-[10px] text-slate-400 truncate">{userSubtitle}</p>}
                </div>
                {onLogout && (
                  <button onClick={onLogout} className="text-slate-400 hover:text-red-500 cursor-pointer" title="Đăng xuất">
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
              {onSwitchRole && (
                <button
                  onClick={onSwitchRole}
                  className="w-full mt-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-center"
                >
                  Đổi vai trò
                </button>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 md:ml-56 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            {/* Mobile: hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-sm font-semibold text-slate-700 hidden md:block">
              {navItems.find(n => n.id === currentView)?.label || "QLHS"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile: show user avatar */}
            <div className="md:hidden flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                userRole === "TEACHER" ? "bg-blue-500" : "bg-emerald-500"
              }`}>
                {userName?.charAt(0) || (userRole === "TEACHER" ? "GV" : "HS")}
              </div>
              {onLogout && (
                <button onClick={onLogout} className="text-slate-400 hover:text-red-500 cursor-pointer" title="Đăng xuất">
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-12">
          {children}
        </main>
      </div>
    </div>
  );
}
