import { BookOpen, CheckCircle2, Clock, Lock, Play, RotateCcw, Award } from "lucide-react";
import { Lesson, Question, SubmissionResult } from "../../types";

interface LessonCardProps {
  key?: string | number;
  lesson: Lesson;
  questions: Question[];
  submissions: SubmissionResult[];
  hasDraft: boolean;
  onStartLesson: (lesson: Lesson, isRetake?: boolean) => void;
}

export function LessonCard({
  lesson,
  questions,
  submissions,
  hasDraft,
  onStartLesson,
}: LessonCardProps) {
  const p1Count = questions.filter((q) => q.part === "PART_1").length;
  const p2Count = questions.filter((q) => q.part === "PART_2").length;
  const p3Count = questions.filter((q) => q.part === "PART_3").length;
  const totalQuestions = questions.length;

  const lessonSubmissions = submissions.filter((s) => s.lessonId === lesson.id);
  const bestScore = lessonSubmissions.reduce(
    (max, s) => (s.totalScore > max ? s.totalScore : max),
    -1
  );
  const latestSubmission = lessonSubmissions[0];

  let status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" = "NOT_STARTED";
  if (lessonSubmissions.length > 0) {
    status = "COMPLETED";
  } else if (hasDraft) {
    status = "IN_PROGRESS";
  }

  const isLocked = lesson.isLocked;

  return (
    <div
      id={`lesson-card-${lesson.id}`}
      className={`group relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
        isLocked
          ? "border-slate-200 bg-slate-50/70 opacity-80"
          : status === "COMPLETED"
          ? "border-emerald-200 hover:border-emerald-400 hover:shadow-md"
          : status === "IN_PROGRESS"
          ? "border-amber-200 hover:border-amber-400 hover:shadow-md"
          : "border-slate-200 hover:border-sky-400 hover:shadow-md"
      }`}
    >
      {/* Top Bar Status Badge */}
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
            Bài {lesson.lessonNumber < 10 ? `0${lesson.lessonNumber}` : lesson.lessonNumber}
          </span>

          {isLocked ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
              <Lock className="w-3 h-3" />
              Đã khóa
            </span>
          ) : status === "COMPLETED" ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Đã hoàn thành
            </span>
          ) : status === "IN_PROGRESS" ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
              <Clock className="w-3.5 h-3.5" />
              Đang làm dở
            </span>
          ) : (
            <span className="text-[11px] font-medium text-slate-400">
              Chưa làm
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-sky-700 transition-colors line-clamp-2 min-h-[44px]">
          {lesson.title}
        </h3>
        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
          {lesson.chapter}
        </p>
      </div>

      {/* Stats Breakdown */}
      <div className="px-5 py-3 border-t border-b border-slate-100 bg-slate-50/50">
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-white p-2 rounded-lg border border-slate-100">
            <span className="block text-[10px] text-slate-400 font-semibold uppercase">Phần I</span>
            <span className="font-bold text-sky-700 text-sm">{p1Count}</span>
            <span className="text-[10px] text-slate-500"> câu</span>
          </div>

          <div className="bg-white p-2 rounded-lg border border-slate-100">
            <span className="block text-[10px] text-slate-400 font-semibold uppercase">Phần II</span>
            <span className="font-bold text-emerald-700 text-sm">{p2Count}</span>
            <span className="text-[10px] text-slate-500"> câu</span>
          </div>

          <div className="bg-white p-2 rounded-lg border border-slate-100">
            <span className="block text-[10px] text-slate-400 font-semibold uppercase">Phần III</span>
            <span className="font-bold text-indigo-700 text-sm">{p3Count}</span>
            <span className="text-[10px] text-slate-500"> câu</span>
          </div>
        </div>

        {/* Score & Last Attempt Info if completed */}
        {status === "COMPLETED" && (
          <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-emerald-700">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Điểm cao nhất: {bestScore.toFixed(2)}/10</span>
            </div>
            <span className="text-[11px] text-slate-400">
              Lần làm: {lessonSubmissions.length}
            </span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-4 bg-white">
        {isLocked ? (
          <button
            disabled
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 text-slate-400 font-semibold text-xs flex items-center justify-center gap-2 cursor-not-allowed"
          >
            <Lock className="w-4 h-4" />
            <span>Giáo viên đang khóa bài</span>
          </button>
        ) : status === "IN_PROGRESS" ? (
          <button
            id={`btn-resume-lesson-${lesson.id}`}
            onClick={() => onStartLesson(lesson, false)}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            <span>TIẾP TỤC LÀM BÀI</span>
          </button>
        ) : status === "COMPLETED" ? (
          <button
            id={`btn-retake-lesson-${lesson.id}`}
            onClick={() => onStartLesson(lesson, true)}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 font-bold text-xs border border-slate-200 hover:border-sky-300 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>LUYỆN TẬP LẠI</span>
          </button>
        ) : (
          <button
            id={`btn-start-lesson-${lesson.id}`}
            onClick={() => onStartLesson(lesson, false)}
            className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-bold text-xs shadow-xs shadow-sky-500/20 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>BẮT ĐẦU LUYỆN TẬP</span>
          </button>
        )}
      </div>
    </div>
  );
}
