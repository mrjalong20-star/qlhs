import { useState } from "react";
import { BookOpen, ChevronDown, ChevronRight, Lock, CheckCircle2, Play } from "lucide-react";
import { Lesson, Question, SubmissionResult, StudentProfile } from "../../types";

interface LessonListViewProps {
  lessons: Lesson[];
  questions: Question[];
  submissions: SubmissionResult[];
  student: StudentProfile;
  onStartLesson: (lesson: Lesson, retake?: boolean) => void;
  onOpenStudentModal: () => void;
}

export function LessonListView({ lessons, questions, submissions, student, onStartLesson }: LessonListViewProps) {
  const [expandedGrade, setExpandedGrade] = useState<number | null>(null);

  // Filter unlocked lessons
  const unlockedLessons = lessons.filter((l) => !l.isLocked);
  const submittedIds = new Set(submissions.map((s) => s.lessonId));

  // Group by grade
  const gradeMap = new Map<number, Lesson[]>();
  unlockedLessons.forEach((l) => {
    const g = l.grade || 6;
    if (!gradeMap.has(g)) gradeMap.set(g, []);
    gradeMap.get(g)!.push(l);
  });

  const gradeLabels: Record<number, string> = {
    6: "Lớp 6", 7: "Lớp 7", 8: "Lớp 8", 9: "Lớp 9",
    10: "Lớp 10", 11: "Lớp 11", 12: "Lớp 12",
  };

  const gradeColors: Record<number, string> = {
    6: "bg-emerald-500", 7: "bg-teal-500", 8: "bg-cyan-500",
    9: "bg-sky-500", 10: "bg-blue-500", 11: "bg-indigo-500", 12: "bg-purple-500",
  };

  if (unlockedLessons.length === 0) {
    return (
      <div className="text-center py-16">
        <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-500">Chưa có bài giảng</p>
        <p className="text-xs text-slate-400 mt-1">Giáo viên sẽ mở bài giảng khi đến lúc học</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-3">
      <h2 className="text-base font-extrabold text-slate-900 mb-4">Bài giảng</h2>

      {Array.from(gradeMap.entries()).map(([grade, lessons]) => {
        const completed = lessons.filter((l) => submittedIds.has(l.id)).length;
        const isExpanded = expandedGrade === grade;

        return (
          <div key={grade} className="rounded-xl border border-slate-200 overflow-hidden">
            <button
              onClick={() => setExpandedGrade(isExpanded ? null : grade)}
              className="w-full flex items-center gap-3 p-3 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className={`w-9 h-9 rounded-lg ${gradeColors[grade]} text-white flex items-center justify-center text-xs font-bold shrink-0`}>
                {grade}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold text-slate-900">{gradeLabels[grade]}</p>
                <p className="text-xs text-slate-400">{completed}/{lessons.length} bài</p>
              </div>
              {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
            </button>

            {isExpanded && (
              <div className="border-t border-slate-100 bg-slate-50">
                {lessons.map((lesson) => {
                  const done = submittedIds.has(lesson.id);
                  const hasQuestions = questions.some((q) => q.lessonId === lesson.id);

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => onStartLesson(lesson, done)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white transition-colors border-b border-slate-100 last:border-b-0 cursor-pointer"
                    >
                      {done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                      )}
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm text-slate-900 truncate">{lesson.title}</p>
                        {lesson.chapter && <p className="text-xs text-slate-400 truncate">{lesson.chapter}</p>}
                      </div>
                      {!hasQuestions ? (
                        <Lock className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                      ) : (
                        <Play className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
