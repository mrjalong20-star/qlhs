import { useEffect } from "react";
import confetti from "canvas-confetti";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  BookOpen,
  Calendar,
  Hash,
  HelpCircle,
  Table as TableIcon,
  ChevronDown,
  Sparkles,
  Award,
} from "lucide-react";
import { SubmissionResult, Question, Lesson } from "../../types";
import { GeoChartRenderer } from "../common/GeoChartRenderer";

interface QuizResultViewProps {
  result: SubmissionResult;
  lesson?: Lesson;
  questions: Question[];
  onRetake: () => void;
  onBackToLessons: () => void;
  onGoToMyResults: () => void;
}

export function QuizResultView({
  result,
  lesson,
  questions,
  onRetake,
  onBackToLessons,
  onGoToMyResults,
}: QuizResultViewProps) {
  useEffect(() => {
    if (result.totalScore >= 8.0) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [result.totalScore]);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m} phút ${s < 10 ? "0" + s : s} giây`;
  };

  const getScoreColorClass = (score: number) => {
    if (score >= 8.0) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 6.5) return "text-sky-600 bg-sky-50 border-sky-200";
    if (score >= 5.0) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-rose-600 bg-rose-50 border-rose-200";
  };

  return (
    <div id="quiz-result-view" className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Banner Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 text-center space-y-6">
        <div className="space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-sky-500/20">
            <Trophy className="w-9 h-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            HOÀN THÀNH BÀI LUYỆN TẬP
          </h1>
          <p className="text-sm font-semibold text-slate-600">
            {result.lessonTitle}
          </p>
          <p className="text-xs text-slate-400 font-mono">
            Mã lượt làm: {result.attemptId} • Lần làm thứ {result.attemptNumber}
          </p>
        </div>

        {/* Big Total Score Badge */}
        <div className="max-w-xs mx-auto">
          <div
            className={`p-6 rounded-3xl border-2 flex flex-col items-center justify-center ${getScoreColorClass(
              result.totalScore
            )}`}
          >
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1">
              Điểm số tổng kết
            </span>
            <div className="text-5xl sm:text-6xl font-black tracking-tight">
              {result.totalScore.toFixed(2)}
              <span className="text-2xl font-bold text-slate-400">/10</span>
            </div>
            <span className="text-xs font-semibold mt-2">
              {result.totalScore >= 8.5
                ? "🌟 Xuất sắc! Nắm rất vững kiến thức"
                : result.totalScore >= 6.5
                ? "👍 Khá tốt! Cần luyện thêm một số câu khó"
                : "💡 Cần ôn tập kĩ lại lý thuyết và công thức"}
            </span>
          </div>
        </div>

        {/* 3 Parts Score Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-sky-50/70 border border-sky-100 p-4 rounded-2xl text-center">
            <span className="block text-[11px] font-bold text-sky-700 uppercase tracking-wider">
              Phần I: Nhiều lựa chọn
            </span>
            <span className="text-xl font-black text-sky-950 mt-1 block">
              {result.part1Score.toFixed(2)} đ
            </span>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-100 p-4 rounded-2xl text-center">
            <span className="block text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
              Phần II: Đúng / Sai
            </span>
            <span className="text-xl font-black text-emerald-950 mt-1 block">
              {result.part2Score.toFixed(2)} đ
            </span>
          </div>

          <div className="bg-indigo-50/70 border border-indigo-100 p-4 rounded-2xl text-center">
            <span className="block text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
              Phần III: Trả lời ngắn
            </span>
            <span className="text-xl font-black text-indigo-950 mt-1 block">
              {result.part3Score.toFixed(2)} đ
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <div className="text-left">
              <span className="text-slate-400 block text-[10px]">Số câu đúng</span>
              <span className="font-bold text-slate-800">
                {result.correctQuestionsCount}/{result.totalQuestionsCount}
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2.5">
            <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <div className="text-left">
              <span className="text-slate-400 block text-[10px]">Số câu sai / bỏ</span>
              <span className="font-bold text-slate-800">
                {result.wrongQuestionsCount + result.unansweredCount} câu
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-sky-500 shrink-0" />
            <div className="text-left">
              <span className="text-slate-400 block text-[10px]">Thời gian làm</span>
              <span className="font-bold text-slate-800">
                {formatDuration(result.timeSpentSeconds)}
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
            <div className="text-left">
              <span className="text-slate-400 block text-[10px]">Thời gian nộp</span>
              <span className="font-bold text-slate-800 truncate">
                {new Date(result.submittedAt).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-100">
          <button
            id="btn-result-retake"
            onClick={onRetake}
            className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>LUYỆN TẬP LẠI</span>
          </button>

          <button
            id="btn-result-back-lessons"
            onClick={onBackToLessons}
            className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <BookOpen className="w-4 h-4" />
            <span>DANH SÁCH BÀI HỌC</span>
          </button>

          <button
            id="btn-result-my-results"
            onClick={onGoToMyResults}
            className="px-6 py-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Award className="w-4 h-4 text-amber-600" />
            <span>KẾT QUẢ CỦA EM</span>
          </button>
        </div>
      </div>

      {/* Detailed Review Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-sky-600" />
            <span>Xem Lại Chi Tiết Từng Câu Hỏi & Đáp Án</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Xem đối chiếu đáp án của bạn và đáp án chuẩn kèm hướng dẫn giải chi tiết.
          </p>
        </div>

        <div className="space-y-6">
          {result.details.map((detail, idx) => {
            const question = questions.find((q) => q.id === detail.questionId);
            if (!question) return null;

            return (
              <div
                key={detail.questionId}
                className={`p-5 rounded-2xl border transition-all ${
                  detail.isCorrect
                    ? "bg-emerald-50/40 border-emerald-200"
                    : "bg-rose-50/40 border-rose-200"
                }`}
              >
                {/* Header row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center ${
                        detail.isCorrect
                          ? "bg-emerald-600 text-white"
                          : "bg-rose-600 text-white"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {detail.part === "PART_1" && "Phần I: Nhiều lựa chọn"}
                      {detail.part === "PART_2" && "Phần II: Đúng / Sai"}
                      {detail.part === "PART_3" && "Phần III: Trả lời ngắn"}
                    </span>
                  </div>

                  <span
                    className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                      detail.isCorrect
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {detail.isCorrect ? "Chính xác (+đầy đủ)" : `Đạt ${detail.earnedScore.toFixed(2)} đ`}
                  </span>
                </div>

                {/* Question text */}
                <p className="text-sm font-bold text-slate-900 mb-3">
                  {question.questionText}
                </p>

                {/* Geography Chart if present */}
                {question.chart && (
                  <GeoChartRenderer chart={question.chart} className="my-3 bg-white" />
                )}

                {/* Image if present */}
                {question.imageUrl && (
                  <div className="my-3 rounded-xl overflow-hidden border border-slate-200 max-w-md mx-auto">
                    <img
                      src={question.imageUrl}
                      alt="Hình ảnh câu hỏi"
                      className="w-full h-auto object-contain max-h-[260px]"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {/* Table if present */}
                {question.dataTable && question.dataTable.length > 0 && (
                  <div className="my-3 overflow-x-auto rounded-xl border border-slate-200 bg-white">
                    <table className="min-w-full text-xs text-left divide-y divide-slate-200">
                      <thead className="bg-slate-50 font-bold">
                        <tr>
                          {question.dataTable[0].map((h, i) => (
                            <th key={i} className="px-3 py-1.5 text-center">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {question.dataTable.slice(1).map((r, ri) => (
                          <tr key={ri}>
                            {r.map((c, ci) => (
                              <td key={ci} className="px-3 py-1 text-center font-mono">{c}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Detail for Part 1 */}
                {detail.part === "PART_1" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs my-2">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Đáp án của bạn:</span>
                      <span className="font-bold text-slate-800">{detail.studentAnswerDisplay}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                      <span className="text-emerald-600 block text-[10px]">Đáp án chuẩn:</span>
                      <span className="font-bold text-emerald-900">{detail.correctAnswerDisplay}</span>
                    </div>
                  </div>
                )}

                {/* Detail for Part 2 */}
                {detail.part === "PART_2" && detail.part2Details && (
                  <div className="space-y-1.5 my-2">
                    {question.subAnswers?.map((sub) => {
                      const subKey = sub.id as "a" | "b" | "c" | "d";
                      const itemDet = detail.part2Details?.[subKey];
                      return (
                        <div
                          key={sub.id}
                          className="text-xs p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2"
                        >
                          <span className="font-medium text-slate-800 flex-1">
                            <strong>{sub.id})</strong> {sub.statement}
                          </span>
                          <div className="flex items-center gap-2 shrink-0 font-bold">
                            <span className={itemDet?.isCorrect ? "text-emerald-600" : "text-rose-600"}>
                              Bạn chọn: {itemDet?.student === undefined ? "Bỏ trống" : itemDet.student ? "Đúng" : "Sai"}
                            </span>
                            <span className="text-slate-400">|</span>
                            <span className="text-slate-700">
                              Đáp án: {sub.correctAnswer ? "Đúng" : "Sai"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Detail for Part 3 */}
                {detail.part === "PART_3" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs my-2">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Đáp án của bạn:</span>
                      <span className="font-bold text-slate-800">{detail.studentAnswerDisplay}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                      <span className="text-emerald-600 block text-[10px]">Đáp án chuẩn:</span>
                      <span className="font-bold text-emerald-900">{detail.correctAnswerDisplay}</span>
                    </div>
                  </div>
                )}

                {/* Explanation / Formula */}
                {detail.explanation && (
                  <div className="mt-3 p-3 bg-sky-50/80 border border-sky-100 rounded-xl text-xs text-sky-950 leading-relaxed">
                    <strong className="text-sky-800 block mb-0.5">💡 Hướng dẫn & Giải thích:</strong>
                    <span>{detail.explanation}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
