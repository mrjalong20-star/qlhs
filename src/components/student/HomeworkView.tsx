import { ClipboardList, Play, CheckCircle2, Clock, ArrowLeft, BookOpen } from "lucide-react";
import { Assignment, Lesson, Question, SubmissionResult } from "../../types";

interface HomeworkViewProps {
  assignment: Assignment | null;
  lessons: Lesson[];
  questions: Question[];
  submissions: SubmissionResult[];
  onStartLesson: (lesson: Lesson) => void;
  onBack: () => void;
}

export function HomeworkView({
  assignment,
  lessons,
  questions,
  submissions,
  onStartLesson,
  onBack,
}: HomeworkViewProps) {
  const submittedLessonIds = new Set(submissions.map((s) => s.lessonId));

  const assignedLessons = assignment
    ? assignment.lessonIds
        .map((id) => lessons.find((l) => l.id === id))
        .filter((l): l is Lesson => Boolean(l))
    : [];

  const pendingLessons = assignedLessons.filter((l) => !submittedLessonIds.has(l.id));
  const completedLessons = assignedLessons.filter((l) => submittedLessonIds.has(l.id));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Bài tập về nhà</h1>
          {assignment && (
            <p className="text-xs text-slate-500 mt-0.5">
              {assignment.teacherName && `Giáo viên: ${assignment.teacherName} • `}
              {completedLessons.length}/{assignedLessons.length} bài hoàn thành
            </p>
          )}
        </div>
      </div>

      {/* No assignment */}
      {!assignment && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Chưa có bài tập được giao</h3>
          <p className="text-xs text-slate-400 mt-1">
            Giáo viên sẽ giao bài tập qua hệ thống. Hãy quay lại sau.
          </p>
        </div>
      )}

      {/* Progress bar */}
      {assignment && assignedLessons.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600">Tiến độ</span>
            <span className="text-xs font-bold text-emerald-600">
              {completedLessons.length}/{assignedLessons.length}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${assignedLessons.length ? (completedLessons.length / assignedLessons.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Pending lessons */}
      {pendingLessons.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-amber-700 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Chưa hoàn thành ({pendingLessons.length})
          </h2>
          <div className="space-y-3">
            {pendingLessons.map((lesson) => {
              const lessonQuestions = questions.filter((q) => q.lessonId === lesson.id);
              return (
                <div
                  key={lesson.id}
                  className="bg-white rounded-2xl border-2 border-amber-200 p-5 flex items-center gap-4 hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-black text-sm shrink-0">
                    {lesson.lessonNumber || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      Bài {lesson.lessonNumber}: {lesson.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {lesson.chapter} • {lessonQuestions.length} câu hỏi
                      {lesson.durationMinutes && ` • ${lesson.durationMinutes} phút`}
                    </p>
                  </div>
                  <button
                    onClick={() => onStartLesson(lesson)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    LÀM BÀI
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed lessons */}
      {completedLessons.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-emerald-700 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Đã hoàn thành ({completedLessons.length})
          </h2>
          <div className="space-y-2">
            {completedLessons.map((lesson) => {
              const submission = submissions.find((s) => s.lessonId === lesson.id);
              return (
                <div
                  key={lesson.id}
                  className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 flex items-center gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-emerald-900 truncate">
                      Bài {lesson.lessonNumber}: {lesson.title}
                    </h3>
                    {submission && (
                      <p className="text-xs text-emerald-600 mt-0.5">
                        Điểm: {submission.totalScore.toFixed(1)}/{submission.maxScore.toFixed(1)}
                      </p>
                    )}
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
                    Xong
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All done */}
      {assignment && assignedLessons.length > 0 && pendingLessons.length === 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <p className="text-sm font-bold text-emerald-800">
            🎉 Bạn đã hoàn thành tất cả bài tập!
          </p>
          <p className="text-xs text-emerald-600 mt-1">
            Giờ bạn có thể chuyển sang học bài giảng hoặc làm bài kiểm tra.
          </p>
        </div>
      )}
    </div>
  );
}
