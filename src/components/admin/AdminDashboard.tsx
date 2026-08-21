import { useState, useMemo } from "react";
import {
  BookOpen,
  Settings,
  Table as TableIcon,
  Download,
  Users,
  FileCheck2,
  LogOut,
  Sparkles,
} from "lucide-react";
import {
  Question,
  Lesson,
  SubmissionResult,
  AppConfig,
  Exam,
} from "../../types";
import { LessonManager } from "./LessonManager";

import { ExamManager } from "./ExamManager";
import { AppsScriptGuideModal } from "./AppsScriptGuideModal";
import { SettingsModal } from "./SettingsModal";
import { StudentPresencePanel } from "./StudentPresencePanel";
import { ClassManager } from "./ClassManager";
import { TeacherManager } from "./TeacherManager";

interface AdminDashboardProps {
  questions: Question[];
  lessons: Lesson[];
  exams: Exam[];
  submissions: SubmissionResult[];
  config: AppConfig;
  onUpdateLesson: (lesson: Lesson) => void;
  onBatchUpdateLessons: (lessons: Lesson[]) => void;
  onAddQuestion: (q: Question) => void;
  onUpdateQuestion: (q: Question) => void;
  onDeleteQuestion: (id: string) => void;
  onBulkImportQuestions: (newQuestions: Question[], mode: "MERGE" | "REPLACE") => void;
  onSaveExam: (exam: Exam, newQuestions?: Question[]) => void;
  onDeleteExam: (id: string) => void;
  onToggleLockExam: (id: string) => void;
  onPreviewExam?: (exam: Exam) => void;
  onSaveConfig: (newConfig: AppConfig) => void;
  onRestoreBackup: (data: { questions: Question[]; lessons: Lesson[]; config: AppConfig }) => void;
  onResetFactory: () => void;
  onLogout: () => void;
  role?: "SUPER_ADMIN" | "TEACHER";
}

export function AdminDashboard({
  questions,
  lessons,
  exams,
  submissions,
  config,
  onUpdateLesson,
  onBatchUpdateLessons,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onBulkImportQuestions,
  onSaveExam,
  onDeleteExam,
  onToggleLockExam,
  onPreviewExam,
  onSaveConfig,
  onRestoreBackup,
  onResetFactory,
  onLogout,
  role = "TEACHER",
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"STUDENTS" | "CLASSES" | "LESSONS" | "EXAMS">("STUDENTS");

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  if (role === "SUPER_ADMIN") {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex items-center justify-between gap-4">
          <div><div className="text-xs font-bold text-amber-400 mb-2">SUPER ADMIN</div><h1 className="text-2xl sm:text-3xl font-extrabold">Quản lý giáo viên</h1><p className="text-xs sm:text-sm text-slate-400 mt-1">Quản trị viên chỉ quản lý tài khoản giáo viên.</p></div>
          <button onClick={onLogout} className="px-4 py-2.5 rounded-xl bg-rose-500/20 text-rose-200 text-xs font-bold flex items-center gap-2"><LogOut className="w-4 h-4"/>Đăng xuất</button>
        </div>
        <TeacherManager />
      </div>
    );
  }

  // CSV export
  const handleExportSubmissionsCsv = () => {
    if (submissions.length === 0) { alert("Chưa có dữ liệu bài nộp để xuất"); return; }
    const headers = ["Họ và tên", "Lớp", "Bài học", "Điểm tổng", "Thời gian (giây)", "Ngày nộp"];
    const rows = submissions.map((s) => [s.studentName, s.className, s.lessonTitle, s.totalScore.toFixed(2), s.timeSpentSeconds, s.submittedAt]);
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Bang_diem_Toan_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="admin-dashboard-container" className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Admin Header */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-xs font-semibold mb-2 text-amber-400 border border-slate-700">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Khu Vực Quản Trị Giáo Viên</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {config.schoolName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Hệ thống quản trị môn {config.subject} • Giáo viên: {config.teacherName || "Quản trị viên"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button onClick={() => setIsGuideOpen(true)} className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs">
            <TableIcon className="w-4 h-4" />
            <span>KẾT NỐI GOOGLE SHEETS</span>
          </button>
          <button onClick={() => setIsSettingsOpen(true)} className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-700">
            <Settings className="w-4 h-4 text-amber-400" />
            <span>CÀI ĐẶT</span>
          </button>
          <button onClick={onLogout} className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-rose-500/30">
            <LogOut className="w-4 h-4" />
            <span>THOÁT</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs gap-1 overflow-x-auto text-xs font-bold">
        <button onClick={() => setActiveTab("STUDENTS")} className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all cursor-pointer whitespace-nowrap ${activeTab === "STUDENTS" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}`}>
          <Users className="w-4 h-4" />
          <span>HỌC SINH</span>
        </button>
        <button onClick={() => setActiveTab("CLASSES")} className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all cursor-pointer whitespace-nowrap ${activeTab === "CLASSES" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}`}>
          <BookOpen className="w-4 h-4" />
          <span>LỚP HỌC</span>
        </button>
        <button onClick={() => setActiveTab("LESSONS")} className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all cursor-pointer whitespace-nowrap ${activeTab === "LESSONS" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}`}>
          <BookOpen className="w-4 h-4" />
          <span>BÀI HỌC ({lessons.length})</span>
        </button>
        <button onClick={() => setActiveTab("EXAMS")} className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all cursor-pointer whitespace-nowrap ${activeTab === "EXAMS" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}`}>
          <FileCheck2 className="w-4 h-4 text-indigo-400" />
          <span>ĐỀ KIỂM TRA ({exams.length})</span>
        </button>
      </div>

      {/* TAB: STUDENTS */}
      {activeTab === "STUDENTS" && (
        <div className="space-y-6">
          {/* StudentPresencePanel — select class to see stats + student list */}
          <StudentPresencePanel submissions={submissions} lessons={lessons} />

          {/* Export button */}
          {submissions.length > 0 && (
            <div className="flex justify-end">
              <button onClick={handleExportSubmissionsCsv} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs">
                <Download className="w-3.5 h-3.5" />
                <span>XUẤT BẢNG ĐIỂM (CSV)</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB: CLASSES */}
      {activeTab === "CLASSES" && <ClassManager />}

      {/* TAB: LESSONS */}
      {activeTab === "LESSONS" && (
        <LessonManager
          lessons={lessons}
          questions={questions}
          onUpdateLesson={onUpdateLesson}
          onBatchUpdateLessons={onBatchUpdateLessons}
        />
      )}

      {/* TAB: EXAMS */}
      {activeTab === "EXAMS" && (
        <ExamManager
          exams={exams}
          questions={questions}
          lessons={lessons}
          onSaveExam={onSaveExam}
          onDeleteExam={onDeleteExam}
          onToggleLock={onToggleLockExam}
          onPreviewExam={onPreviewExam}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        questions={questions}
        lessons={lessons}
        submissions={submissions}
        onSaveConfig={onSaveConfig}
        onRestoreBackup={onRestoreBackup}
        onResetFactory={onResetFactory}
      />

      {/* Apps Script Guide Modal */}
      <AppsScriptGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        config={config}
        onSaveGasUrl={(url) => {
          onSaveConfig({ ...config, googleAppsScriptUrl: url });
        }}
      />
    </div>
  );
}
