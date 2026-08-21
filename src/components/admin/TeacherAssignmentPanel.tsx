import { useState, useEffect } from "react";
import { ClipboardList, Check, BookOpen, ChevronDown, ChevronRight, FileCheck2, Shuffle, Eye } from "lucide-react";
import { Lesson, Assignment, Question } from "../../types";
import { authService } from "../../services/authService";

interface TeacherClass { id: string; name: string; classCode: string; grade: number; studentCount: number; }

interface TeacherAssignmentPanelProps {
  lessons: Lesson[];
  questions: Question[];
  assignments: Assignment[];
  authSession: { username: string; displayName: string } | null;
  onSaveAssignment: (assignment: Assignment) => void;
  onDeleteAssignment: (id: string) => void;
  onOpenExamEditor?: (lessonId: string, classNames: string[]) => void;
}

export function TeacherAssignmentPanel({
  lessons,
  questions,
  assignments,
  authSession,
  onSaveAssignment,
  onDeleteAssignment,
  onOpenExamEditor,
}: TeacherAssignmentPanelProps) {
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  // Fetch teacher's classes from API
  useEffect(() => {
    async function load() {
      setLoadingClasses(true);
      try {
        const r = await fetch("/api/classes", { headers: authService.headers() });
        const j = await r.json();
        if (r.ok) setClasses(j.data || []);
      } catch {}
      setLoadingClasses(false);
    }
    load();
  }, []);

  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const selectedLesson = lessons.find((l) => l.id === selectedLessonId);
  const lessonQuestions = selectedLesson ? questions.filter((q) => q.lessonId === selectedLesson.id) : [];
  const classAssignment = selectedClass ? assignments.find((a) => a.className === selectedClass.name) : null;

  // Handle create assignment from selected lesson
  const handleAssignFromLesson = (lesson: Lesson) => {
    if (!selectedClass) return;
    const assignment: Assignment = {
      id: `asgn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      className: selectedClass.name,
      teacherUsername: authSession?.username || "",
      teacherName: authSession?.displayName || "",
      lessonIds: [lesson.id],
      examIds: [],
      createdAt: new Date().toISOString(),
      randomized: true, // Every student gets same knowledge, random order
    };
    onSaveAssignment(assignment);
  };

  // Open exam editor from a lesson's questions
  const handleCreateExamFromLesson = (lesson: Lesson) => {
    if (onOpenExamEditor) {
      onOpenExamEditor(lesson.id, selectedClass ? [selectedClass.name] : []);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center gap-3 mb-2">
          <ClipboardList className="w-5 h-5 text-amber-600" />
          <h2 className="text-lg font-extrabold text-slate-900">Giao bài tập cho lớp</h2>
        </div>
        <p className="text-xs text-slate-500">Chọn lớp → chọn bài → tạo bài kiểm tra hoặc giao trực tiếp. Mỗi HS làm bài giống nhau về kiến thức nhưng thứ tự câu random.</p>
      </div>

      {/* Step 1: Chọn lớp */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">① Chọn lớp</h3>
        {loadingClasses ? (
          <p className="text-xs text-slate-400">Đang tải danh sách lớp...</p>
        ) : classes.length === 0 ? (
          <p className="text-xs text-slate-400">Bạn chưa tạo lớp nào. Vào "Quản lý lớp" để tạo.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {classes.map((cls) => (
              <button
                key={cls.id}
                onClick={() => { setSelectedClassId(cls.id); setSelectedLessonId(null); }}
                className={`p-3 rounded-xl text-left transition-all border-2 ${
                  selectedClassId === cls.id
                    ? "bg-amber-50 border-amber-400 shadow-sm"
                    : "bg-slate-50 border-transparent hover:bg-slate-100"
                }`}
              >
                <p className="text-sm font-bold text-slate-900">{cls.name}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Khối {cls.grade} • {cls.studentCount} HS</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Step 2: Chọn bài (chỉ hiện khi đã chọn lớp) */}
      {selectedClass && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">② Chọn bài học để giao cho lớp {selectedClass.name}</h3>

          {/* Current assignment info */}
          {classAssignment && (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-xs font-bold text-amber-800">Đã giao {classAssignment.lessonIds.length} bài</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {classAssignment.lessonIds.map((lid) => {
                  const l = lessons.find((x) => x.id === lid);
                  return l ? (
                    <span key={lid} className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-lg">
                      Bài {l.lessonNumber}: {l.title}
                    </span>
                  ) : null;
                })}
              </div>
              <button onClick={() => onDeleteAssignment(classAssignment.id)} className="mt-2 text-[10px] text-rose-500 hover:text-rose-700 font-bold">Xóa bài giao</button>
            </div>
          )}

          {lessons.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">Chưa có bài học. Vào "Quản lý bài học" để tải lên.</p>
          ) : (
            <div className="max-h-[500px] overflow-y-auto space-y-2">
              {[...lessons].sort((a, b) => a.lessonNumber - b.lessonNumber).map((lesson) => {
                const qCount = questions.filter((q) => q.lessonId === lesson.id).length;
                const isSelected = selectedLessonId === lesson.id;

                return (
                  <div key={lesson.id} className={`rounded-xl border transition-all ${isSelected ? "border-amber-400 bg-amber-50/50 shadow-sm" : "border-slate-200 hover:border-slate-300"}`}>
                    <button
                      onClick={() => setSelectedLessonId(isSelected ? null : lesson.id)}
                      className="w-full text-left px-4 py-3 flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-black text-slate-700 shrink-0">
                        {lesson.lessonNumber}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{lesson.title}</p>
                        <p className="text-[10px] text-slate-500">{lesson.chapter} • {qCount} câu hỏi • {lesson.isLocked ? "🔒 Khóa" : "✅ Mở"}</p>
                      </div>
                      {isSelected ? <ChevronDown className="w-4 h-4 text-amber-600 shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
                    </button>

                    {/* Expanded: action buttons */}
                    {isSelected && (
                      <div className="px-4 pb-4 space-y-2">
                        <p className="text-[10px] text-slate-500 font-medium">Chọn thao tác:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {/* Tạo bài kiểm tra từ bài giảng */}
                          <button
                            onClick={() => handleCreateExamFromLesson(lesson)}
                            disabled={qCount === 0}
                            className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FileCheck2 className="w-5 h-5 text-blue-600 shrink-0" />
                            <div>
                              <p className="text-xs font-bold text-blue-800">Tạo bài kiểm tra từ bài giảng</p>
                              <p className="text-[10px] text-blue-500">{qCount} câu hỏi sẵn có</p>
                            </div>
                          </button>

                          {/* Giao bài trực tiếp (random) */}
                          <button
                            onClick={() => handleAssignFromLesson(lesson)}
                            disabled={lesson.isLocked}
                            className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Shuffle className="w-5 h-5 text-emerald-600 shrink-0" />
                            <div>
                              <p className="text-xs font-bold text-emerald-800">Giao bài trực tiếp (Random)</p>
                              <p className="text-[10px] text-emerald-500">HS cùng kiến thức, thứ tự câu random</p>
                            </div>
                          </button>
                        </div>
                        {lesson.isLocked && (
                          <p className="text-[10px] text-amber-600 font-medium">⚠️ Bài này đang khóa. Mở khóa để giao cho HS.</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
