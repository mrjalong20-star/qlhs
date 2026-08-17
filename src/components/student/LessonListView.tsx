import { useState, useMemo } from "react";
import { Search, BookOpen, Sparkles } from "lucide-react";
import { Lesson, Question, SubmissionResult, StudentProfile } from "../../types";
import { LessonCard } from "./LessonCard";
import { storageService } from "../../services/storageService";
import { GRADE_OPTIONS } from "../../config/appConfig";

interface LessonListViewProps {
  lessons: Lesson[];
  questions: Question[];
  submissions: SubmissionResult[];
  student: StudentProfile | null;
  onStartLesson: (lesson: Lesson, isRetake?: boolean) => void;
  onOpenStudentModal: () => void;
}

export function LessonListView({
  lessons,
  questions,
  submissions,
  student,
  onStartLesson,
  onOpenStudentModal,
}: LessonListViewProps) {
  const [selectedGrade, setSelectedGrade] = useState<number>(11);
  const [selectedSemester, setSelectedSemester] = useState<1 | 2>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChapter, setSelectedChapter] = useState<string>("ALL");

  // Get lessons for selected grade
  const gradeLessons = useMemo(
    () => lessons.filter((l) => (l.grade || 11) === selectedGrade && !l.isHidden),
    [lessons, selectedGrade]
  );

  // Get distinct chapters for active semester
  const semesterLessons = useMemo(
    () => gradeLessons.filter((l) => l.semester === selectedSemester),
    [gradeLessons, selectedSemester]
  );

  const chapters = useMemo(() => {
    const set = new Set(semesterLessons.map((l) => l.chapter));
    return Array.from(set);
  }, [semesterLessons]);

  // Filter lessons
  const filteredLessons = useMemo(() => {
    return semesterLessons.filter((lesson) => {
      const matchChapter = selectedChapter === "ALL" || lesson.chapter === selectedChapter;
      const matchQuery =
        !searchQuery ||
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `Bài ${lesson.lessonNumber}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.chapter.toLowerCase().includes(searchQuery.toLowerCase());
      return matchChapter && matchQuery;
    });
  }, [semesterLessons, selectedChapter, searchQuery]);

  // Progress metrics
  const completedCount = useMemo(() => {
    const completedLessonIds = new Set(submissions.map((s) => s.lessonId));
    return gradeLessons.filter((l) => completedLessonIds.has(l.id)).length;
  }, [gradeLessons, submissions]);

  const progressPercent =
    gradeLessons.length > 0 ? Math.round((completedCount / gradeLessons.length) * 100) : 0;

  return (
    <div id="lesson-list-view" className="space-y-6">
      {/* Student Welcome & Progress Overview Banner */}
      <div className="bg-gradient-to-r from-sky-700 via-sky-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-3 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Chương trình GDPT 2018 • Toán {selectedGrade}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {student ? `Chào ${student.studentName} (Lớp ${student.className})!` : "Hệ Thống Luyện Tập Toán"}
            </h1>
            <p className="text-sm text-sky-100 mt-1.5 max-w-2xl leading-relaxed">
              Luyện tập theo từng bài học SGK Toán lớp {selectedGrade} với cấu trúc trắc nghiệm: Nhiều lựa chọn, Đúng/Sai và Trả lời ngắn.
            </p>
          </div>

          {/* Quick Progress Ring / Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 min-w-[220px] flex items-center gap-4 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-white text-sky-700 flex items-center justify-center font-black text-lg shadow-md">
              {completedCount}
            </div>
            <div>
              <p className="text-xs text-sky-100 font-medium">Tiến độ lớp {selectedGrade}</p>
              <p className="text-sm font-bold text-white">
                {completedCount}/{gradeLessons.length} bài hoàn thành
              </p>
              <div className="w-full bg-black/20 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grade Selector */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-600 mr-1">Chọn lớp:</span>
        <div className="flex bg-slate-200/80 p-1 rounded-xl overflow-x-auto">
          {GRADE_OPTIONS.map((grade) => (
            <button
              key={grade}
              onClick={() => {
                setSelectedGrade(grade);
                setSelectedChapter("ALL");
                setSearchQuery("");
              }}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                selectedGrade === grade
                  ? "bg-white text-sky-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Lớp {grade}
            </button>
          ))}
        </div>
      </div>

      {/* Controls Bar: Semester Selector & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Semester Buttons */}
        <div id="semester-toggle-group" className="flex bg-slate-200/80 p-1 rounded-xl w-full sm:w-auto">
          <button
            id="btn-semester-1"
            onClick={() => {
              setSelectedSemester(1);
              setSelectedChapter("ALL");
            }}
            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              selectedSemester === 1
                ? "bg-white text-sky-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            HỌC KÌ I
          </button>
          <button
            id="btn-semester-2"
            onClick={() => {
              setSelectedSemester(2);
              setSelectedChapter("ALL");
            }}
            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              selectedSemester === 2
                ? "bg-white text-sky-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            HỌC KÌ II
          </button>
        </div>

        {/* Search Box */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-lessons"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên bài học hoặc chương..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-800 shadow-2xs"
          />
        </div>
      </div>

      {/* Chapter Filter Chips */}
      {chapters.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedChapter("ALL")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedChapter === "ALL"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Tất cả các chương ({semesterLessons.length})
          </button>
          {chapters.map((chapter) => (
            <button
              key={chapter}
              onClick={() => setSelectedChapter(chapter)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedChapter === chapter
                  ? "bg-sky-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {chapter}
            </button>
          ))}
        </div>
      )}

      {/* Grid of Lessons */}
      {filteredLessons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLessons.map((lesson) => {
            const lessonQuestions = questions.filter((q) => q.lessonId === lesson.id);
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
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Không tìm thấy bài học phù hợp</h3>
          <p className="text-xs text-slate-400 mt-1">
            Hãy thử tìm kiếm với từ khóa khác hoặc chuyển sang Học kì khác.
          </p>
        </div>
      )}
    </div>
  );
}