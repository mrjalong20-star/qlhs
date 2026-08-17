import { useState, useEffect, useMemo, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Clock,
  HelpCircle,
  ListOrdered,
  AlertTriangle,
  Send,
  Table as TableIcon,
  ChevronLeft,
  ChevronRight,
  Info,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import {
  Lesson,
  Question,
  StudentAnswers,
  StudentProfile,
  SubmissionPayload,
  SubmissionResult,
  AppConfig,
} from "../../types";
import { generateAttemptId } from "../../services/scoringService";
import { storageService, ActiveAttemptDraft } from "../../services/storageService";
import { apiService } from "../../services/apiService";
import { GeoChartRenderer } from "../common/GeoChartRenderer";

interface QuizRunnerProps {
  key?: string | number;
  lesson: Lesson;
  questions: Question[];
  student: StudentProfile;
  config: AppConfig;
  isRetake?: boolean;
  onFinishQuiz: (result: SubmissionResult) => void;
  onCancelQuiz: () => void;
}

export function QuizRunner({
  lesson,
  questions,
  student,
  config,
  isRetake = false,
  onFinishQuiz,
  onCancelQuiz,
}: QuizRunnerProps) {
  // Sort questions: Part 1 -> Part 2 -> Part 3
  const sortedQuestions = useMemo(() => {
    const p1 = questions.filter((q) => q.part === "PART_1");
    const p2 = questions.filter((q) => q.part === "PART_2");
    const p3 = questions.filter((q) => q.part === "PART_3");
    return [...p1, ...p2, ...p3];
  }, [questions]);

  // Attempt ID and state initialization
  const [attemptId, setAttemptId] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<StudentAnswers>({});
  const [flaggedIds, setFlaggedIds] = useState<string[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [startedAt, setStartedAt] = useState<string>("");

  const [showNavigatorDrawer, setShowNavigatorDrawer] = useState<boolean>(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string>("");

  // Restore draft or create new attempt
  useEffect(() => {
    if (isRetake) {
      storageService.clearActiveDraft(lesson.id);
      const newAttempt = generateAttemptId(student.className, lesson.id);
      const nowIso = new Date().toISOString();
      setAttemptId(newAttempt);
      setAnswers({});
      setFlaggedIds([]);
      setCurrentIndex(0);
      setStartedAt(nowIso);
      setElapsedSeconds(0);
      return;
    }

    const draft = storageService.getActiveDraft(lesson.id);
    if (draft && draft.studentName === student.studentName && draft.className === student.className) {
      setAttemptId(draft.attemptId);
      setAnswers(draft.answers || {});
      setFlaggedIds(draft.flaggedQuestionIds || []);
      setCurrentIndex(draft.currentQuestionIndex || 0);
      setStartedAt(draft.startedAt || new Date().toISOString());
      setElapsedSeconds(draft.elapsedSeconds || 0);
    } else {
      const newAttempt = generateAttemptId(student.className, lesson.id);
      const nowIso = new Date().toISOString();
      setAttemptId(newAttempt);
      setAnswers({});
      setFlaggedIds([]);
      setCurrentIndex(0);
      setStartedAt(nowIso);
      setElapsedSeconds(0);
    }
  }, [lesson.id, student.studentName, student.className, isRetake]);

  // Timer interval
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Periodic draft auto-saver (every answer change or 2 seconds)
  useEffect(() => {
    if (!attemptId) return;
    const draft: ActiveAttemptDraft = {
      attemptId,
      studentName: student.studentName,
      className: student.className,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      semester: lesson.semester,
      answers,
      flaggedQuestionIds: flaggedIds,
      currentQuestionIndex: currentIndex,
      startedAt,
      elapsedSeconds,
    };
    storageService.saveActiveDraft(lesson.id, draft);
  }, [attemptId, answers, flaggedIds, currentIndex, elapsedSeconds, lesson, student, startedAt]);

  const currentQuestion = sortedQuestions[currentIndex];

  // Calculate completion progress
  const progressStats = useMemo(() => {
    let answeredCount = 0;
    for (const q of sortedQuestions) {
      const userAns = answers[q.id];
      if (!userAns) continue;

      if (q.part === "PART_1" && userAns.part1Answer) {
        answeredCount++;
      } else if (q.part === "PART_2" && userAns.part2Answers) {
        const subCount = Object.keys(userAns.part2Answers).length;
        if (subCount > 0) answeredCount++;
      } else if (q.part === "PART_3" && userAns.part3Answer && userAns.part3Answer.trim().length > 0) {
        answeredCount++;
      }
    }
    const total = sortedQuestions.length;
    const percent = total > 0 ? Math.round((answeredCount / total) * 100) : 0;
    const unansweredCount = total - answeredCount;
    return { answeredCount, total, percent, unansweredCount };
  }, [answers, sortedQuestions]);

  // Handle answers
  const handleSelectPart1 = (option: "A" | "B" | "C" | "D") => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        part1Answer: option,
      },
    }));
  };

  const handleSelectPart2Sub = (subId: "a" | "b" | "c" | "d", val: boolean) => {
    if (!currentQuestion) return;
    setAnswers((prev) => {
      const currentSub = prev[currentQuestion.id]?.part2Answers || {};
      return {
        ...prev,
        [currentQuestion.id]: {
          ...prev[currentQuestion.id],
          part2Answers: {
            ...currentSub,
            [subId]: val,
          },
        },
      };
    });
  };

  const handleInputPart3 = (text: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        part3Answer: text,
      },
    }));
  };

  const toggleFlagCurrent = () => {
    if (!currentQuestion) return;
    setFlaggedIds((prev) =>
      prev.includes(currentQuestion.id)
        ? prev.filter((id) => id !== currentQuestion.id)
        : [...prev, currentQuestion.id]
    );
  };

  // Submit Handler
  const handleFinalSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmissionError("");

    const payload: SubmissionPayload = {
      attemptId,
      studentName: student.studentName,
      className: student.className,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      semester: lesson.semester,
      answers,
      timeSpentSeconds: elapsedSeconds,
      startedAt,
      submittedAt: new Date().toISOString(),
      flaggedQuestionIds: flaggedIds,
    };

    try {
      const response = await apiService.submitQuiz(
        payload,
        sortedQuestions,
        config,
        lesson.scoringConfig,
        lesson.totalPoints
      );
      if (response.success && response.data) {
        // Clear active draft for this lesson so it never leaves old answers
        storageService.clearActiveDraft(lesson.id);
        onFinishQuiz(response.data);
      } else {
        setSubmissionError(response.message || "Không thể nộp bài. Vui lòng thử lại.");
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setSubmissionError(err.message || "Lỗi nộp bài.");
      setIsSubmitting(false);
    }
  };

  // Reset/Restart attempt cleanly
  const handleResetCurrentAttempt = () => {
    storageService.clearActiveDraft(lesson.id);
    const newAttempt = generateAttemptId(student.className, lesson.id);
    const nowIso = new Date().toISOString();
    setAttemptId(newAttempt);
    setAnswers({});
    setFlaggedIds([]);
    setCurrentIndex(0);
    setStartedAt(nowIso);
    setElapsedSeconds(0);
    setShowResetConfirm(false);
  };

  // Format Elapsed Seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}`;
  };

  // Check if a question is answered
  const isQuestionAnswered = (q: Question) => {
    const userAns = answers[q.id];
    if (!userAns) return false;
    if (q.part === "PART_1") return Boolean(userAns.part1Answer);
    if (q.part === "PART_2") {
      const subs = userAns.part2Answers || {};
      return Object.keys(subs).length === (q.subAnswers?.length || 4);
    }
    if (q.part === "PART_3") return Boolean(userAns.part3Answer && userAns.part3Answer.trim().length > 0);
    return false;
  };

  if (!currentQuestion) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
        <p className="text-slate-600">Đang tải câu hỏi bài học...</p>
      </div>
    );
  }

  const isCurrentFlagged = flaggedIds.includes(currentQuestion.id);

  return (
    <div id="quiz-runner-container" className="max-w-5xl mx-auto space-y-4 pb-12">
      {/* Top Header & Sticky Progress Bar */}
      <div className="sticky top-16 sm:top-20 z-30 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xs p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* Back to lessons & Reset buttons */}
          <div className="flex items-center gap-1.5">
            <button
              id="btn-quiz-exit"
              onClick={onCancelQuiz}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Quay lại danh sách</span>
            </button>

            <button
              id="btn-reset-attempt"
              onClick={() => setShowResetConfirm(true)}
              title="Làm lại từ đầu (Xóa các câu đã chọn trong lượt làm này)"
              className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 border border-rose-200/80 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Làm lại từ đầu</span>
            </button>
          </div>

          {/* Lesson Title & Attempt ID */}
          <div className="text-center px-2">
            <h2 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate max-w-[200px] sm:max-w-md">
              Bài {lesson.lessonNumber}. {lesson.title}
            </h2>
            <p className="text-[10px] text-slate-400 font-mono font-medium truncate">
              Mã lượt: {attemptId}
            </p>
          </div>

          {/* Time Spent */}
          <div className="flex items-center gap-1.5 bg-slate-100 text-slate-700 font-mono font-bold text-xs sm:text-sm px-3 py-1.5 rounded-xl border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-sky-600 animate-spin-slow" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>
        </div>

        {/* Progress Bar & Summary Stats */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
            <div className="flex items-center gap-2">
              <span className="text-sky-700">
                Đã làm: {progressStats.answeredCount}/{progressStats.total} câu ({progressStats.percent}%)
              </span>
              {flaggedIds.length > 0 && (
                <span className="text-amber-600 flex items-center gap-1">
                  • <Bookmark className="w-3 h-3 fill-amber-400 text-amber-500" />
                  {flaggedIds.length} đánh dấu
                </span>
              )}
            </div>
            <button
              id="btn-open-nav-drawer"
              onClick={() => setShowNavigatorDrawer(true)}
              className="text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer font-bold"
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Danh sách câu</span>
            </button>
          </div>

          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-sky-500 to-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressStats.percent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Question Card Area */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Part & Question Number Badge */}
        <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                currentQuestion.part === "PART_1"
                  ? "bg-sky-100 text-sky-800 border border-sky-200"
                  : currentQuestion.part === "PART_2"
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  : "bg-indigo-100 text-indigo-800 border border-indigo-200"
              }`}
            >
              {currentQuestion.part === "PART_1" && "PHẦN I: Nhiều lựa chọn"}
              {currentQuestion.part === "PART_2" && "PHẦN II: Đúng / Sai"}
              {currentQuestion.part === "PART_3" && "PHẦN III: Trả lời ngắn"}
            </span>

            <span className="text-xs font-bold text-slate-700">
              Câu {currentIndex + 1} / {sortedQuestions.length}
            </span>

            <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-200/80 text-slate-600 font-medium hidden sm:inline">
              Mức độ: {currentQuestion.level}
            </span>
          </div>

          {/* Bookmark Button */}
          <button
            id={`btn-flag-question-${currentQuestion.id}`}
            onClick={toggleFlagCurrent}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isCurrentFlagged
                ? "bg-amber-50 text-amber-800 border-amber-300"
                : "bg-white text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {isCurrentFlagged ? (
              <>
                <BookmarkCheck className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span>Đã đánh dấu</span>
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4 text-slate-400" />
                <span className="hidden sm:inline">Đánh dấu câu</span>
              </>
            )}
          </button>
        </div>

        {/* Question Content Body */}
        <div className="p-5 sm:p-8 space-y-6">
          {/* Question Text */}
          <div className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
            {currentQuestion.questionText}
          </div>

          {/* Rich Geography Chart if present */}
          {currentQuestion.chart && (
            <GeoChartRenderer chart={currentQuestion.chart} />
          )}

          {/* Data Table if present (when no chart or as additional data) */}
          {currentQuestion.dataTable && currentQuestion.dataTable.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <TableIcon className="w-3.5 h-3.5 text-sky-600" />
                <span>Bảng số liệu:</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200 max-w-full shadow-2xs">
                <table className="min-w-full text-xs sm:text-sm text-left divide-y divide-slate-200">
                  <thead className="bg-sky-50 font-bold text-sky-950">
                    <tr>
                      {currentQuestion.dataTable[0].map((headerCell, hIdx) => (
                        <th key={hIdx} className="px-4 py-2.5 text-center font-bold border-r border-sky-100 last:border-r-0 whitespace-nowrap">
                          {headerCell}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {currentQuestion.dataTable.slice(1).map((row, rIdx) => (
                      <tr key={rIdx} className={rIdx % 2 === 1 ? "bg-slate-50/50" : ""}>
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className={`px-4 py-2 text-slate-700 border-r border-slate-100 last:border-r-0 ${
                              cIdx === 0 ? "font-semibold text-left" : "text-center font-mono"
                            }`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Image / Diagram if present */}
          {currentQuestion.imageUrl && (
            <div className="my-4 rounded-xl overflow-hidden border border-slate-200 max-w-lg mx-auto">
              <img
                src={currentQuestion.imageUrl}
                alt="Hình minh họa câu hỏi"
                className="w-full h-auto object-contain max-h-[300px]"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* Source attribution if present */}
          {currentQuestion.source && (
            <p className="text-xs text-slate-400 italic font-medium">
              ({currentQuestion.source})
            </p>
          )}

          {/* ---------------------------------------------------- */}
          {/* ANSWER INPUT SECTION BASED ON PART                   */}
          {/* ---------------------------------------------------- */}

          {/* PART 1: MULTIPLE CHOICE (A, B, C, D) */}
          {currentQuestion.part === "PART_1" && (
            <div className="space-y-3 pt-2">
              {[
                { key: "A", label: currentQuestion.optionA },
                { key: "B", label: currentQuestion.optionB },
                { key: "C", label: currentQuestion.optionC },
                { key: "D", label: currentQuestion.optionD },
              ].map(({ key, label }) => {
                const isSelected = answers[currentQuestion.id]?.part1Answer === key;
                return (
                  <button
                    key={key}
                    id={`opt-${currentQuestion.id}-${key}`}
                    onClick={() => handleSelectPart1(key as any)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3.5 cursor-pointer ${
                      isSelected
                        ? "bg-sky-50/80 border-sky-600 text-sky-950 shadow-xs font-semibold"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 text-slate-800"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs transition-colors ${
                        isSelected
                          ? "bg-sky-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {key}
                    </div>
                    <span className="text-sm sm:text-base leading-relaxed pt-0.5">
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* PART 2: TRUE / FALSE 4-STATEMENT GROUP (a, b, c, d) */}
          {currentQuestion.part === "PART_2" && (
            <div className="space-y-3.5 pt-2">
              <div className="bg-emerald-50/80 border border-emerald-100 p-3 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Thí sinh chọn <strong>Đúng</strong> hoặc <strong>Sai</strong> cho từng nhận định a, b, c, d dưới đây:
                </span>
              </div>

              {currentQuestion.subAnswers?.map((sub) => {
                const subId = sub.id as "a" | "b" | "c" | "d";
                const userChoice = answers[currentQuestion.id]?.part2Answers?.[subId];

                return (
                  <div
                    key={sub.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      userChoice !== undefined
                        ? "bg-slate-50/80 border-slate-300"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    {/* Statement label */}
                    <div className="flex items-start gap-3 flex-1">
                      <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center justify-center shrink-0">
                        {sub.id})
                      </span>
                      <p className="text-sm text-slate-800 leading-relaxed font-medium">
                        {sub.statement}
                      </p>
                    </div>

                    {/* True / False Choice Buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        id={`btn-${currentQuestion.id}-${sub.id}-true`}
                        onClick={() => handleSelectPart2Sub(subId, true)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          userChoice === true
                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20 ring-2 ring-emerald-600 ring-offset-1"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>ĐÚNG</span>
                      </button>

                      <button
                        id={`btn-${currentQuestion.id}-${sub.id}-false`}
                        onClick={() => handleSelectPart2Sub(subId, false)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          userChoice === false
                            ? "bg-rose-600 text-white shadow-md shadow-rose-500/20 ring-2 ring-rose-600 ring-offset-1"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        }`}
                      >
                        <span>SAI</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* PART 3: SHORT ANSWER & CALCULATION */}
          {currentQuestion.part === "PART_3" && (
            <div className="space-y-4 pt-2 max-w-xl">
              <div className="bg-indigo-50/80 border border-indigo-100 p-3 rounded-xl text-xs text-indigo-950 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  Nhập kết quả tính toán vào ô bên dưới. Chấp nhận dấu phẩy (,) hoặc dấu chấm (.). 
                  {currentQuestion.unit && ` Đơn vị yêu cầu: ${currentQuestion.unit}`}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Đáp án của bạn:
                </label>
                <div className="relative flex items-center">
                  <input
                    id={`input-part3-${currentQuestion.id}`}
                    type="text"
                    value={answers[currentQuestion.id]?.part3Answer || ""}
                    onChange={(e) => handleInputPart3(e.target.value)}
                    placeholder="Ví dụ: 12.5 hoặc 12,5"
                    className="w-full px-4 py-3 text-base sm:text-lg font-bold bg-slate-50 border-2 border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 transition-all font-mono"
                  />
                  {currentQuestion.unit && (
                    <span className="absolute right-4 text-xs font-bold text-slate-400 uppercase">
                      {currentQuestion.unit}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation & Action Bar */}
        <div className="bg-slate-50 p-4 sm:p-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          {/* Previous Question Button */}
          <button
            id="btn-prev-question"
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentIndex === 0
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 active:scale-95"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>CÂU TRƯỚC</span>
          </button>

          {/* Center: Open Question Palette button on mobile */}
          <button
            id="btn-center-question-nav"
            onClick={() => setShowNavigatorDrawer(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Câu {currentIndex + 1} / {sortedQuestions.length}</span>
            <ListOrdered className="w-3.5 h-3.5" />
          </button>

          {/* Next / Submit Button */}
          {currentIndex < sortedQuestions.length - 1 ? (
            <button
              id="btn-next-question"
              onClick={() => setCurrentIndex((prev) => Math.min(sortedQuestions.length - 1, prev + 1))}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <span>CÂU SAU</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="btn-trigger-submit-modal"
              onClick={() => setShowSubmitConfirm(true)}
              className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white flex items-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>NỘP BÀI</span>
            </button>
          )}
        </div>
      </div>

      {/* Persistent Large Submit Button at Bottom of Quiz */}
      <div className="pt-2 flex items-center justify-end">
        <button
          id="btn-bottom-submit"
          onClick={() => setShowSubmitConfirm(true)}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2.5 cursor-pointer transition-all active:scale-[0.99]"
        >
          <Send className="w-5 h-5" />
          <span>NỘP BÀI THI ({progressStats.answeredCount}/{progressStats.total} CÂU)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* DRAWER / MODAL: QUESTION NAVIGATOR PALETTE                                */}
      {/* ========================================================================= */}
      {showNavigatorDrawer && (
        <div
          id="question-navigator-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Danh Sách Câu Hỏi</h3>
                <p className="text-xs text-slate-400">
                  Đã làm {progressStats.answeredCount}/{progressStats.total} câu
                </p>
              </div>
              <button
                id="btn-close-navigator"
                onClick={() => setShowNavigatorDrawer(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Legend */}
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-emerald-500"></span>
                <span>Đã làm</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-slate-200"></span>
                <span>Chưa làm</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-amber-400"></span>
                <span>Đánh dấu</span>
              </div>
            </div>

            {/* Number grid */}
            <div className="p-5 overflow-y-auto space-y-4">
              {/* Part 1 Group */}
              <div>
                <h4 className="text-xs font-extrabold text-sky-800 uppercase tracking-wider mb-2">
                  Phần I: Nhiều lựa chọn
                </h4>
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                  {sortedQuestions
                    .map((q, idx) => ({ q, idx }))
                    .filter(({ q }) => q.part === "PART_1")
                    .map(({ q, idx }) => {
                      const answered = isQuestionAnswered(q);
                      const isFlagged = flaggedIds.includes(q.id);
                      const isCurrent = currentIndex === idx;

                      return (
                        <button
                          key={q.id}
                          id={`nav-q-${idx + 1}`}
                          onClick={() => {
                            setCurrentIndex(idx);
                            setShowNavigatorDrawer(false);
                          }}
                          className={`h-11 rounded-xl font-bold text-xs flex items-center justify-center relative transition-all cursor-pointer ${
                            isCurrent
                              ? "ring-3 ring-sky-500 font-extrabold"
                              : ""
                          } ${
                            isFlagged
                              ? "bg-amber-400 text-amber-950 font-black"
                              : answered
                              ? "bg-emerald-600 text-white font-bold"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                          }`}
                        >
                          <span>{idx + 1}</span>
                          {isFlagged && (
                            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-600"></span>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Part 2 Group */}
              <div>
                <h4 className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider mb-2">
                  Phần II: Đúng / Sai
                </h4>
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                  {sortedQuestions
                    .map((q, idx) => ({ q, idx }))
                    .filter(({ q }) => q.part === "PART_2")
                    .map(({ q, idx }) => {
                      const answered = isQuestionAnswered(q);
                      const isFlagged = flaggedIds.includes(q.id);
                      const isCurrent = currentIndex === idx;

                      return (
                        <button
                          key={q.id}
                          id={`nav-q-${idx + 1}`}
                          onClick={() => {
                            setCurrentIndex(idx);
                            setShowNavigatorDrawer(false);
                          }}
                          className={`h-11 rounded-xl font-bold text-xs flex items-center justify-center relative transition-all cursor-pointer ${
                            isCurrent
                              ? "ring-3 ring-sky-500 font-extrabold"
                              : ""
                          } ${
                            isFlagged
                              ? "bg-amber-400 text-amber-950 font-black"
                              : answered
                              ? "bg-emerald-600 text-white font-bold"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                          }`}
                        >
                          <span>{idx + 1}</span>
                          {isFlagged && (
                            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-600"></span>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Part 3 Group */}
              <div>
                <h4 className="text-xs font-extrabold text-indigo-800 uppercase tracking-wider mb-2">
                  Phần III: Trả lời ngắn
                </h4>
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                  {sortedQuestions
                    .map((q, idx) => ({ q, idx }))
                    .filter(({ q }) => q.part === "PART_3")
                    .map(({ q, idx }) => {
                      const answered = isQuestionAnswered(q);
                      const isFlagged = flaggedIds.includes(q.id);
                      const isCurrent = currentIndex === idx;

                      return (
                        <button
                          key={q.id}
                          id={`nav-q-${idx + 1}`}
                          onClick={() => {
                            setCurrentIndex(idx);
                            setShowNavigatorDrawer(false);
                          }}
                          className={`h-11 rounded-xl font-bold text-xs flex items-center justify-center relative transition-all cursor-pointer ${
                            isCurrent
                              ? "ring-3 ring-sky-500 font-extrabold"
                              : ""
                          } ${
                            isFlagged
                              ? "bg-amber-400 text-amber-950 font-black"
                              : answered
                              ? "bg-emerald-600 text-white font-bold"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                          }`}
                        >
                          <span>{idx + 1}</span>
                          {isFlagged && (
                            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-600"></span>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                id="btn-done-nav"
                onClick={() => setShowNavigatorDrawer(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONFIRMATION SUBMISSION MODAL                                             */}
      {/* ========================================================================= */}
      {showSubmitConfirm && (
        <div
          id="submit-confirmation-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-7 space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900">
                Xác Nhận Nộp Bài
              </h3>
              {progressStats.unansweredCount > 0 ? (
                <p className="text-sm text-slate-600 leading-relaxed">
                  Bạn còn <strong className="text-rose-600 font-bold">{progressStats.unansweredCount} câu</strong> chưa trả lời. Bạn vẫn muốn nộp bài ngay bây giờ?
                </p>
              ) : (
                <p className="text-sm text-slate-600 leading-relaxed">
                  Bạn đã trả lời đầy đủ <strong>{progressStats.total}/{progressStats.total} câu</strong>. Hãy xác nhận để gửi bài làm lên hệ thống.
                </p>
              )}
            </div>

            {/* Attempt Details summary */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1.5 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Học sinh:</span>
                <span className="font-bold">{student.studentName} - Lớp {student.className}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bài học:</span>
                <span className="font-bold truncate max-w-[200px]">Bài {lesson.lessonNumber}. {lesson.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Thời gian làm:</span>
                <span className="font-mono font-bold">{formatTime(elapsedSeconds)}</span>
              </div>
            </div>

            {submissionError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl font-medium">
                {submissionError}
              </div>
            )}

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                id="btn-return-continue-quiz"
                onClick={() => setShowSubmitConfirm(false)}
                disabled={isSubmitting}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                QUAY LẠI LÀM TIẾP
              </button>

              <button
                id="btn-confirm-final-submit"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Đang nộp...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>VẪN NỘP BÀI</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONFIRMATION RESET ATTEMPT MODAL                                          */}
      {/* ========================================================================= */}
      {showResetConfirm && (
        <div
          id="reset-confirmation-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-7 space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <RotateCcw className="w-8 h-8" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900">
                Làm Lại Từ Đầu?
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Tất cả các lựa chọn và đáp án đã chọn trong lượt làm bài này sẽ được xóa để bạn làm lại từ đầu. Kết quả các lần làm trước đó của bạn vẫn được lưu lại an toàn.
              </p>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                id="btn-cancel-reset"
                onClick={() => setShowResetConfirm(false)}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                HỦY BỎ
              </button>

              <button
                id="btn-confirm-reset"
                onClick={handleResetCurrentAttempt}
                className="py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>XÓA & LÀM LẠI</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
