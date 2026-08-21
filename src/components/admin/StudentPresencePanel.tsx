import { useMemo, useState } from "react";
import { GraduationCap, CheckCircle2, XCircle, BarChart3 } from "lucide-react";
import { SubmissionResult, Lesson } from "../../types";

interface StudentPresencePanelProps {
  submissions?: SubmissionResult[];
  lessons?: Lesson[];
}

export function StudentPresencePanel({ submissions = [], lessons = [] }: StudentPresencePanelProps) {
  const [classFilter, setClassFilter] = useState("");

  // Get unique class names from submissions
  const classes = useMemo(() => {
    const set = new Set(submissions.map((s) => s.className));
    return Array.from(set).sort();
  }, [submissions]);

  // Auto-select first class if none selected
  const selectedClass = classFilter || (classes.length > 0 ? classes[0] : "");

  // Student scores for selected class, sorted A-Z
  const studentScores = useMemo(() => {
    if (!selectedClass) return [];
    const map = new Map<string, { name: string; className: string; totalScore: number; avgScore: number; count: number; lastSubmit: string; lessonIds: Set<string> }>();
    for (const sub of submissions) {
      if (sub.className !== selectedClass) continue;
      const key = sub.studentName;
      const existing = map.get(key) || { name: sub.studentName, className: sub.className, totalScore: 0, avgScore: 0, count: 0, lastSubmit: "", lessonIds: new Set() };
      existing.totalScore += sub.totalScore;
      existing.count += 1;
      existing.avgScore = existing.totalScore / existing.count;
      existing.lessonIds.add(sub.lessonId);
      if (!existing.lastSubmit || sub.submittedAt > existing.lastSubmit) existing.lastSubmit = sub.submittedAt;
      map.set(key, existing);
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, "vi"));
  }, [submissions, selectedClass]);

  // Lessons in this class
  const classLessons = useMemo(() => {
    if (!selectedClass) return [];
    return lessons.filter((l) => !l.isLocked).sort((a, b) => (a.grade || 0) - (b.grade || 0) || a.lessonNumber - b.lessonNumber);
  }, [lessons, selectedClass]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-extrabold text-slate-900">Theo dõi học sinh</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Chọn lớp để xem bài đã làm và điểm số</p>
        </div>
        <select value={selectedClass} onChange={(e) => setClassFilter(e.target.value)} className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-bold">
          <option value="">Chọn lớp...</option>
          {classes.map((c) => <option key={c} value={c}>Lớp {c}</option>)}
        </select>
      </div>

      {/* No class selected */}
      {!selectedClass && (
        <div className="text-center py-12 text-slate-400">
          <GraduationCap className="w-10 h-10 mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-semibold text-slate-500">Chọn lớp để xem dữ liệu</p>
        </div>
      )}

      {/* Class data */}
      {selectedClass && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3"><p className="text-[10px] text-slate-600 font-bold">TỔNG HS</p><p className="text-xl font-black text-slate-800">{studentScores.length}</p></div>
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3"><p className="text-[10px] text-emerald-700 font-bold">ĐÃ LÀM BÀI</p><p className="text-xl font-black text-emerald-800">{studentScores.filter((s) => s.count > 0).length}</p></div>
            <div className="rounded-xl bg-sky-50 border border-sky-100 p-3"><p className="text-[10px] text-sky-700 font-bold">ĐIỂM TB LỚP</p><p className="text-xl font-black text-sky-800">{studentScores.length > 0 ? (studentScores.reduce((sum, s) => sum + s.avgScore, 0) / studentScores.length).toFixed(1) : "—"}</p></div>
          </div>

          {/* Student scores + lesson status */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-600" />
              <h4 className="text-sm font-bold text-slate-900">Danh sách học sinh — Lớp {selectedClass}</h4>
            </div>

            {studentScores.length === 0 ? (
              <div className="py-10 text-center text-slate-400">
                <p className="text-xs font-semibold">Chưa có học sinh nào nộp bài trong lớp này</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs divide-y divide-slate-100">
                  <thead className="bg-slate-50 text-slate-600 font-bold">
                    <tr>
                      <th className="px-4 py-2.5 text-left">#</th>
                      <th className="px-4 py-2.5 text-left">Học sinh</th>
                      <th className="px-4 py-2.5 text-center">Số bài</th>
                      <th className="px-4 py-2.5 text-center">Tổng điểm</th>
                      <th className="px-4 py-2.5 text-center">Điểm TB</th>
                      {classLessons.slice(0, 10).map((l) => (
                        <th key={l.id} className="px-2 py-2.5 text-center min-w-[60px]">
                          <span className="text-[9px] leading-tight block truncate" title={l.title}>B{l.lessonNumber}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {studentScores.map((s, i) => (
                      <tr key={s.name} className="hover:bg-slate-50">
                        <td className="px-4 py-2 text-slate-400 font-bold">{i + 1}</td>
                        <td className="px-4 py-2 font-bold text-slate-900">{s.name}</td>
                        <td className="px-4 py-2 text-center font-bold">{s.count}</td>
                        <td className="px-4 py-2 text-center font-bold text-amber-700">{s.totalScore.toFixed(1)}</td>
                        <td className="px-4 py-2 text-center">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-xs ${s.avgScore >= 8 ? "bg-emerald-100 text-emerald-700" : s.avgScore >= 5 ? "bg-sky-100 text-sky-700" : "bg-rose-100 text-rose-700"}`}>
                            {s.avgScore.toFixed(1)}
                          </span>
                        </td>
                        {classLessons.slice(0, 10).map((l) => (
                          <td key={l.id} className="px-2 py-2 text-center">
                            {s.lessonIds.has(l.id) ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                            ) : (
                              <XCircle className="w-4 h-4 text-slate-200 mx-auto" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Lesson legend */}
          {classLessons.length > 0 && (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-3">
              <p className="text-[10px] text-slate-500 font-bold mb-2">Chú thích cột bài học:</p>
              <div className="flex flex-wrap gap-2">
                {classLessons.slice(0, 10).map((l) => (
                  <span key={l.id} className="text-[10px] text-slate-600 bg-white border border-slate-200 rounded px-2 py-0.5">
                    B{l.lessonNumber}: {l.title.length > 20 ? l.title.slice(0, 20) + "..." : l.title}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
