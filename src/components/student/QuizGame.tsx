import { useState, useMemo, useCallback } from "react";
import { Heart, Star, ArrowRight, RotateCcw, CheckCircle2, XCircle, BookOpen, Zap, Trophy, ChevronRight } from "lucide-react";
import { Lesson, Question } from "../../types";

interface QuizGameProps {
  lessons: Lesson[];
  questions: Question[];
  completedLessonIds: Set<string>;
  onSelectLesson: (lesson: Lesson) => void;
}

const DIFFICULTY_CONFIG = [
  { level: "Nhận biết", icon: "🌱", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-300", label: "Lý thuyết cơ bản", xp: 10 },
  { level: "Thông hiểu", icon: "🌿", color: "text-green-600", bg: "bg-green-50", border: "border-green-300", label: "Hiểu bản chất", xp: 20 },
  { level: "Vận dụng", icon: "⛰️", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-300", label: "Bài tập vận dụng", xp: 30 },
  { level: "Vận dụng cao", icon: "🏆", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-300", label: "Thử thách nâng cao", xp: 50 },
];

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface GameQuestion {
  question: Question;
  difficultyIndex: number;
}

export function QuizGame({ lessons, questions, completedLessonIds, onSelectLesson }: QuizGameProps) {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [gameQuestions, setGameQuestions] = useState<GameQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [xp, setXp] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [subAnswers, setSubAnswers] = useState<Record<string, boolean | null>>({});
  const [shortAnswerInput, setShortAnswerInput] = useState("");

  const availableLessons = useMemo(() => {
    return lessons.filter(l => !l.isLocked && !l.isHidden);
  }, [lessons]);

  const startGame = useCallback((lesson: Lesson) => {
    setSelectedLesson(lesson);
    const lessonQuestions = questions.filter(q => q.lessonId === lesson.id);
    if (lessonQuestions.length === 0) return;

    // Sort by difficulty: Nhận biết → Thông hiểu → Vận dụng → Vận dụng cao
    const levelOrder = ["Nhận biết", "Thông hiểu", "Vận dụng", "Vận dụng cao"];
    const sorted = [...lessonQuestions].sort((a, b) => {
      const la = levelOrder.indexOf(a.level);
      const lb = levelOrder.indexOf(b.level);
      return (la === -1 ? 99 : la) - (lb === -1 ? 99 : lb);
    });

    // Take up to 10 questions, mixing difficulties
    const selected = sorted.slice(0, Math.min(10, sorted.length));
    const gameQs: GameQuestion[] = selected.map(q => ({
      question: q,
      difficultyIndex: levelOrder.indexOf(q.level),
    }));

    setGameQuestions(gameQs);
    setCurrentIndex(0);
    setHearts(3);
    setXp(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setGameOver(false);
    setGameWon(false);
    setSubAnswers({});
    setShortAnswerInput("");
  }, [questions]);

  const currentQ = gameQuestions[currentIndex];

  const checkAnswer = () => {
    if (!currentQ) return;
    const q = currentQ.question;

    if (q.type === "MULTIPLE_CHOICE") {
      const correct = selectedAnswer === (q.answer || q.correctOption);
      setIsCorrect(correct);
      if (correct) {
        setXp(xp + DIFFICULTY_CONFIG[currentQ.difficultyIndex]?.xp || 10);
        setScore(score + 1);
      } else {
        setHearts(hearts - 1);
      }
    } else if (q.type === "TRUE_FALSE_GROUP") {
      const allCorrect = q.subAnswers?.every(s => {
        const studentAnswer = subAnswers[s.id];
        return studentAnswer === s.correctAnswer;
      });
      setIsCorrect(Boolean(allCorrect));
      if (allCorrect) {
        setXp(xp + DIFFICULTY_CONFIG[currentQ.difficultyIndex]?.xp || 10);
        setScore(score + 1);
      } else {
        setHearts(hearts - 1);
      }
    } else if (q.type === "SHORT_ANSWER") {
      const acceptable = q.acceptableAnswers || q.acceptedAnswers || [];
      const normalized = shortAnswerInput.trim().toLowerCase();
      const correct = acceptable.some(a => a.toLowerCase() === normalized) || normalized === (q.shortAnswer || "").toLowerCase();
      setIsCorrect(correct);
      if (correct) {
        setXp(xp + DIFFICULTY_CONFIG[currentQ.difficultyIndex]?.xp || 10);
        setScore(score + 1);
      } else {
        setHearts(hearts - 1);
      }
    }

    setIsAnswered(true);
  };

  const nextQuestion = () => {
    if (hearts <= 0) {
      setGameOver(true);
      return;
    }
    if (currentIndex + 1 >= gameQuestions.length) {
      setGameWon(true);
      return;
    }
    setCurrentIndex(currentIndex + 1);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setSubAnswers({});
    setShortAnswerInput("");
  };

  const restartGame = () => {
    if (selectedLesson) startGame(selectedLesson);
  };

  // ── Lesson Selection Screen ──
  if (!selectedLesson) {
    const gradeGroups = new Map<number, Lesson[]>();
    for (const lesson of availableLessons) {
      const g = lesson.grade || 6;
      if (!gradeGroups.has(g)) gradeGroups.set(g, []);
      gradeGroups.get(g)!.push(lesson);
    }

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-7 h-7 text-amber-300" />
            <h1 className="text-2xl sm:text-3xl font-extrabold">Chế độ Game</h1>
          </div>
          <p className="text-sm text-purple-100 mt-1">
            Chọn bài giảng để bắt đầu chơi. Câu hỏi từ lý thuyết → vận dụng, càng lên cao càng khó!
          </p>
        </div>

        <div className="space-y-4">
          {Array.from(gradeGroups.entries()).sort(([a], [b]) => a - b).map(([grade, gradeLessons]) => (
            <div key={grade}>
              <h3 className="text-sm font-bold text-slate-600 mb-2 px-1">Lớp {grade}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {gradeLessons.map(lesson => {
                  const lessonQs = questions.filter(q => q.lessonId === lesson.id);
                  const completed = completedLessonIds.has(lesson.id);
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => lessonQs.length > 0 && startGame(lesson)}
                      disabled={lessonQs.length === 0}
                      className={`text-left rounded-xl border-2 p-4 transition-all ${
                        lessonQs.length === 0
                          ? "bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed"
                          : completed
                          ? "bg-emerald-50 border-emerald-300 hover:shadow-md cursor-pointer"
                          : "bg-white border-slate-200 hover:border-purple-300 hover:shadow-md cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-400">Bài {lesson.lessonNumber}</span>
                        {completed && <span className="text-xs">✅</span>}
                      </div>
                      <p className="text-sm font-bold text-slate-900 line-clamp-2">{lesson.title}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{lessonQs.length} câu hỏi</p>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Game Over ──
  if (gameOver) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 space-y-6">
        <div className="text-6xl">💔</div>
        <h2 className="text-2xl font-extrabold text-slate-900">Hết mạng rồi!</h2>
        <p className="text-sm text-slate-500">Bạn đã trả lời sai 3 lần. Đừng lo, thử lại nhé!</p>
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2"><Zap className="w-4 h-4 text-amber-600 inline" /> {xp} XP</div>
          <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-2"><Star className="w-4 h-4 text-sky-600 inline" /> {score}/{gameQuestions.length} đúng</div>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={restartGame} className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> Chơi lại
          </button>
          <button onClick={() => setSelectedLesson(null)} className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm">
            Đổi bài
          </button>
        </div>
      </div>
    );
  }

  // ── Game Won ──
  if (gameWon) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 space-y-6">
        <div className="text-6xl">🎉</div>
        <h2 className="text-2xl font-extrabold text-slate-900">Hoàn thành xuất sắc!</h2>
        <p className="text-sm text-slate-500">Bạn đã trả lời hết {gameQuestions.length} câu hỏi!</p>
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 font-bold"><Zap className="w-4 h-4 text-amber-600 inline" /> {xp} XP</div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 font-bold"><Trophy className="w-4 h-4 text-emerald-600 inline" /> {score}/{gameQuestions.length} đúng</div>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={restartGame} className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> Chơi lại
          </button>
          <button onClick={() => setSelectedLesson(null)} className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm">
            Đổi bài
          </button>
        </div>
      </div>
    );
  }

  // ── Playing ──
  if (!currentQ) return null;
  const q = currentQ.question;
  const diffConfig = DIFFICULTY_CONFIG[currentQ.difficultyIndex] || DIFFICULTY_CONFIG[0];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button onClick={() => setSelectedLesson(null)} className="text-sm font-semibold text-slate-500 hover:text-slate-800">
          ← Quay lại
        </button>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <Heart key={i} className={`w-5 h-5 ${i < hearts ? "text-red-500 fill-red-500" : "text-slate-300"}`} />
            ))}
          </div>
          <span className="text-sm font-bold text-amber-600">{xp} XP</span>
        </div>
      </div>

      {/* Progress */}
      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all" style={{ width: `${((currentIndex + 1) / gameQuestions.length) * 100}%` }} />
      </div>
      <p className="text-xs text-slate-400 text-center">Câu {currentIndex + 1}/{gameQuestions.length}</p>

      {/* Difficulty badge */}
      <div className="flex justify-center">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${diffConfig.bg} ${diffConfig.color} border ${diffConfig.border}`}>
          {diffConfig.icon} {diffConfig.label}
        </span>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <p className="text-base font-bold text-slate-900 leading-relaxed mb-6">{q.questionText}</p>

        {/* Image if present */}
        {q.imageUrl && (
          <div className="mb-4 text-center">
            <img src={q.imageUrl} alt="Hình minh họa" className="max-h-60 mx-auto rounded-xl border border-slate-200" />
          </div>
        )}

        {/* Data table if present */}
        {q.dataTable && q.dataTable.length > 0 && (
          <div className="mb-4 overflow-x-auto">
            <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
              <tbody>
                {q.dataTable.map((row, ri) => (
                  <tr key={ri} className={ri === 0 ? "bg-slate-100 font-bold" : "bg-white"}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3 py-2 border border-slate-200">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Chart if present */}
        {q.chart && (
          <div className="mb-4 bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-xs font-bold text-slate-600 mb-2">{q.chart.title || "Biểu đồ"}</p>
            <div className="flex items-end gap-1 h-32">
              {q.chart.categories?.map((cat, i) => {
                const val = q.chart!.datasets[0]?.data[i] || 0;
                const max = Math.max(...(q.chart!.datasets[0]?.data || [1]));
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] font-bold text-slate-600">{val}</span>
                    <div className="w-full bg-sky-400 rounded-t" style={{ height: `${(val / max) * 100}%` }} />
                    <span className="text-[8px] text-slate-400 text-center leading-tight">{cat}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MULTIPLE CHOICE */}
        {q.type === "MULTIPLE_CHOICE" && (
          <div className="space-y-2.5">
            {(["A", "B", "C", "D"] as const).map(opt => {
              const text = opt === "A" ? q.optionA : opt === "B" ? q.optionB : opt === "C" ? q.optionC : q.optionD;
              if (!text) return null;
              const isCorrectOpt = opt === (q.answer || q.correctOption);
              const isSelected = selectedAnswer === opt;
              let borderColor = "border-slate-200 hover:border-sky-400";
              let bgColor = "bg-white";
              if (isAnswered) {
                if (isCorrectOpt) { borderColor = "border-emerald-400"; bgColor = "bg-emerald-50"; }
                else if (isSelected && !isCorrect) { borderColor = "border-red-400"; bgColor = "bg-red-50"; }
              } else if (isSelected) {
                borderColor = "border-sky-500"; bgColor = "bg-sky-50";
              }
              return (
                <button key={opt} onClick={() => !isAnswered && setSelectedAnswer(opt)} disabled={isAnswered}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 ${borderColor} ${bgColor} text-sm font-medium transition-all flex items-center gap-3`}>
                  <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">{opt}</span>
                  <span className="text-slate-800">{text}</span>
                  {isAnswered && isCorrectOpt && <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto shrink-0" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500 ml-auto shrink-0" />}
                </button>
              );
            })}
          </div>
        )}

        {/* TRUE/FALSE GROUP */}
        {q.type === "TRUE_FALSE_GROUP" && q.subAnswers && (
          <div className="space-y-3">
            {q.subAnswers.map(s => {
              const val = subAnswers[s.id];
              return (
                <div key={s.id} className="border border-slate-200 rounded-xl p-3">
                  <p className="text-sm font-medium text-slate-800 mb-2">{s.id.toUpperCase()}. {s.statement}</p>
                  <div className="flex gap-2">
                    <button onClick={() => !isAnswered && setSubAnswers({ ...subAnswers, [s.id]: true })} disabled={isAnswered}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border-2 transition-all ${val === true ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-600"}`}>
                      ĐÚNG ✓
                    </button>
                    <button onClick={() => !isAnswered && setSubAnswers({ ...subAnswers, [s.id]: false })} disabled={isAnswered}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border-2 transition-all ${val === false ? "border-red-500 bg-red-50 text-red-700" : "border-slate-200 bg-white text-slate-600"}`}>
                      SAI ✗
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* SHORT ANSWER */}
        {q.type === "SHORT_ANSWER" && (
          <div>
            <input type="text" value={shortAnswerInput} onChange={e => setShortAnswerInput(e.target.value)} disabled={isAnswered}
              placeholder="Nhập đáp án..."
              className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-center text-lg" />
            {isAnswered && !isCorrect && (
              <p className="text-sm text-emerald-700 mt-2 text-center font-bold">Đáp án đúng: {q.shortAnswer}</p>
            )}
          </div>
        )}

        {/* Explanation (shown when wrong) */}
        {isAnswered && !isCorrect && q.explanation && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs font-bold text-amber-800 mb-1">📝 Cách giải:</p>
            <p className="text-sm text-amber-900 leading-relaxed">{q.explanation}</p>
            {q.type === "TRUE_FALSE_GROUP" && q.subAnswers && (
              <div className="mt-2 space-y-1">
                {q.subAnswers.map(s => (
                  <p key={s.id} className="text-xs text-amber-800">
                    <span className="font-bold">{s.id.toUpperCase()}.</span> {s.correctAnswer ? "ĐÚNG" : "SAI"} — {s.explanation}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        {!isAnswered ? (
          <button onClick={checkAnswer} disabled={
            (q.type === "MULTIPLE_CHOICE" && !selectedAnswer) ||
            (q.type === "TRUE_FALSE_GROUP" && Object.keys(subAnswers).length < (q.subAnswers?.length || 0)) ||
            (q.type === "SHORT_ANSWER" && !shortAnswerInput.trim())
          } className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            Kiểm tra
          </button>
        ) : (
          <button onClick={nextQuestion} className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all">
            {currentIndex + 1 >= gameQuestions.length ? "Xem kết quả" : "Câu tiếp theo"}
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
