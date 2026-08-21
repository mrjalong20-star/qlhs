import { BookOpen, ClipboardList, FileCheck2, ArrowRight } from "lucide-react";
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
  const hasPendingHomework = pendingHomeworkIds.length > 0;

  const completedLessons = submissions.length;

  const sections = [
    {
      id: "HOMEWORK" as const,
      title: "Bài tập về nhà",
      subtitle: latestAssignment
        ? `${latestAssignment.lessonIds.length - pendingHomeworkIds.length}/${latestAssignment.lessonIds.length} đã hoàn thành`
        : "Chưa có bài tập",
      icon: ClipboardList,
      color: "bg-amber-500",
      badge: pendingHomeworkIds.length,
      disabled: false,
    },
    {
      id: "LESSONS" as const,
      title: "Bài giảng",
      subtitle: lessons.length > 0
        ? `${completedLessons} bài đã làm`
        : "Chưa có bài giảng",
      icon: BookOpen,
      color: "bg-blue-500",
      badge: 0,
      disabled: hasPendingHomework,
    },
    {
      id: "EXAMS" as const,
      title: "Kiểm tra ĐGNL",
      subtitle: exams.length > 0 ? `${exams.length} đề thi` : "Chưa có đề thi",
      icon: FileCheck2,
      color: "bg-indigo-500",
      badge: 0,
      disabled: hasPendingHomework,
    },
  ];

  return (
    <div className="max-w-lg mx-auto space-y-4 pt-6">
      {/* Welcome */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-extrabold text-slate-900">
          Xin chào, {studentName}
        </h1>
        <p className="text-sm text-slate-400 mt-1">Lớp {className}</p>
      </div>

      {/* Sections */}
      {sections.map((section) => {
        const Icon = section.icon;
        return (
          <button
            key={section.id}
            onClick={() => onSelectSection(section.id)}
            disabled={section.disabled}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
              section.disabled
                ? "border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed"
                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md cursor-pointer"
            }`}
          >
            <div className={`w-11 h-11 rounded-xl ${section.color} text-white flex items-center justify-center shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{section.title}</span>
                {section.badge > 0 && (
                  <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                    {section.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{section.subtitle}</p>
            </div>
            {!section.disabled && (
              <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
            )}
          </button>
        );
      })}
    </div>
  );
}
