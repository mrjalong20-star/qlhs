import { useState } from "react";
import { Compass, BookOpen, FileCheck2, User, Menu, X, LogOut, ClipboardList } from "lucide-react";
import { StudentProfile, AppConfig } from "../../types";

interface HeaderProps {
  config: AppConfig; studentProfile: StudentProfile | null;
  currentView: "LESSONS" | "EXAMS" | "MY_RESULTS" | "QUIZ" | "RESULT" | "ADMIN" | "ASSIGNMENTS";
  onOpenStudentGate: () => void; onOpenAdminLogin: () => void; onStudentLogout: () => void;
  onNavigate: (view: "LESSONS" | "EXAMS" | "MY_RESULTS" | "ADMIN" | "ASSIGNMENTS") => void;
  isAdmin: boolean; authSession?: { role: "SUPER_ADMIN" | "TEACHER"; username: string; displayName: string } | null; onLogout: () => void;
  onSwitchRole?: () => void; userRole?: "TEACHER" | "STUDENT";
}

export function Header({ config, studentProfile, currentView, onOpenStudentGate, onOpenAdminLogin, onStudentLogout, onNavigate, isAdmin, authSession, onLogout, onSwitchRole, userRole }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <div onClick={() => onNavigate("LESSONS")} className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-sm text-slate-900 tracking-tight hidden sm:block">
            QLHS
          </span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {userRole !== "TEACHER" && (
            <>
              <NavBtn icon={BookOpen} label="Bài học" active={currentView === "LESSONS"} onClick={() => onNavigate("LESSONS")} />
              <NavBtn icon={FileCheck2} label="Đề thi" active={currentView === "EXAMS"} onClick={() => onNavigate("EXAMS")} />
            </>
          )}
          {isAdmin && (
            <>
              <NavBtn icon={ClipboardList} label="Giao bài" active={currentView === "ASSIGNMENTS"} onClick={() => onNavigate("ASSIGNMENTS")} />
            </>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Student info */}
          {studentProfile && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                {studentProfile.studentName.charAt(0)}
              </div>
              <span className="text-xs font-semibold text-slate-700 hidden sm:block">{studentProfile.studentName}</span>
              <button onClick={onStudentLogout} className="text-slate-400 hover:text-red-500 cursor-pointer" title="Đăng xuất">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Teacher / Admin */}
          {authSession && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 hidden sm:block">{authSession.displayName}</span>
              {isAdmin && (
                <button onClick={() => onNavigate("ADMIN")} className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold cursor-pointer">
                  Quản trị
                </button>
              )}
              <button onClick={onLogout} className="text-slate-400 hover:text-red-500 cursor-pointer" title="Đăng xuất">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {!authSession && !studentProfile && (
            <button onClick={onOpenAdminLogin} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 cursor-pointer">
              Giáo viên
            </button>
          )}

          {/* Switch role */}
          {onSwitchRole && (
            <button onClick={onSwitchRole} className="px-2 py-1.5 rounded-lg text-xs text-slate-500 hover:bg-slate-100 cursor-pointer">
              Đổi
            </button>
          )}

          {/* Mobile menu */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 md:hidden text-slate-600 cursor-pointer">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white py-2">
          {userRole !== "TEACHER" && (
            <>
              <MobileBtn icon={BookOpen} label="Bài học" onClick={() => { onNavigate("LESSONS"); setMobileMenuOpen(false); }} />
              <MobileBtn icon={FileCheck2} label="Đề thi" onClick={() => { onNavigate("EXAMS"); setMobileMenuOpen(false); }} />
            </>
          )}
          {isAdmin && (
            <>
              <MobileBtn icon={ClipboardList} label="Giao bài" onClick={() => { onNavigate("ASSIGNMENTS"); setMobileMenuOpen(false); }} />
            </>
          )}
        </div>
      )}
    </header>
  );
}

function NavBtn({ icon: Icon, label, active, onClick }: { icon: any; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

function MobileBtn({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50">
      <Icon className="w-5 h-5 text-slate-400" />
      {label}
    </button>
  );
}
