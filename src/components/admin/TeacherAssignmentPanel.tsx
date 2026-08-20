import { useState } from "react";
import { ClipboardList, Check, X, BookOpen, ChevronDown, ChevronUp, BarChart3, Users, Award } from "lucide-react";
import { Lesson, Assignment, SubmissionResult } from "../../types";

interface TeacherAssignmentPanelProps {
  lessons: Lesson[];
  assignments: Assignment[];
  classNames: string[];
  submissions: SubmissionResult[];
  authSession: { username: string; displayName: string } | null;
  onSaveAssignment: (assignment: Assignment) => void;
  onDeleteAssignment: (id: string) => void;
}

export function TeacherAssignmentPanel({
  lessons,
  assignments,
  classNames,
  submissions,
  authSession,
  onSaveAssignment,
  onDeleteAssignment,
}: TeacherAssignmentPanelProps) {
  const [selectedClass, setSelectedClass] = useState(classNames[0] || "");
  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [expandedClass, setExpandedClass] = useState<string | null>(null);

  const toggleLesson = (id: string) => {
    setSelectedLessonIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAssign = () => {
    if (!selectedClass || selectedLessonIds.length === 0) return;
    const assignment: Assignment = {
      id: `asgn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      className: selectedClass,
      teacherUsername: authSession?.username || "",
      teacherName: authSession?.displayName || "",
      lessonIds: selectedLessonIds,
      examIds: [],
      note: note.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    onSaveAssignment(assignment);
    setSelectedLessonIds([]);
    setNote("");
  };

  const groupedByClass = classNames.map((cn) => ({
    className: cn,
    assignment: assignments.find((a) => a.className === cn) || null,
  }));

  const sortedLessons = [...lessons]
    .filter((l) => !l.isHidden)
    .sort((a, b) => a.lessonNumber - b.lessonNumber);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <ClipboardList className="w-6 h-6" />
          <h2 className="text-lg font-extrabold">Giao bài tập cho lớp</h2>
        </div>
        <p className="text-sm text-amber-100">
          Chọn lớp và chọn bài muốn giao. Học sinh sẽ thấy bài tập cần hoàn thành trước khi học bài khác.
        </p>
      </div>

      {/* Class selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Chọn lớp
        </label>
        <div className="relative">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-900 appearance-none cursor-pointer"
          >
            {classNames.length === 0 && <option value="">Chưa có lớp nào</option>}
            {classNames.map((cn) => (
              <option key={cn} value={cn}>{cn}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Lesson picker */}
      {selectedClass && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Chọn bài muốn giao ({selectedLessonIds.length} đã chọn)
            </label>
            <button
              onClick={() =>
                setSelectedLessonIds(
                  selectedLessonIds.length === sortedLessons.length
                    ? []
                    : sortedLessons.map((l) => l.id)
                )
              }
              className="text-xs font-bold text-amber-600 hover:text-amber-800"
            >
              {selectedLessonIds.length === sortedLessons.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto space-y-1.5 pr-1">
            {sortedLessons.map((lesson) => {
              const selected = selectedLessonIds.includes(lesson.id);
              return (
                <button
                  key={lesson.id}
                  onClick={() => toggleLesson(lesson.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm flex items-center gap-3 transition-all ${
                    selected
                      ? "bg-amber-50 border-2 border-amber-400 text-amber-900"
                      : "bg-slate-50 border-2 border-transparent hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
                      selected ? "bg-amber-500 border-amber-500" : "border-slate-300"
                    }`}
                  >
                    {selected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="font-bold text-xs text-slate-400 w-8 shrink-0">
                    {lesson.lessonNumber}
                  </span>
                  <span className="font-semibold truncate">{lesson.title}</span>
                  <span className="text-xs text-slate-400 shrink-0">{lesson.chapter}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Note */}
      {selectedLessonIds.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Ghi chú (tùy chọn)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ví dụ: Hoàn thành trước thứ 6..."
            className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      )}

      {/* Submit */}
      {selectedLessonIds.length > 0 && (
        <button
          onClick={handleAssign}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
        >
          <ClipboardList className="w-4 h-4" />
          GIAO {selectedLessonIds.length} BÀI CHO LỚP {selectedClass}
        </button>
      )}

      {/* Current assignments list */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="text-sm font-bold text-slate-700 mb-3">Bài tập đã giao</h3>
        {groupedByClass.filter((g) => g.assignment).length === 0 ? (
          <p className="text-xs text-slate-400">Chưa giao bài tập cho lớp nào.</p>
        ) : (
          <div className="space-y-2">
            {groupedByClass
              .filter((g) => g.assignment)
              .map(({ className: cn, assignment }) => {
                const isExpanded = expandedClass === cn;
                const asgn = assignment!;
                return (
                  <div key={cn} className="border border-slate-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedClass(isExpanded ? null : cn)}
                      className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-bold text-slate-800">{cn}</span>
                        <span className="text-xs text-slate-500">
                          • {asgn.lessonIds.length} bài
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="p-4 space-y-3">
                        <div className="flex flex-wrap gap-1.5">
                          {asgn.lessonIds.map((lid) => {
                            const l = lessons.find((x) => x.id === lid);
                            return l ? (
                              <span
                                key={lid}
                                className="px-2 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold rounded-lg"
                              >
                                Bài {l.lessonNumber}: {l.title}
                              </span>
                            ) : null;
                          })}
                        </div>
                        {asgn.note && (
                          <p className="text-xs text-slate-500 italic">📝 {asgn.note}</p>
                        )}
                        <p className="text-[10px] text-slate-400">
                          Giao lúc: {new Date(asgn.createdAt).toLocaleString("vi-VN")}
                        </p>
                        <button
                          onClick={() => onDeleteAssignment(asgn.id)}
                          className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          Xóa assignment
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* ── Class Scores ── */}
      {selectedClass && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-sky-600" /> Bảng điểm lớp {selectedClass}
          </h3>
          {(() => {
            const classSubs = submissions.filter(
              (s) => s.className === selectedClass
            );
            if (classSubs.length === 0) {
              return (
                <p className="text-xs text-slate-400 text-center py-6">
                  Chưa có kết quả bài làm cho lớp này.
                </p>
              );
            }

            // Group by student — keep each submission individually
            const studentMap = new Map<
              string,
              { name: string; subs: typeof classSubs }
            >();
            for (const s of classSubs) {
              const key = s.studentName.trim().toLowerCase();
              const existing = studentMap.get(key);
              if (existing) {
                existing.subs.push(s);
              } else {
                studentMap.set(key, { name: s.studentName, subs: [s] });
              }
            }

            const studentRows = Array.from(studentMap.values())
              .map((row) => {
                const scores = row.subs.map((s) => s.totalScore);
                const total = scores.reduce((a, b) => a + b, 0);
                return {
                  name: row.name,
                  subs: row.subs.sort(
                    (a, b) =>
                      new Date(b.submittedAt).getTime() -
                      new Date(a.submittedAt).getTime()
                  ),
                  total,
                  avg: scores.length ? total / scores.length : 0,
                  best: Math.max(...scores),
                  count: scores.length,
                };
              })
              .sort((a, b) => b.total - a.total);

            const classAvg = studentRows.length
              ? studentRows.reduce((a, r) => a + r.avg, 0) /
                studentRows.length
              : 0;

            return (
              <>
                {/* Summary cards */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="bg-sky-50 rounded-xl p-3 text-center">
                    <Users className="w-4 h-4 text-sky-600 mx-auto mb-1" />
                    <p className="text-lg font-black text-sky-700">
                      {studentRows.length}
                    </p>
                    <p className="text-[10px] text-sky-600 font-bold">
                      Học sinh
                    </p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-3 text-center">
                    <Award className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                    <p className="text-lg font-black text-emerald-700">
                      {classAvg.toFixed(1)}
                    </p>
                    <p className="text-[10px] text-emerald-600 font-bold">
                      Điểm TB lớp
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3 text-center">
                    <BarChart3 className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                    <p className="text-lg font-black text-amber-700">
                      {classSubs.length}
                    </p>
                    <p className="text-[10px] text-amber-600 font-bold">
                      Lần nộp bài
                    </p>
                  </div>
                </div>

                {/* Compact list */}
                <div className="divide-y divide-slate-100">
                  {studentRows.map((row, i) => (
                    <div key={i} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400 w-5">{i + 1}.</span>
                          <span className="text-sm font-bold text-slate-900">{row.name}</span>
                          <span className="text-[10px] text-slate-400">({row.count} bài)</span>
                        </div>
                        <span className={`text-sm font-black ${row.avg >= 8 ? "text-emerald-600" : row.avg >= 5 ? "text-amber-600" : "text-rose-600"}`}>{row.avg.toFixed(1)}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 ml-7">
                        {row.subs.map((sub, si) => {
                          const t = lessons.find((l) => l.id === sub.lessonId)?.title || sub.lessonTitle;
                          const c = sub.totalScore >= 8 ? "bg-emerald-100 text-emerald-700" : sub.totalScore >= 5 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700";
                          return <span key={si} className={`px-2 py-0.5 rounded text-[10px] font-bold ${c}`}>{t.length > 15 ? t.slice(0, 15) + "…" : t} {sub.totalScore.toFixed(1)}</span>;
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
