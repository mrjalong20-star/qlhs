import { useState, useMemo, useEffect } from "react";
import { Search, BookOpen, Sparkles, Calculator, Zap, Star, Trophy, Flame, Target, Lock, ChevronDown, ChevronUp, MapPin } from "lucide-react";
import { Lesson, Question, SubmissionResult, StudentProfile, Formula } from "../../types";
import { LessonCard } from "./LessonCard";
import { GRADE_OPTIONS } from "../../config/appConfig";
import { storageService } from "../../services/storageService";

interface LessonListViewProps {
  lessons: Lesson[];
  questions: Question[];
  submissions: SubmissionResult[];
  student: StudentProfile | null;
  onStartLesson: (lesson: Lesson, isRetake?: boolean) => void;
  onOpenStudentModal: () => void;
}

const LEVEL_CONFIG: Record<number, { icon: string; color: string; bg: string; border: string; label: string }> = {
  6: { icon: "🌱", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-300", label: "Cơ bản" },
  7: { icon: "🌿", color: "text-green-700", bg: "bg-green-50", border: "border-green-300", label: "Nâng cao 1" },
  8: { icon: "🌳", color: "text-teal-700", bg: "bg-teal-50", border: "border-teal-300", label: "Nâng cao 2" },
  9: { icon: "⛰️", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-300", label: "Trung cấp" },
  10: { icon: "🏔️", color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-300", label: "Cao cấp 1" },
  11: { icon: "👑", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-300", label: "Cao cấp 2" },
  12: { icon: "🏆", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-300", label: "Thử thách" },
};

const LEVELS = [
  { name: "Học sinh mới", minXP: 0, icon: "🌱", color: "from-slate-400 to-slate-500" },
  { name: "Học viên chăm chỉ", minXP: 50, icon: "📚", color: "from-sky-400 to-blue-500" },
  { name: "Chiến binh kiến thức", minXP: 150, icon: "⚔️", color: "from-indigo-400 to-purple-500" },
  { name: "Bậc thầy Toán học", minXP: 300, icon: "🏆", color: "from-amber-400 to-orange-500" },
  { name: "Huyền thoại GDPT", minXP: 500, icon: "👑", color: "from-yellow-400 to-amber-500" },
];

function getLevel(xp: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) return { level: i + 1, ...LEVELS[i] };
  }
  return { level: 1, ...LEVELS[0] };
}

function getNextLevel(xp: number) {
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp < LEVELS[i].minXP) return { level: i + 1, ...LEVELS[i] };
  }
  return null;
}

export function LessonListView({ lessons, questions, submissions, student, onStartLesson, onOpenStudentModal }: LessonListViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGrades, setExpandedGrades] = useState<Set<number>>(new Set([6]));
  const [quickFormulas, setQuickFormulas] = useState<Formula[]>([]);

  useEffect(() => {
    const grade = Number(student?.grade || 6);
    void fetch(`/api/formulas?grade=${grade}`).then(r => r.json()).then(j => setQuickFormulas(j.success ? (j.data || []).slice(0, 4) : [])).catch(() => setQuickFormulas([]));
  }, [student?.grade]);

  const completedLessonIds = useMemo(() => new Set(submissions.map(s => s.lessonId)), [submissions]);

  // Mix all lessons grades 6-12, sort by grade then lessonNumber, filter out locked & hidden
  const allGameLessons = useMemo(() => {
    return lessons
      .filter(l => !l.isHidden && !l.isLocked)
      .sort((a, b) => {
        const gradeA = a.grade || 6;
        const gradeB = b.grade || 6;
        if (gradeA !== gradeB) return gradeA - gradeB;
        return a.lessonNumber - b.lessonNumber;
      });
  }, [lessons]);

  // Group by grade
  const lessonsByGrade = useMemo(() => {
    const map = new Map<number, typeof allGameLessons>();
    for (const lesson of allGameLessons) {
      const g = lesson.grade || 6;
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(lesson);
    }
    return map;
  }, [allGameLessons]);

  // Overall stats
  const totalLessons = allGameLessons.length;
  const completedCount = useMemo(() => allGameLessons.filter(l => completedLessonIds.has(l.id)).length, [allGameLessons, completedLessonIds]);
  const progressPercent = totalLessons ? Math.round(completedCount / totalLessons * 100) : 0;

  // Game stats
  const xp = completedCount * 25 + submissions.length * 5;
  const currentLevel = getLevel(xp);
  const nextLevel = getNextLevel(xp);
  const xpForNext = nextLevel ? nextLevel.minXP - xp : 0;
  const xpInLevel = nextLevel ? xp - currentLevel.minXP : 0;
  const xpRange = nextLevel ? nextLevel.minXP - currentLevel.minXP : 1;
  const levelProgress = Math.min(100, Math.round((xpInLevel / xpRange) * 100));

  const streak = useMemo(() => {
    if (!submissions.length) return 0;
    const dates = [...new Set(submissions.map(s => new Date(s.submittedAt).toDateString()))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    let count = 0;
    const today = new Date();
    for (let i = 0; i < dates.length; i++) {
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      if (dates[i] === expected.toDateString()) count++;
      else break;
    }
    return count;
  }, [submissions]);

  const bestScore = useMemo(() => {
    if (!submissions.length) return 0;
    return Math.max(...submissions.map(s => s.totalScore));
  }, [submissions]);

  const toggleGrade = (g: number) => {
    setExpandedGrades(prev => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g);
      else next.add(g);
      return next;
    });
  };

  return (
    <div id="lesson-list-view" className="space-y-6">
      {/* ── Game Hero Banner ── */}
      <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-8 text-6xl">🎯</div>
          <div className="absolute top-12 right-12 text-5xl">⚡</div>
          <div className="absolute bottom-4 left-1/3 text-4xl">🔥</div>
          <div className="absolute bottom-8 right-1/4 text-5xl">✨</div>
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold mb-3 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Toán 6–12 • Chương trình GDPT 2018</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {student ? `${currentLevel.icon} ${currentLevel.name}` : "Hệ Thống Luyện Tập Toán"}
            </h1>
            {student && (
              <p className="text-sm text-purple-100 mt-1.5">
                Chào {student.studentName}! Hoàn thành {totalLessons - completedCount} bài nữa để trở thành Huyền thoại! 🚀
              </p>
            )}
          </div>
          {student && (
            <div className="bg-white/10 border border-white/20 rounded-2xl p-4 min-w-[240px] backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-purple-200">Cấp {currentLevel.level}</span>
                <span className="text-xs font-bold text-amber-300">{xp} XP</span>
              </div>
              <div className="w-full bg-black/30 h-3 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all duration-1000" style={{ width: `${levelProgress}%` }} />
              </div>
              {nextLevel && <p className="text-[10px] text-purple-200 mt-1.5 text-right">{xpInLevel}/{xpRange} XP đến cấp tiếp</p>}
            </div>
          )}
        </div>
      </div>

      {/* ── Stats Row ── */}
      {student && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-sky-100 flex items-center justify-center"><BookOpen className="w-5 h-5 text-sky-600" /></div>
            <p className="text-2xl font-black text-sky-700">{completedCount}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase">Bài xong</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-amber-100 flex items-center justify-center"><Zap className="w-5 h-5 text-amber-600" /></div>
            <p className="text-2xl font-black text-amber-600">{xp}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase">Tổng XP</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-orange-100 flex items-center justify-center"><Flame className="w-5 h-5 text-orange-600" /></div>
            <p className="text-2xl font-black text-orange-600">{streak}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase">Ngày liên tiếp</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-emerald-100 flex items-center justify-center"><Target className="w-5 h-5 text-emerald-600" /></div>
            <p className="text-2xl font-black text-emerald-600">{bestScore > 0 ? bestScore.toFixed(1) : "—"}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase">Điểm cao nhất</p>
          </div>
        </div>
      )}

      {/* ── Achievement Badges ── */}
      {student && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-500" /> Huy hiệu</h3>
          <div className="flex flex-wrap gap-3">
            {[
              { icon: "🌱", label: "Bắt đầu", condition: true },
              { icon: "📝", label: "Bài đầu tiên", condition: completedCount >= 1 },
              { icon: "🔥", label: "3 ngày liên tiếp", condition: streak >= 3 },
              { icon: "⭐", label: "5 bài hoàn thành", condition: completedCount >= 5 },
              { icon: "🎯", label: "Điểm 10", condition: bestScore >= 10 },
              { icon: "🏆", label: "10 bài hoàn thành", condition: completedCount >= 10 },
              { icon: "👑", label: "Cấp 3", condition: currentLevel.level >= 3 },
              { icon: "💎", label: "Hoàn thành nửa chặng", condition: progressPercent >= 50 },
            ].map((badge, i) => (
              <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${badge.condition ? "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 text-amber-800 shadow-sm" : "bg-slate-50 border-slate-200 text-slate-400 opacity-50"}`}>
                <span className="text-lg">{badge.icon}</span>
                <span>{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Quick Formulas ── */}
      {student && quickFormulas.length > 0 && (
        <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="font-extrabold text-lg flex items-center gap-2"><Calculator className="w-5 h-5 text-amber-500" /> Công thức nhanh</h2>
              <p className="text-xs text-slate-500 mt-1">Một số công thức nên nhớ.</p>
            </div>
            <button onClick={() => window.dispatchEvent(new CustomEvent("open-formulas"))} className="text-xs font-bold text-sky-600 hover:text-sky-800">Xem tất cả →</button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {quickFormulas.map(f => (
              <div key={f.id} className="rounded-xl border border-slate-200 p-3 bg-slate-50 hover:bg-sky-50 hover:border-sky-200 transition-colors">
                <div className="text-xs font-bold text-slate-800 line-clamp-2">{f.title}</div>
                <div className="mt-2 text-base font-semibold text-indigo-700 overflow-x-auto">{f.formula}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Search ── */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Tìm tên bài hoặc chương..." className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500" />
      </div>

      {/* ── Game Path: All Grades 6→12 ── */}
      <div className="relative">
        {/* Vertical connector line */}
        <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-300 via-blue-400 to-amber-400 rounded-full hidden sm:block" />

        <div className="space-y-6">
          {GRADE_OPTIONS.map((grade) => {
            const gradeLessons = lessonsByGrade.get(grade) || [];
            const config = LEVEL_CONFIG[grade];
            const gradeCompleted = gradeLessons.filter(l => completedLessonIds.has(l.id)).length;
            const gradeTotal = gradeLessons.length;
            const isExpanded = expandedGrades.has(grade);
            const gradeProgress = gradeTotal ? Math.round(gradeCompleted / gradeTotal * 100) : 0;

            // Filter by search
            const filtered = searchQuery
              ? gradeLessons.filter(l => {
                  const q = searchQuery.toLowerCase();
                  return l.title.toLowerCase().includes(q) || `Bài ${l.lessonNumber}`.toLowerCase().includes(q) || l.chapter.toLowerCase().includes(q);
                })
              : gradeLessons;

            return (
              <div key={grade} className="relative sm:pl-16">
                {/* Level node on the path */}
                <div className="hidden sm:flex absolute left-0 top-0 z-10">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl ${config.bg} ${config.border} border-2 flex items-center justify-center text-2xl shadow-md`}>
                    {config.icon}
                  </div>
                </div>

                {/* Level Header (clickable) */}
                <button
                  onClick={() => toggleGrade(grade)}
                  className={`w-full text-left rounded-2xl border-2 ${config.border} ${config.bg} p-4 sm:p-5 flex items-center gap-4 transition-all hover:shadow-md cursor-pointer`}
                >
                  <div className="sm:hidden w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm shrink-0">
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className={`text-base sm:text-lg font-extrabold ${config.color}`}>
                        Tầng {grade} — Lớp {grade}
                      </h2>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/60 ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {gradeCompleted}/{gradeTotal} bài hoàn thành
                    </p>
                    <div className="w-full bg-white/60 h-2 rounded-full mt-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500" style={{ width: `${gradeProgress}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {gradeTotal > 0 && gradeCompleted === gradeTotal && (
                      <span className="text-lg">✅</span>
                    )}
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </div>
                </button>

                {/* Lessons Grid */}
                {isExpanded && (
                  <div className="mt-3 ml-4 sm:ml-0">
                    {filtered.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map(lesson => {
                          const lessonQuestions = questions.filter(q => q.lessonId === lesson.id);
                          const hasDraft = Boolean(storageService.getActiveDraft(lesson.id));
                          return (
                            <LessonCard
                              key={lesson.id}
                              lesson={lesson}
                              questions={lessonQuestions}
                              submissions={submissions}
                              hasDraft={hasDraft}
                              onStartLesson={onStartLesson}
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-white/50 rounded-xl border border-dashed border-slate-300 p-6 text-center">
                        <MapPin className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-400">
                          {searchQuery ? "Không tìm thấy bài phù hợp" : "Lớp này chưa có bài học"}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Total Progress Bar ── */}
      {student && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-slate-700">🎯 Tổng tiến độ</span>
            <span className="text-sm font-bold text-emerald-600">{completedCount}/{totalLessons} ({progressPercent}%)</span>
          </div>
          <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 h-full rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400">
            <span>🌱 Lớp 6</span>
            <span>🏆 Lớp 12</span>
          </div>
        </div>
      )}

      {/* ── Search Result Count ── */}
      {searchQuery && (
        <p className="text-xs text-slate-400 text-center">
          Tìm thấy {allGameLessons.filter(l => {
            const q = searchQuery.toLowerCase();
            return l.title.toLowerCase().includes(q) || `Bài ${l.lessonNumber}`.toLowerCase().includes(q) || l.chapter.toLowerCase().includes(q);
          }).length} bài phù hợp với "{searchQuery}"
        </p>
      )}
    </div>
  );
}
