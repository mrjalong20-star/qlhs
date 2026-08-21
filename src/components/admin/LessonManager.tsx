import { useState, useRef } from "react";
import { Lock, Unlock, Upload, Search, BookOpen, FileText } from "lucide-react";
import { Lesson, Question } from "../../types";
import { parseWordQuestionBank } from "../../services/wordService";
import { authService } from "../../services/authService";

interface LessonManagerProps {
  lessons: Lesson[];
  questions: Question[];
  onUpdateLesson: (updated: Lesson) => void;
  onBatchUpdateLessons: (updatedList: Lesson[]) => void;
  onBulkImportQuestions?: (newQuestions: Question[], mode: "MERGE" | "REPLACE") => void;
}

export function LessonManager({
  lessons,
  questions,
  onUpdateLesson,
  onBatchUpdateLessons,
  onBulkImportQuestions,
}: LessonManagerProps) {
  const [query, setQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState<number | "ALL">("ALL");
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState("");
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const docxInputRef = useRef<HTMLInputElement>(null);

  const filtered = lessons.filter((l) => {
    const matchGrade = gradeFilter === "ALL" || l.grade === gradeFilter;
    const matchQuery = !query || l.title.toLowerCase().includes(query.toLowerCase()) || l.chapter.toLowerCase().includes(query.toLowerCase());
    return matchGrade && matchQuery;
  });

  const handleToggleLock = (lesson: Lesson) => {
    onUpdateLesson({ ...lesson, isLocked: !lesson.isLocked });
  };

  const handleLockAll = (lock: boolean) => {
    const updated = lessons.map((l) => {
      if (gradeFilter === "ALL" || l.grade === gradeFilter) {
        return { ...l, isLocked: lock };
      }
      return l;
    });
    onBatchUpdateLessons(updated);
  };

  // Import JSON file → lessons
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        const items = Array.isArray(data) ? data : data.lessons || [];
        const imported: Lesson[] = items.map((item: any, i: number) => ({
          id: item.id || `import_${Date.now()}_${i}`,
          lessonNumber: item.lessonNumber || lessons.length + i + 1,
          title: item.title || `Bài ${lessons.length + i + 1}`,
          chapter: item.chapter || "Chưa phân chương",
          grade: item.grade || 6,
          semester: item.semester || 1,
          durationMinutes: item.durationMinutes || 45,
          allowReview: true,
          reviewMode: "FULL",
          isLocked: true,
          ...item,
        }));
        onBatchUpdateLessons([...imported, ...lessons]);
        alert(`Đã import ${imported.length} bài giảng từ JSON`);
      } catch {
        alert("File JSON không hợp lệ.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Import Word (.docx) → lessons + questions
  const handleImportDocx = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportMsg("Đang đọc file Word...");
    try {
      const result = await parseWordQuestionBank(file);
      if (result.errors.length > 0) {
        const errText = result.errors.slice(0, 5).map(e => `Dòng ${e.row}: ${e.reason}`).join("\n");
        alert(`Có ${result.errors.length} lỗi:\n${errText}${result.errors.length > 5 ? "\n..." : ""}`);
      }
      if (result.validQuestions.length === 0) {
        setImportMsg("Không tìm thấy câu hỏi hợp lệ trong file.");
        return;
      }
      // Group questions by lessonId → create Lesson entries
      const lessonMap = new Map<string, Question[]>();
      for (const q of result.validQuestions) {
        const lid = q.lessonId || "bai-01";
        if (!lessonMap.has(lid)) lessonMap.set(lid, []);
        lessonMap.get(lid)!.push(q);
      }
      const newLessons: Lesson[] = [];
      for (const [lid, qs] of lessonMap) {
        // Check if lesson already exists
        const existing = lessons.find(l => l.id === lid);
        if (!existing) {
          const num = parseInt(lid.replace("bai-", "")) || newLessons.length + 1;
          newLessons.push({
            id: lid,
            lessonNumber: num,
            title: `Bài ${num}`,
            chapter: "Nhập từ Word",
            grade: 6,
            semester: 1,
            durationMinutes: 45,
            allowReview: true,
            reviewMode: "FULL",
            isLocked: true,
          });
        }
      }
      if (newLessons.length > 0) {
        onBatchUpdateLessons([...newLessons, ...lessons]);
      }
      // Import questions
      if (onBulkImportQuestions) {
        onBulkImportQuestions(result.validQuestions, "MERGE");
      }
      // Save via API
      for (const q of result.validQuestions) {
        try {
          await fetch("/api/content/questions", {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authService.headers() },
            body: JSON.stringify(q),
          });
        } catch {}
      }
      setImportMsg(`Đã import ${result.validQuestions.length} câu hỏi từ ${newLessons.length} bài mới.`);
      setTimeout(() => setImportMsg(""), 4000);
    } catch (err: any) {
      setImportMsg("Lỗi đọc file Word: " + (err.message || "Không xác định"));
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">Quản lý bài học</h2>
          <p className="text-xs text-slate-400 mt-0.5">{lessons.length} bài học • Khóa/mở theo tiến độ giảng dạy</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleLockAll(false)} className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 cursor-pointer">
            Mở khóa
          </button>
          <button onClick={() => handleLockAll(true)} className="px-3 py-2 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 cursor-pointer">
            Khóa hết
          </button>
          <button onClick={() => jsonInputRef.current?.click()} disabled={importing} className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 cursor-pointer flex items-center gap-1">
            <Upload className="w-3.5 h-3.5" /> JSON
          </button>
          <button onClick={() => docxInputRef.current?.click()} disabled={importing} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold cursor-pointer flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" /> {importing ? "Đang import..." : "Tải Word"}
          </button>
          <input ref={jsonInputRef} type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          <input ref={docxInputRef} type="file" accept=".docx" onChange={handleImportDocx} className="hidden" />
        </div>
      </div>

      {importMsg && (
        <div className="p-3 rounded-xl bg-blue-50 text-blue-800 text-xs font-medium">{importMsg}</div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm bài học..." className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm" />
        </div>
        <div className="flex gap-1 flex-wrap">
          <button onClick={() => setGradeFilter("ALL")} className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${gradeFilter === "ALL" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}>Tất cả</button>
          {[6, 7, 8, 9, 10, 11, 12].map((g) => (
            <button key={g} onClick={() => setGradeFilter(g)} className={`px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${gradeFilter === g ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}>{g}</button>
          ))}
        </div>
      </div>

      {/* Lessons list */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-500">Chưa có bài học</p>
            <p className="text-xs text-slate-400 mt-1">Tải lên file Word (.docx) hoặc JSON để import danh sách bài học</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-600 font-bold">
                <tr>
                  <th className="px-4 py-2.5 text-left">Bài</th>
                  <th className="px-4 py-2.5 text-left">Tên bài học</th>
                  <th className="px-4 py-2.5 text-left">Chương</th>
                  <th className="px-4 py-2.5 text-center">Khối</th>
                  <th className="px-4 py-2.5 text-center">Câu hỏi</th>
                  <th className="px-4 py-2.5 text-center">Trạng thái</th>
                  <th className="px-4 py-2.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((lesson) => {
                  const qCount = questions.filter((q) => q.lessonId === lesson.id).length;
                  return (
                    <tr key={lesson.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-bold text-slate-900">{lesson.lessonNumber}</td>
                      <td className="px-4 py-2.5 font-semibold text-slate-900">{lesson.title}</td>
                      <td className="px-4 py-2.5 text-slate-500 truncate max-w-[200px]">{lesson.chapter}</td>
                      <td className="px-4 py-2.5 text-center"><span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">{lesson.grade || "?"}</span></td>
                      <td className="px-4 py-2.5 text-center"><span className={`px-2 py-0.5 rounded font-bold ${qCount > 0 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>{qCount}</span></td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${lesson.isLocked ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                          {lesson.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                          {lesson.isLocked ? "Khóa" : "Mở"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button onClick={() => handleToggleLock(lesson)} className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${lesson.isLocked ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"}`}>
                          {lesson.isLocked ? "Mở" : "Khóa"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
