import { useState, useMemo, useEffect } from "react";
import { Search, BookOpen, Sparkles, Calculator } from "lucide-react";
import { Lesson, Question, SubmissionResult, StudentProfile, Formula } from "../../types";
import { LessonCard } from "./LessonCard";
import { GRADE_OPTIONS } from "../../config/appConfig";

interface LessonListViewProps { lessons: Lesson[]; questions: Question[]; submissions: SubmissionResult[]; student: StudentProfile | null; onStartLesson: (lesson: Lesson, isRetake?: boolean) => void; onOpenStudentModal: () => void; }

export function LessonListView({ lessons, questions, submissions, student, onStartLesson, onOpenStudentModal }: LessonListViewProps) {
  const [selectedGrade, setSelectedGrade] = useState<number>((student?.grade || 6) as number);
  const [selectedSemester, setSelectedSemester] = useState<1 | 2>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("ALL");
  const [quickFormulas, setQuickFormulas] = useState<Formula[]>([]);

  useEffect(() => { if (student?.grade) setSelectedGrade(student.grade); }, [student?.grade]);
  useEffect(() => {
    const grade = Number(student?.grade || selectedGrade);
    void fetch(`/api/formulas?grade=${grade}`).then(r => r.json()).then(j => setQuickFormulas(j.success ? (j.data || []).slice(0, 4) : [])).catch(() => setQuickFormulas([]));
  }, [student?.grade, selectedGrade]);

  const completedLessonIds = useMemo(() => new Set(submissions.map(s => s.lessonId)), [submissions]);
  const currentGradeNextLessonNumber = useMemo(() => {
    if (!student?.grade) return 1;
    const current = lessons.filter(l => (l.grade || 6) === student.grade && !l.isHidden).sort((a,b) => a.lessonNumber-b.lessonNumber);
    return current.find(l => !completedLessonIds.has(l.id))?.lessonNumber ?? Number.POSITIVE_INFINITY;
  }, [lessons, student?.grade, completedLessonIds]);
  const gradeLessons = useMemo(() => lessons.filter(l => (l.grade || 6) === selectedGrade && !l.isHidden), [lessons, selectedGrade]);
  const semesterLessons = useMemo(() => gradeLessons.filter(l => l.semester === selectedSemester), [gradeLessons, selectedSemester]);
  const chapters = useMemo(() => Array.from(new Set(semesterLessons.map(l => l.chapter))), [semesterLessons]);
  const filteredLessons = useMemo(() => semesterLessons.filter(lesson => {
    const matchChapter = selectedChapter === "ALL" || lesson.chapter === selectedChapter; const q = searchQuery.toLowerCase();
    const matchQuery = !q || lesson.title.toLowerCase().includes(q) || `Bài ${lesson.lessonNumber}`.toLowerCase().includes(q) || lesson.chapter.toLowerCase().includes(q);
    return matchChapter && matchQuery;
  }), [semesterLessons, selectedChapter, searchQuery]);
  const completedCount = useMemo(() => gradeLessons.filter(l => completedLessonIds.has(l.id)).length, [gradeLessons, completedLessonIds]);
  const progressPercent = gradeLessons.length ? Math.round(completedCount / gradeLessons.length * 100) : 0;

  return <div id="lesson-list-view" className="space-y-6">
    <div className="bg-gradient-to-r from-sky-700 via-sky-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden"><div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6"><div><div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold mb-3 border border-white/20"><Sparkles className="w-3.5 h-3.5 text-amber-300"/><span>Chương trình GDPT 2018 • Toán {student?.grade || selectedGrade}</span></div><h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{student ? `Chào ${student.studentName} (Lớp ${student.className})!` : "Hệ Thống Luyện Tập Toán"}</h1><p className="text-sm text-sky-100 mt-1.5 max-w-2xl leading-relaxed">{student ? `Nội dung khối ${student.grade}: bài đang học mở theo thứ tự; khối thấp hơn được tra cứu, khối cao hơn bị khóa.` : "Mở link lớp giáo viên gửi để bắt đầu học."}</p></div><div className="bg-white/10 border border-white/20 rounded-2xl p-4 min-w-[220px] flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-white text-sky-700 flex items-center justify-center font-black text-lg">{completedCount}</div><div><p className="text-xs text-sky-100 font-medium">Tiến độ khối {selectedGrade}</p><p className="text-sm font-bold text-white">{completedCount}/{gradeLessons.length} bài hoàn thành</p><div className="w-full bg-black/20 h-1.5 rounded-full mt-1.5 overflow-hidden"><div className="bg-emerald-400 h-full rounded-full" style={{width:`${progressPercent}%`}}/></div></div></div></div></div>

    {student && quickFormulas.length > 0 && <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"><div className="flex items-center justify-between gap-3 mb-4"><div><h2 className="font-extrabold text-lg flex items-center gap-2"><Calculator className="w-5 h-5 text-amber-500"/> Công thức nhanh khối {student.grade}</h2><p className="text-xs text-slate-500 mt-1">Một số công thức nên nhớ. Mở mục Công thức để tra cứu đầy đủ.</p></div><button onClick={() => window.dispatchEvent(new CustomEvent("open-formulas"))} className="text-xs font-bold text-sky-600 hover:text-sky-800">Xem tất cả →</button></div><div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">{quickFormulas.map(f => <div key={f.id} className="rounded-xl border border-slate-200 p-3 bg-slate-50"><div className="text-xs font-bold text-slate-800 line-clamp-2">{f.title}</div><div className="mt-2 text-base font-semibold text-indigo-700 overflow-x-auto">{f.formula}</div></div>)}</div></section>}

    <div className="flex flex-wrap items-center gap-2"><span className="text-xs font-bold text-slate-600 mr-1">Tra cứu khối:</span><div className="flex bg-slate-200/80 p-1 rounded-xl overflow-x-auto">{GRADE_OPTIONS.map((grade) => <button key={grade} onClick={() => {setSelectedGrade(grade);setSelectedChapter("ALL");setSearchQuery("");}} className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${selectedGrade===grade?"bg-white text-sky-700 shadow-xs":"text-slate-600 hover:text-slate-900"}`}>Lớp {grade}{student && grade>Number(student.grade||6)?" 🔒":""}</button>)}</div></div>
    {!student && <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900 flex items-center justify-between gap-3"><span>Hãy vào lớp bằng link giáo viên gửi để hệ thống xác định khối và mở bài đúng thứ tự.</span><button onClick={onOpenStudentModal} className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs">VÀO LỚP</button></div>}
    <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between"><div className="flex bg-slate-200/80 p-1 rounded-xl w-full sm:w-auto"><button onClick={()=>{setSelectedSemester(1);setSelectedChapter("ALL");}} className={`flex-1 sm:flex-none px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold ${selectedSemester===1?"bg-white text-sky-700 shadow-xs":"text-slate-600"}`}>HỌC KÌ I</button><button onClick={()=>{setSelectedSemester(2);setSelectedChapter("ALL");}} className={`flex-1 sm:flex-none px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold ${selectedSemester===2?"bg-white text-sky-700 shadow-xs":"text-slate-600"}`}>HỌC KÌ II</button></div><div className="relative flex-1 max-w-md"><Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"/><input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Tìm tên bài hoặc chương..." className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"/></div></div>
    {chapters.length>1 && <div className="flex items-center gap-2 overflow-x-auto pb-2"><button onClick={()=>setSelectedChapter("ALL")} className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${selectedChapter==="ALL"?"bg-slate-900 text-white":"bg-slate-100 text-slate-600"}`}>Tất cả ({semesterLessons.length})</button>{chapters.map(c=><button key={c} onClick={()=>setSelectedChapter(c)} className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${selectedChapter===c?"bg-sky-600 text-white":"bg-slate-100 text-slate-600"}`}>{c}</button>)}</div>}
    {selectedGrade === Number(student?.grade || selectedGrade) && currentGradeNextLessonNumber !== Infinity && <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 text-xs text-sky-900 flex items-center gap-3"><BookOpen className="w-5 h-5 text-sky-600"/><span>Bài tiếp theo được mở theo thứ tự là <b>Bài {currentGradeNextLessonNumber}</b>. Hoàn thành bài trước để mở bài tiếp theo.</span></div>}
    {filteredLessons.length ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">{filteredLessons.map(lesson=>{const lessonQuestions=questions.filter(q=>q.lessonId===lesson.id);const hasDraft=Boolean(storageService.getActiveDraft(lesson.id));const grade=lesson.grade||6;const studentGrade=Number(student?.grade||grade);const currentSequentialLocked=Boolean(student&&grade===studentGrade&&lesson.lessonNumber>currentGradeNextLessonNumber&&!completedLessonIds.has(lesson.id));const effectiveLocked=Boolean(lesson.isLocked)||Boolean(student&&grade>studentGrade)||currentSequentialLocked;return <LessonCard key={lesson.id} lesson={{...lesson,isLocked:effectiveLocked}} questions={lessonQuestions} submissions={submissions} hasDraft={hasDraft} onStartLesson={onStartLesson}/>;})}</div> : <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center"><BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3"/><h3 className="text-base font-bold text-slate-700">Không tìm thấy bài học</h3><p className="text-xs text-slate-400 mt-1">Hãy đổi khối, học kì hoặc từ khóa.</p></div>}
  </div>;
}
