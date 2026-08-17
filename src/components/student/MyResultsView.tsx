import { useMemo } from "react";
import {
  Trophy,
  Award,
  Clock,
  BookOpen,
  Calendar,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { Lesson, SubmissionResult, StudentProfile } from "../../types";

interface MyResultsViewProps {
  student: StudentProfile | null;
  lessons: Lesson[];
  submissions: SubmissionResult[];
  onRetakeLesson: (lesson: Lesson) => void;
  onOpenStudentModal: () => void;
}

export function MyResultsView({
  student,
  lessons,
  submissions,
  onRetakeLesson,
  onOpenStudentModal,
}: MyResultsViewProps) {
  // Aggregate stats
  const stats = useMemo(() => {
    if (!submissions.length) {
      return {
        completedCount: 0,
        averageScore: 0,
        highestScore: 0,
        totalTimeMinutes: 0,
      };
    }

    const uniqueLessonIds = new Set(submissions.map((s) => s.lessonId));
    const totalScoreSum = submissions.reduce((sum, s) => sum + s.totalScore, 0);
    const avg = totalScoreSum / submissions.length;
    const highest = submissions.reduce((max, s) => Math.max(max, s.totalScore), 0);
    const totalSecs = submissions.reduce((sum, s) => sum + s.timeSpentSeconds, 0);

    return {
      completedCount: uniqueLessonIds.size,
      averageScore: Math.round(avg * 100) / 100,
      highestScore: highest,
      totalTimeMinutes: Math.round(totalSecs / 60),
    };
  }, [submissions]);

  // Group by lesson
  const lessonResults = useMemo(() => {
    const map = new Map<string, SubmissionResult[]>();
    for (const sub of submissions) {
      const current = map.get(sub.lessonId) || [];
      current.push(sub);
      map.set(sub.lessonId, current);
    }
    return map;
  }, [submissions]);

  return (
    <div id="my-results-view" className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-700 via-indigo-700 to-purple-800 rounded-3xl p-6 sm:p-8 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-2">
              <Trophy className="w-3.5 h-3.5 text-amber-300" />
              <span>Hồ Sơ Năng Lực Học Tập</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {student ? `Kết Quả Của ${student.studentName}` : "Kết Quả Học Tập"}
            </h1>
            <p className="text-xs sm:text-sm text-sky-100 mt-1">
              {student ? `Lớp ${student.className} • ` : ""}Lịch sử làm bài và quá trình tiến bộ môn Toán 11
            </p>
          </div>

          {!student && (
            <button
              onClick={onOpenStudentModal}
              className="px-5 py-2.5 bg-white text-sky-800 rounded-xl font-bold text-xs shadow-md hover:bg-sky-50 cursor-pointer"
            >
              Nhập thông tin học sinh
            </button>
          )}
        </div>

        {/* 4 Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/15 text-white">
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
            <span className="block text-[11px] text-sky-200 font-medium">Số bài đã luyện</span>
            <span className="text-2xl font-black mt-0.5 block">
              {stats.completedCount} <span className="text-xs font-normal text-sky-200">/ {lessons.length} bài</span>
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
            <span className="block text-[11px] text-sky-200 font-medium">Điểm trung bình</span>
            <span className="text-2xl font-black mt-0.5 block text-amber-300">
              {stats.averageScore.toFixed(2)}
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
            <span className="block text-[11px] text-sky-200 font-medium">Điểm cao nhất</span>
            <span className="text-2xl font-black mt-0.5 block text-emerald-300">
              {stats.highestScore.toFixed(2)}
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
            <span className="block text-[11px] text-sky-200 font-medium">Tổng lượt làm bài</span>
            <span className="text-2xl font-black mt-0.5 block">
              {submissions.length} <span className="text-xs font-normal text-sky-200">lượt</span>
            </span>
          </div>
        </div>
      </div>

      {/* Submissions Table / List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-sky-600" />
          <span>Danh Sách Các Bài Đã Hoàn Thành</span>
        </h2>

        {submissions.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full text-xs text-left divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Bài học</th>
                  <th className="px-4 py-3 text-center">Điểm số</th>
                  <th className="px-4 py-3 text-center">Đúng/Sai</th>
                  <th className="px-4 py-3 text-center">Thời gian</th>
                  <th className="px-4 py-3 text-center">Ngày nộp</th>
                  <th className="px-4 py-3 text-center">Mã lượt</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {submissions.map((sub, idx) => {
                  const lesson = lessons.find((l) => l.id === sub.lessonId);
                  const isHighScore = sub.totalScore >= 8.0;

                  return (
                    <tr key={sub.attemptId || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-900 text-sm">
                          {sub.lessonTitle}
                        </p>
                        <span className="text-[11px] text-slate-400">
                          Học sinh: {sub.studentName} ({sub.className})
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full font-black text-sm ${
                            isHighScore
                              ? "bg-emerald-100 text-emerald-800"
                              : sub.totalScore >= 6.5
                              ? "bg-sky-100 text-sky-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {sub.totalScore.toFixed(2)}/10
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center font-medium text-slate-700">
                        <span className="text-emerald-600 font-bold">{sub.correctQuestionsCount} đúng</span> /{" "}
                        <span className="text-rose-600 font-bold">{sub.wrongQuestionsCount + sub.unansweredCount} sai</span>
                      </td>

                      <td className="px-4 py-3.5 text-center text-slate-600 font-mono">
                        {Math.floor(sub.timeSpentSeconds / 60)}p {sub.timeSpentSeconds % 60}s
                      </td>

                      <td className="px-4 py-3.5 text-center text-slate-500">
                        {new Date(sub.submittedAt).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      <td className="px-4 py-3.5 text-center font-mono text-[11px] text-slate-400">
                        {sub.attemptId}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        {lesson && (
                          <button
                            onClick={() => onRetakeLesson(lesson)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold text-xs cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Làm lại</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">Chưa có bài luyện tập nào được ghi nhận</p>
            <p className="text-xs text-slate-400 mt-1">
              Hãy chọn một bài học trong mục "Hệ thống bài học" để bắt đầu luyện tập!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
