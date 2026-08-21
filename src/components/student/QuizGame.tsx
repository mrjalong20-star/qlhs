import { useState, useMemo, useCallback } from "react";
import { Heart, Star, RotateCcw, CheckCircle2, XCircle, Zap, Trophy, ChevronRight } from "lucide-react";
import { Lesson, Question } from "../../types";

interface QuizGameProps {
  lessons: Lesson[];
  questions: Question[];
  completedLessonIds: Set<string>;
  onSelectLesson: (lesson: Lesson) => void;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface GameQuestion { question: Question; difficultyIndex: number; }

const LEVELS = ["Nhận biết", "Thông hiểu", "Vận dụng", "Vận dụng cao"];
const LEVEL_COLORS = ["bg-emerald-50 text-emerald-700", "bg-green-50 text-green-700", "bg-blue-50 text-blue-700", "bg-purple-50 text-purple-700"];
const LEVEL_XP = [10, 20, 30, 50];

export function QuizGame({ lessons, questions, completedLessonIds }: QuizGameProps) {
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

  const availableLessons = useMemo(() => lessons.filter(l => !l.isLocked && !l.isHidden), [lessons]);

  const startGame = useCallback((lesson: Lesson) => {
    setSelectedLesson(lesson);
    const lqs = questions.filter(q => q.lessonId === lesson.id);
    if (lqs.length === 0) return;
    const sorted = [...lqs].sort((a, b) => {
      const la = LEVELS.indexOf(a.level), lb = LEVELS.indexOf(b.level);
      return (la === -1 ? 99 : la) - (lb === -1 ? 99 : lb);
    });
    const selected = sorted.slice(0, Math.min(10, sorted.length));
    setGameQuestions(selected.map(q => ({ question: q, difficultyIndex: LEVELS.indexOf(q.level) })));
    setCurrentIndex(0); setHearts(3); setXp(0); setScore(0);
    setSelectedAnswer(null); setIsAnswered(false); setIsCorrect(false);
    setGameOver(false); setGameWon(false); setSubAnswers({}); setShortAnswerInput("");
  }, [questions]);

  const currentQ = gameQuestions[currentIndex];

  const checkAnswer = () => {
    if (!currentQ) return;
    const q = currentQ.question;
    let correct = false;
    if (q.type === "MULTIPLE_CHOICE") {
      correct = selectedAnswer === (q.answer || q.correctOption);
    } else if (q.type === "TRUE_FALSE_GROUP") {
      correct = Boolean(q.subAnswers?.every(s => subAnswers[s.id] === s.correctAnswer));
    } else if (q.type === "SHORT_ANSWER") {
      const norm = shortAnswerInput.trim().toLowerCase();
      correct = (q.acceptableAnswers || q.acceptedAnswers || []).some(a => a.toLowerCase() === norm) || norm === (q.shortAnswer || "").toLowerCase();
    }
    setIsCorrect(correct);
    if (correct) { setXp(prev => prev + (LEVEL_XP[currentQ.difficultyIndex] || 10)); setScore(s => s + 1); }
    else { setHearts(h => h - 1); }
    setIsAnswered(true);
  };

  const nextQuestion = () => {
    if (hearts <= 0) { setGameOver(true); return; }
    if (currentIndex + 1 >= gameQuestions.length) { setGameWon(true); return; }
    setCurrentIndex(currentIndex + 1); setSelectedAnswer(null);
    setIsAnswered(false); setIsCorrect(false); setSubAnswers({}); setShortAnswerInput("");
  };

  // Empty state
  if (availableLessons.length === 0) {
    return (
      <div className="text-center py-16">
        <Zap className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-500">Chưa có bài để chơi</p>
        <p className="text-xs text-slate-400 mt-1">Giáo viên sẽ mở bài giảng khi đến lúc</p>
      </div>
    );
  }

  // Lesson selection
  if (!selectedLesson) {
    return (
      <div className="space-y-4">
        <h2 className="text-base font-extrabold text-slate-900">🎮 Chọn bài để chơi</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {availableLessons.map(lesson => {
            const lqs = questions.filter(q => q.lessonId === lesson.id);
            const done = completedLessonIds.has(lesson.id);
            return (
              <button key={lesson.id} onClick={() => lqs.length > 0 && startGame(lesson)} disabled={lqs.length === 0}
                className={`text-left rounded-xl border-2 p-3 transition-all ${lqs.length === 0 ? "bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed" : done ? "bg-emerald-50 border-emerald-300 hover:shadow-md cursor-pointer" : "bg-white border-slate-200 hover:border-purple-300 hover:shadow-md cursor-pointer"}`}>
                <p className="text-sm font-bold text-slate-900 truncate">{lesson.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{lqs.length} câu • {done ? "✅ Đã làm" : "Chưa làm"}</p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Game over
  if (gameOver) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="text-5xl">💔</div>
        <h2 className="text-xl font-extrabold text-slate-900">Hết mạng!</h2>
        <p className="text-sm text-slate-500">Thử lại nhé!</p>
        <div className="flex items-center justify-center gap-3 text-sm">
          <span className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5"><Zap className="w-3.5 h-3.5 text-amber-600 inline" /> {xp} XP</span>
          <span className="bg-sky-50 border border-sky-200 rounded-lg px-3 py-1.5"><Star className="w-3.5 h-3.5 text-sky-600 inline" /> {score}/{gameQuestions.length}</span>
        </div>
        <div className="flex gap-2 justify-center">
          <button onClick={() => startGame(selectedLesson)} className="px-5 py-2.5 rounded-lg bg-purple-600 text-white text-sm font-bold cursor-pointer">Chơi lại</button>
          <button onClick={() => setSelectedLesson(null)} className="px-5 py-2.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold cursor-pointer">Đổi bài</button>
        </div>
      </div>
    );
  }

  // Game won
  if (gameWon) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="text-5xl">🎉</div>
        <h2 className="text-xl font-extrabold text-slate-900">Xuất sắc!</h2>
        <div className="flex items-center justify-center gap-3 text-sm">
          <span className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 font-bold"><Zap className="w-3.5 h-3.5 text-amber-600 inline" /> {xp} XP</span>
          <span className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 font-bold"><Trophy className="w-3.5 h-3.5 text-emerald-600 inline" /> {score}/{gameQuestions.length}</span>
        </div>
        <div className="flex gap-2 justify-center">
          <button onClick={() => startGame(selectedLesson)} className="px-5 py-2.5 rounded-lg bg-purple-600 text-white text-sm font-bold cursor-pointer">Chơi lại</button>
          <button onClick={() => setSelectedLesson(null)} className="px-5 py-2.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold cursor-pointer">Đổi bài</button>
        </div>
      </div>
    );
  }

  // Playing
  if (!currentQ) return null;
  const q = currentQ.question;
  const lv = currentQ.difficultyIndex >= 0 ? currentQ.difficultyIndex : 0;

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button onClick={() => setSelectedLesson(null)} className="text-sm font-semibold text-slate-500 hover:text-slate-800 cursor-pointer">← Quay lại</button>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">{[0, 1, 2].map(i => <Heart key={i} className={`w-4 h-4 ${i < hearts ? "text-red-500 fill-red-500" : "text-slate-300"}`} />)}</div>
          <span className="text-xs font-bold text-amber-600">{xp} XP</span>
        </div>
      </div>

      {/* Progress */}
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div className="bg-purple-500 h-full rounded-full transition-all" style={{ width: `${((currentIndex + 1) / gameQuestions.length) * 100}%` }} />
      </div>
      <p className="text-xs text-slate-400 text-center">Câu {currentIndex + 1}/{gameQuestions.length}</p>

      {/* Difficulty */}
      <div className="flex justify-center">
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${LEVEL_COLORS[lv]}`}>{LEVELS[lv] || "Cơ bản"}</span>
      </div>

      {/* Question */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <p className="text-sm font-bold text-slate-900 leading-relaxed mb-5">{q.questionText}</p>

        {q.imageUrl && <img src={q.imageUrl} alt="" className="max-h-48 mx-auto rounded-lg border border-slate-200 mb-4" />}

        {/* Multiple choice */}
        {q.type === "MULTIPLE_CHOICE" && (
          <div className="space-y-2">
            {(["A", "B", "C", "D"] as const).map(opt => {
              const text = opt === "A" ? q.optionA : opt === "B" ? q.optionB : opt === "C" ? q.optionC : q.optionD;
              if (!text) return null;
              const isCorrectOpt = opt === (q.answer || q.correctOption);
              const isSelected = selectedAnswer === opt;
              let cls = "border-slate-200 hover:border-sky-400 bg-white";
              if (isAnswered) { if (isCorrectOpt) cls = "border-emerald-400 bg-emerald-50"; else if (isSelected && !isCorrect) cls = "border-red-400 bg-red-50"; }
              else if (isSelected) cls = "border-sky-500 bg-sky-50";
              return (
                <button key={opt} onClick={() => !isAnswered && setSelectedAnswer(opt)} disabled={isAnswered}
                  className={`w-full text-left px-4 py-3 rounded-lg border-2 ${cls} text-sm font-medium flex items-center gap-3 transition-all cursor-pointer`}>
                  <span className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">{opt}</span>
                  <span className="text-slate-800">{text}</span>
                  {isAnswered && isCorrectOpt && <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto shrink-0" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-500 ml-auto shrink-0" />}
                </button>
              );
            })}
          </div>
        )}

        {/* True/False */}
        {q.type === "TRUE_FALSE_GROUP" && q.subAnswers && (
          <div className="space-y-2">
            {q.subAnswers.map(s => (
              <div key={s.id} className="border border-slate-200 rounded-lg p-3">
                <p className="text-sm font-medium text-slate-800 mb-2">{s.id.toUpperCase()}. {s.statement}</p>
                <div className="flex gap-2">
                  <button onClick={() => !isAnswered && setSubAnswers({ ...subAnswers, [s.id]: true })} disabled={isAnswered}
                    className={`flex-1 py-1.5 rounded-md text-xs font-bold border-2 transition-all cursor-pointer ${subAnswers[s.id] === true ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-600"}`}>
                    ĐÚNG
                  </button>
                  <button onClick={() => !isAnswered && setSubAnswers({ ...subAnswers, [s.id]: false })} disabled={isAnswered}
                    className={`flex-1 py-1.5 rounded-md text-xs font-bold border-2 transition-all cursor-pointer ${subAnswers[s.id] === false ? "border-red-500 bg-red-50 text-red-700" : "border-slate-200 text-slate-600"}`}>
                    SAI
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Short answer */}
        {q.type === "SHORT_ANSWER" && (
          <input type="text" value={shortAnswerInput} onChange={e => setShortAnswerInput(e.target.value)} disabled={isAnswered}
            placeholder="Nhập đáp án..."
            className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center" />
        )}

        {/* Explanation when wrong */}
        {isAnswered && !isCorrect && q.explanation && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs font-bold text-amber-800 mb-1">📝 Cách giải:</p>
            <p className="text-sm text-amber-900">{q.explanation}</p>
          </div>
        )}
      </div>

      {/* Action */}
      <div className="flex gap-2">
        {!isAnswered ? (
          <button onClick={checkAnswer} disabled={
            (q.type === "MULTIPLE_CHOICE" && !selectedAnswer) ||
            (q.type === "TRUE_FALSE_GROUP" && Object.keys(subAnswers).length < (q.subAnswers?.length || 0)) ||
            (q.type === "SHORT_ANSWER" && !shortAnswerInput.trim())
          } className="flex-1 py-3 rounded-lg bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 transition-colors disabled:opacity-50 cursor-pointer">
            Kiểm tra
          </button>
        ) : (
          <button onClick={nextQuestion} className="flex-1 py-3 rounded-lg bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 cursor-pointer">
            {currentIndex + 1 >= gameQuestions.length ? "Xem kết quả" : "Tiếp theo"} <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
