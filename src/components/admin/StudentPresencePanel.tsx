import { useEffect, useMemo, useState } from "react";
import { GraduationCap, CheckCircle2, XCircle, BarChart3, RefreshCw } from "lucide-react";
import { SubmissionResult, Lesson } from "../../types";
import { authService } from "../../services/authService";

interface StudentPresencePanelProps {
  submissions?: SubmissionResult[];
  lessons?: Lesson[];
}

interface ApiClass {
  id: string;
  name: string;
  classCode: string;
  grade: number;
  studentCount: number;
  students: Array<{ id: string; studentName: string; dateOfBirth: string }>;
}

interface StudentScore {
  name: string;
  className: string;
  totalScore: number;
  avgScore: number;
  count: number;
  lessonIds: Set<string>;
}

export function StudentPresencePanel({ submissions = [], lessons = [] }: StudentPresencePanelProps) {
  const [apiClasses, setApiClasses] = useState<ApiClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [loadingClasses, setLoadingClasses] = useState(false);

  // Fetch teacher's classes from API
  async function loadClasses() {
    setLoadingClasses(true);
    try {
      const session = authService.get();
      if (!session?.token) return;
      const res = await fetch("/api/classes", {
        headers: { ...authService.headers(), Accept: "application/json" },
      });
      const raw = await res.text();
      let json: any = {};
      try { json = raw ? JSON.parse(raw) : {}; } catch {}
      if (res.ok && json.success) {
        setApiClasses(Array.isArray(json.data) ? json.data : []);
      }
    } catch {}
    setLoadingClasses(false);
  }

  useEffect(() => { void loadClasses(); }, []);

  // Selected class info
  const selectedClass = useMemo(
    () => apiClasses.find((c) => c.id === selectedClassId) || null,
    [apiClasses, selectedClassId]
  );

  // Students in selected class
  const classStudents = useMemo(() => {
    if (!selectedClass) return [];
    return Array.isArray(selectedClass.students) ? selectedClass.students : [];
  }, [selectedClass]);

  // Student scores for selected class, sorted A-Z
  const studentScores = useMemo(() => {
    if (!selectedClass) return [];
    const className = selectedClass.name;

    // Build score map from submissions
    const scoreMap = new Map<string, StudentScore>();
    for (const sub of submissions) {
      if (sub.className !== className) continue;
      const key = sub.studentName;
      const existing = scoreMap.get(key) || {
        name: sub.studentName,
        className,
        totalScore: 0,
        avgScore: 0,
        count: 0,
        lessonIds: new Set<string>(),
      };
      existing.totalScore += sub.totalScore;
      existing.count += 1;
      existing.avgScore = existing.totalScore / existing.count;
      existing.lessonIds.add(sub.lessonId);
      scoreMap.set(key, existing);
    }

    // Also add registered students who haven't submitted anything
    for (const s of classStudents) {
      const name = s.studentName;
      if (!scoreMap.has(name)) {
        scoreMap.set(name, {
          name,
          className,
          totalScore: 0,
          avgScore: 0,
          count: 0,
          lessonIds: new Set(),
        });
      }
    }

    return Array.from(scoreMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name, "vi")
    );
  }, [submissions, selectedClass, classStudents]);

  // Lessons sorted by number
  const sortedLessons = useMemo(() => {
    return [...lessons]
      .filter((l) => !l.isLocked)
      .sort((a, b) => (a.grade || 0) - (b.grade || 0) || a.lessonNumber - b.lessonNumber);
  }, [lessons]);

  return (
    <div className="space-y-4">
      {/* Header + Class selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-extrabold text-slate-900">Theo dõi học sinh</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Chọn lớp để xem bài đã làm và điểm số</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void loadClasses()}
            disabled={loadingClasses}
            className="px-2 py-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingClasses ? "animate-spin" : ""}`} />
          </button>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-bold min-w-[180px]"
          >
            <option value="">Chọn lớp...</option>
            {apiClasses.map((c) => (
              <option key={c.id} value={c.id}>
                Lớp {c.name} ({c.studentCount || 0} HS)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* No class selected */}
      {!selectedClassId && (
        <div className="text-center py-12 text-slate-400">
          <GraduationCap className="w-10 h-10 mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-semibold text-slate-500">Chọn lớp để xem dữ liệu</p>
          {apiClasses.length === 0 && (
            <p className="text-xs text-slate-400 mt-1">Chưa có lớp nào. Hãy tạo lớp trong tab "Lớp học".</p>
          )}
        </div>
      )}

      {/* Class data */}
      {selectedClass && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
              <p className="text-[10px] text-slate-600 font-bold">TỔNG HS</p>
              <p className="text-xl font-black text-slate-800">{classStudents.length}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">
              <p className="text-[10px] text-emerald-700 font-bold">ĐÃ LÀM BÀI</p>
              <p className="text-xl font-black text-emerald-800">
                {studentScores.filter((s) => s.count > 0).length}
              </p>
            </div>
            <div className="rounded-xl bg-sky-50 border border-sky-100 p-3">
              <p className="text-[10px] text-sky-700 font-bold">ĐIỂM TB LỚP</p>
              <p className="text-xl font-black text-sky-800">
                {studentScores.length > 0
                  ? (
                      studentScores.reduce((sum, s) => sum + s.avgScore, 0) /
                      studentScores.length
                    ).toFixed(1)
                  : "—"}
              </p>
            </div>
          </div>

          {/* Student table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-600" />
              <h4 className="text-sm font-bold text-slate-900">
                Danh sách học sinh — Lớp {selectedClass.name}
              </h4>
            </div>

            {studentScores.length === 0 ? (
              <div className="py-10 text-center text-slate-400">
                <p className="text-xs font-semibold">Chưa có học sinh nào trong lớp này</p>
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
                      {sortedLessons.slice(0, 15).map((l) => (
                        <th key={l.id} className="px-2 py-2.5 text-center min-w-[50px]">
                          <span className="text-[9px] leading-tight block truncate" title={l.title}>
                            B{l.lessonNumber}
                          </span>
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
                        <td className="px-4 py-2 text-center font-bold text-amber-700">
                          {s.totalScore > 0 ? s.totalScore.toFixed(1) : "—"}
                        </td>
                        <td className="px-4 py-2 text-center">
                          {s.count > 0 ? (
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-xs ${
                                s.avgScore >= 8
                                  ? "bg-emerald-100 text-emerald-700"
                                  : s.avgScore >= 5
                                  ? "bg-sky-100 text-sky-700"
                                  : "bg-rose-100 text-rose-700"
                              }`}
                            >
                              {s.avgScore.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        {sortedLessons.slice(0, 15).map((l) => (
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
          {sortedLessons.length > 0 && (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-3">
              <p className="text-[10px] text-slate-500 font-bold mb-2">Chú thích cột bài học:</p>
              <div className="flex flex-wrap gap-2">
                {sortedLessons.slice(0, 15).map((l) => (
                  <span
                    key={l.id}
                    className="text-[10px] text-slate-600 bg-white border border-slate-200 rounded px-2 py-0.5"
                  >
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
