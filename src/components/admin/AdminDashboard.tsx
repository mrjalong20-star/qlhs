import { useState, useMemo } from "react";
import {
  BarChart3,
  BookOpen,
  HelpCircle,
  Settings,
  Table as TableIcon,
  Download,
  Users,
  Award,
  TrendingUp,
  AlertCircle,
  FileSpreadsheet,
  LogOut,
  Sparkles,
  Filter,
  CheckCircle2,
  FileCheck2,
} from "lucide-react";
import {
  Question,
  Lesson,
  SubmissionResult,
  AppConfig,
  Exam,
} from "../../types";
import { LessonManager } from "./LessonManager";
import { QuestionBankManager } from "./QuestionBankManager";
import { ExamManager } from "./ExamManager";
import { AppsScriptGuideModal } from "./AppsScriptGuideModal";
import { SettingsModal } from "./SettingsModal";
import { exportQuestionBankToExcel } from "../../services/excelService";
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
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "STUDENTS" | "CLASSES" | "LESSONS" | "EXAMS" | "QUESTIONS" | "GUIDE">("OVERVIEW");
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("ALL");
  const [selectedLessonFilter, setSelectedLessonFilter] = useState<string>("ALL");

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

  // Submissions filtered
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      const matchClass = selectedClassFilter === "ALL" || s.className === selectedClassFilter;
      const matchLesson = selectedLessonFilter === "ALL" || s.lessonId === selectedLessonFilter;
      return matchClass && matchLesson;
    });
  }, [submissions, selectedClassFilter, selectedLessonFilter]);

  // Classes list
  const classList = useMemo(() => {
    const set = new Set(submissions.map((s) => s.className));
    return Array.from(set);
  }, [submissions]);

  // Analytics
  const stats = useMemo(() => {
    if (filteredSubmissions.length === 0) {
      return {
        totalAttempts: 0,
        uniqueStudents: 0,
        averageScore: 0,
        highScoreCount: 0,
        passRate: 0,
      };
    }

    const uniqueStudents = new Set(filteredSubmissions.map((s) => `${s.studentName}_${s.className}`)).size;
    const totalScore = filteredSubmissions.reduce((sum, s) => sum + s.totalScore, 0);
    const avg = totalScore / filteredSubmissions.length;
    const highScoreCount = filteredSubmissions.filter((s) => s.totalScore >= 8.0).length;
    const passCount = filteredSubmissions.filter((s) => s.totalScore >= 5.0).length;
    const passRate = Math.round((passCount / filteredSubmissions.length) * 100);

    return {
      totalAttempts: filteredSubmissions.length,
      uniqueStudents,
      averageScore: Math.round(avg * 100) / 100,
      highScoreCount,
      passRate,
    };
  }, [filteredSubmissions]);

  // Top 5 Weakest Questions (Highest Error Rate)
  const weakestQuestions = useMemo(() => {
    const map = new Map<string, { total: number; wrong: number }>();

    for (const sub of submissions) {
      for (const det of sub.details) {
        const cur = map.get(det.questionId) || { total: 0, wrong: 0 };
        cur.total += 1;
        if (!det.isCorrect) cur.wrong += 1;
        map.set(det.questionId, cur);
      }
    }

    const list = Array.from(map.entries())
      .map(([qId, data]) => {
        const q = questions.find((item) => item.id === qId);
        const errorRate = data.total > 0 ? Math.round((data.wrong / data.total) * 100) : 0;
        return {
          question: q,
          total: data.total,
          wrong: data.wrong,
          errorRate,
        };
      })
      .filter((item) => item.question && item.total >= 1)
      .sort((a, b) => b.errorRate - a.errorRate)
      .slice(0, 5);

    return list;
  }, [submissions, questions]);

  // Export Submissions to CSV
  const handleExportSubmissionsCsv = () => {
    if (filteredSubmissions.length === 0) {
      alert("Chưa có dữ liệu bài nộp để xuất");
      return;
    }

    const headers = [
      "attemptId",
      "Họ và tên",
      "Lớp",
      "Bài học",
      "Lần làm",
      "Điểm tổng",
      "Điểm Phần I",
      "Điểm Phần II",
      "Điểm Phần III",
      "Số câu đúng",
      "Số câu sai",
      "Thời gian (giây)",
      "Ngày nộp",
    ];

    const rows = filteredSubmissions.map((s) => [
      s.attemptId,
      `"${s.studentName}"`,
      s.className,
      `"${s.lessonTitle}"`,
      s.attemptNumber,
      s.totalScore.toFixed(2),
      s.part1Score.toFixed(2),
      s.part2Score.toFixed(2),
      s.part3Score.toFixed(2),
      s.correctQuestionsCount,
      s.wrongQuestionsCount,
      s.timeSpentSeconds,
      s.submittedAt,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Bang_diem_Dia_li_11_${new Date().toISOString().slice(0, 10)}.csv`;
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

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsGuideOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
          >
            <TableIcon className="w-4 h-4" />
            <span>KẾT NỐI GOOGLE SHEETS</span>
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-700"
          >
            <Settings className="w-4 h-4 text-amber-400" />
            <span>CÀI ĐẶT</span>
          </button>

          <button
            onClick={onLogout}
            className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-rose-500/30"
          >
            <LogOut className="w-4 h-4" />
            <span>THOÁT</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs gap-1 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab("OVERVIEW")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "OVERVIEW"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>TỔNG QUAN & BẢNG ĐIỂM</span>
        </button>

        <button
          onClick={() => setActiveTab("STUDENTS")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "STUDENTS"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>HỌC SINH</span>
        </button>

        <button
          onClick={() => setActiveTab("CLASSES")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "CLASSES"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>LỚP HỌC</span>
        </button>

        <button
          onClick={() => setActiveTab("LESSONS")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "LESSONS"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>QUẢN LÝ BÀI HỌC (32 BÀI)</span>
        </button>

        <button
          onClick={() => setActiveTab("EXAMS")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "EXAMS"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <FileCheck2 className="w-4 h-4 text-indigo-400" />
          <span>ĐỀ KIỂM TRA ({exams.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("QUESTIONS")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "QUESTIONS"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>NGÂN HÀNG CÂU HỎI ({questions.length})</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & SUBMISSIONS */}
      {activeTab === "OVERVIEW" && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Tổng lượt nộp</span>
                <TrendingUp className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-3xl font-black text-slate-900">{stats.totalAttempts}</div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {stats.uniqueStudents} học sinh khác nhau
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Điểm trung bình</span>
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-3xl font-black text-amber-600">{stats.averageScore.toFixed(2)}</div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Thang điểm chuẩn 10.0
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Tỉ lệ Đạt (≥5.0)</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-black text-emerald-600">{stats.passRate}%</div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Đạt chuẩn yêu cầu cần đạt
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Điểm giỏi (≥8.0)</span>
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-3xl font-black text-indigo-600">{stats.highScoreCount}</div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Học sinh xuất sắc
              </span>
            </div>
          </div>

          {/* Weakest Questions Widget */}
          {weakestQuestions.length > 0 && (
            <div className="bg-rose-50/70 border border-rose-200 rounded-3xl p-6 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-rose-950 text-sm">
                  Top 5 Câu Hỏi Học Sinh Thường Trả Lời Sai Nhiều Nhất
                </h3>
              </div>
              <p className="text-xs text-rose-800">
                Giáo viên có thể sử dụng danh sách này để củng cố lý thuyết hoặc hướng dẫn phương pháp tính toán trong tiết chữa bài.
              </p>

              <div className="space-y-2 pt-1">
                {weakestQuestions.map((item, idx) => (
                  <div
                    key={item.question?.id || idx}
                    className="p-3 bg-white rounded-2xl border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-2.5 flex-1">
                      <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-bold text-slate-900 line-clamp-1">
                          {item.question?.questionText}
                        </p>
                        <span className="text-[11px] text-slate-500">
                          {item.question?.part} • {item.question?.lessonId}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <span className="text-rose-700 font-extrabold bg-rose-100 px-2.5 py-1 rounded-full">
                        Tỉ lệ sai: {item.errorRate}% ({item.wrong}/{item.total} lượt)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submissions Filter & Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Bảng Điểm Chi Tiết Lượt Làm Bài
                </h3>
                <p className="text-xs text-slate-500">
                  Hiển thị kết quả đồng bộ theo thời gian thực
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Filter Class */}
                <select
                  value={selectedClassFilter}
                  onChange={(e) => setSelectedClassFilter(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="ALL">Tất cả các lớp ({classList.length})</option>
                  {classList.map((c) => (
                    <option key={c} value={c}>
                      Lớp {c}
                    </option>
                  ))}
                </select>

                {/* Filter Lesson */}
                <select
                  value={selectedLessonFilter}
                  onChange={(e) => setSelectedLessonFilter(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="ALL">Tất cả bài học</option>
                  {lessons.map((l) => (
                    <option key={l.id} value={l.id}>
                      Bài {l.lessonNumber}
                    </option>
                  ))}
                </select>

                {/* Export CSV */}
                <button
                  onClick={handleExportSubmissionsCsv}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>XUẤT BẢNG ĐIỂM (CSV)</span>
                </button>
              </div>
            </div>

            {/* Table */}
            {filteredSubmissions.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="min-w-full text-xs text-left divide-y divide-slate-200">
                  <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Học sinh</th>
                      <th className="px-4 py-3">Lớp</th>
                      <th className="px-4 py-3">Bài học</th>
                      <th className="px-4 py-3 text-center">Lần</th>
                      <th className="px-4 py-3 text-center">Điểm tổng</th>
                      <th className="px-4 py-3 text-center">Phần I</th>
                      <th className="px-4 py-3 text-center">Phần II</th>
                      <th className="px-4 py-3 text-center">Phần III</th>
                      <th className="px-4 py-3 text-center">Thời gian</th>
                      <th className="px-4 py-3 text-center">Ngày giờ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredSubmissions.map((sub, idx) => (
                      <tr key={sub.attemptId || idx} className="hover:bg-slate-50/70">
                        <td className="px-4 py-3 font-bold text-slate-900">{sub.studentName}</td>
                        <td className="px-4 py-3 font-semibold text-slate-700">{sub.className}</td>
                        <td className="px-4 py-3 text-slate-700 max-w-xs truncate">{sub.lessonTitle}</td>
                        <td className="px-4 py-3 text-center font-semibold text-slate-500">{sub.attemptNumber}</td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full font-black text-xs ${
                              sub.totalScore >= 8.0
                                ? "bg-emerald-100 text-emerald-800"
                                : sub.totalScore >= 5.0
                                ? "bg-sky-100 text-sky-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {sub.totalScore.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-mono">{sub.part1Score.toFixed(2)}</td>
                        <td className="px-4 py-3 text-center font-mono">{sub.part2Score.toFixed(2)}</td>
                        <td className="px-4 py-3 text-center font-mono">{sub.part3Score.toFixed(2)}</td>
                        <td className="px-4 py-3 text-center font-mono text-slate-500">
                          {Math.floor(sub.timeSpentSeconds / 60)}p {sub.timeSpentSeconds % 60}s
                        </td>
                        <td className="px-4 py-3 text-center text-slate-400">
                          {new Date(sub.submittedAt).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          - {new Date(sub.submittedAt).toLocaleDateString("vi-VN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">Chưa có lượt nộp bài nào theo bộ lọc</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Các bài nộp của học sinh sẽ tự động hiển thị tại đây và được lưu vào Google Sheets.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: STUDENT PRESENCE */}
      {activeTab === "CLASSES" && <ClassManager />}
      {activeTab === "STUDENTS" && <StudentPresencePanel />}

      {/* TAB 2: LESSONS MANAGEMENT */}
      {activeTab === "LESSONS" && (
        <LessonManager
          lessons={lessons}
          questions={questions}
          onUpdateLesson={onUpdateLesson}
          onBatchUpdateLessons={onBatchUpdateLessons}
        />
      )}

      {/* TAB 3: EXAMS MANAGEMENT */}
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

      {/* TAB 4: QUESTIONS BANK MANAGEMENT */}
      {activeTab === "QUESTIONS" && (
        <QuestionBankManager
          questions={questions}
          lessons={lessons}
          onAddQuestion={onAddQuestion}
          onUpdateQuestion={onUpdateQuestion}
          onDeleteQuestion={onDeleteQuestion}
          onBulkImport={onBulkImportQuestions}
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
