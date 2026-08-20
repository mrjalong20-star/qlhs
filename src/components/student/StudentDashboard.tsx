import { BookOpen, ClipboardList, FileCheck2, ArrowRight, AlertCircle, CheckCircle2, Clock, Eye, Zap } from "lucide-react";
import { Assignment, Lesson, Exam, SubmissionResult } from "../../types";

interface StudentDashboardProps {
  className: string;
  studentName: string;
  grade?: number;
  assignments: Assignment[];
  lessons: Lesson[];
  exams: Exam[];
  submissions: SubmissionResult[];
  isFirstLogin?: boolean;
  onSelectSection: (section: "LESSONS" | "HOMEWORK" | "EXAMS" | "GAME") => void;
}

export function StudentDashboard({
  className,
  studentName,
  grade,
  assignments,
  lessons,
  exams,
  submissions,
  isFirstLogin = false,
  onSelectSection,
}: StudentDashboardProps) {
  const classAssignments = assignments.filter((a) => a.className === className);
  const latestAssignment = classAssignments.length > 0 ? classAssignments[0] : null;

  const submittedLessonIds = new Set(submissions.map((s) => s.lessonId));
  const pendingHomeworkIds = latestAssignment
    ? latestAssignment.lessonIds.filter((id) => !submittedLessonIds.has(id))
    : [];
  const completedHomeworkIds = latestAssignment
    ? latestAssignment.lessonIds.filter((id) => submittedLessonIds.has(id))
    : [];
  const hasPendingHomework = pendingHomeworkIds.length > 0;

  const gradeNum = grade || 6;
  const totalLessons = lessons.filter((l) => (l.grade || 6) === gradeNum && !l.isHidden).length;
  const totalExams = exams.filter((e) => (e.grade || 6) === gradeNum).length;
  const completedLessons = submissions.filter((s) =>
    lessons.some((l) => l.id === s.lessonId && (l.grade || 6) === gradeNum)
  ).length;

  // ĐGNL visibility: first login OR teacher has assigned exams
  const hasExamAssignment = latestAssignment && latestAssignment.examIds && latestAssignment.examIds.length > 0;
  const showExamSection = isFirstLogin || hasExamAssignment;

  const sections = [
    {
      id: "HOMEWORK" as const,
      title: "Bài tập về nhà",
      subtitle: latestAssignment
        ? `${completedHomeworkIds.length}/${latestAssignment.lessonIds.length} bài đã hoàn thành`
        : "Chưa có bài tập",
      icon: ClipboardList,
      color: "from-amber-500 to-orange-600",
      badge: hasPendingHomework ? pendingHomeworkIds.length : 0,
      disabled: false,
      urgent: hasPendingHomework,
    },
    {
      id: "LESSONS" as const,
      title: "Bài giảng",
      subtitle: `${completedLessons}/${totalLessons} bài đã học`,
      icon: BookOpen,
      color: "from-sky-500 to-indigo-600",
      badge: 0,
      disabled: hasPendingHomework,
    },
    ...(showExamSection
      ? [
          {
            id: "EXAMS" as const,
            title: "Kiểm tra ĐGNL",
            subtitle: isFirstLogin && !hasExamAssignment
              ? "Đăng nhập lần đầu — khám phá ngay!"
              : `${totalExams} đề thi sẵn sàng`,
            icon: FileCheck2,
            color: "from-indigo-500 to-purple-600",
            badge: 0,
            disabled: hasPendingHomework,
          },
        ]
      : []),
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-emerald-100 text-sm font-medium">Lớp {className}</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Xin chào, {studentName}!
          </h1>
          <p className="text-sm text-emerald-100 mt-2">
            {hasPendingHomework
              ? "Bạn có bài tập cần hoàn thành. Hãy hoàn thành trước nhé!"
              : "Chọn nội dung bạn muốn học hôm nay."}
          </p>
        </div>
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -left-4 -bottom-8 w-24 h-24 bg-white/10 rounded-full blur-xl" />
      </div>

      {/* First login ĐGNL hint */}
      {isFirstLogin && !hasExamAssignment && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex items-start gap-3">
          <Eye className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-indigo-900">
              🎉 Chào mừng bạn lần đầu!
            </p>
            <p className="text-xs text-indigo-700 mt-1">
              Bạn có thể thử kiểm tra đánh giá năng lực (ĐGNL) ngay bây giờ để làm quen.
            </p>
          </div>
        </div>
      )}

      {/* Pending homework alert */}
      {hasPendingHomework && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-900">
              Bạn có {pendingHomeworkIds.length} bài tập chưa hoàn thành!
            </p>
            <p className="text-xs text-amber-700 mt-1">
              Hoàn thành bài tập giáo viên giao trước khi chuyển sang nội dung khác.
            </p>
          </div>
        </div>
      )}

      {/* No assignment info */}
      {!latestAssignment && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-slate-700">Chưa có bài tập được giao</p>
            <p className="text-xs text-slate-500 mt-1">
              Giáo viên chưa giao bài tập cho lớp {className}. Bạn có thể tự học bài giảng.
            </p>
          </div>
        </div>
      )}

      {/* Section Cards */}
      <div className="space-y-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => onSelectSection(section.id)}
              disabled={section.disabled}
              className={`w-full text-left rounded-2xl border-2 transition-all duration-200 p-5 sm:p-6 flex items-center gap-4 group ${
                section.disabled
                  ? "bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed"
                  : `bg-white border-slate-200 hover:shadow-lg hover:border-opacity-80 cursor-pointer`
              }`}
            >
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${section.color} flex items-center justify-center text-white shadow-md shrink-0 ${
                  !section.disabled ? "group-hover:scale-105" : ""
                } transition-transform`}
              >
                <Icon className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                    {section.title}
                  </h3>
                  {section.badge > 0 && (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold animate-pulse">
                      {section.badge}
                    </span>
                  )}
                  {section.urgent && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200">
                      <Clock className="w-3 h-3" />
                      Cần làm ngay
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 mt-0.5">{section.subtitle}</p>
                {section.disabled && (
                  <p className="text-xs text-red-500 mt-1 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Hoàn thành bài tập để mở khóa
                  </p>
                )}
              </div>
              {!section.disabled && (
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Game Mode Button */}
      {!hasPendingHomework && (
        <button onClick={() => onSelectSection("GAME")} className="w-full text-left rounded-2xl border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 hover:shadow-lg hover:border-purple-300 transition-all p-5 sm:p-6 flex items-center gap-4 group cursor-pointer">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-md shrink-0 group-hover:scale-105 transition-transform">
            <Zap className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-extrabold text-purple-900">🎮 Chế độ Game</h3>
            <p className="text-sm text-purple-600 mt-0.5">Chơi quiz từ lý thuyết đến bài giải, càng lên cao càng khó!</p>
          </div>
          <ArrowRight className="w-5 h-5 text-purple-300 group-hover:text-purple-600 group-hover:translate-x-1 transition-all shrink-0" />
        </button>
      )}

      {/* ĐGNL hidden hint */}
      {!showExamSection && (
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-4 text-center">
          <p className="text-xs text-slate-500">
            📋 Kiểm tra ĐGNL sẽ xuất hiện khi giáo viên giao bài kiểm tra cho lớp bạn.
          </p>
        </div>
      )}
    </div>
  );
}
