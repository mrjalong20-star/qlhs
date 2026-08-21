import { useEffect, useMemo, useState } from "react";
import { Calculator, Search } from "lucide-react";
import { Formula, Grade, StudentProfile } from "../../types";

export function FormulaView({ student }: { student: StudentProfile | null }) {
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [grade, setGrade] = useState<Grade>((student?.grade || 6) as Grade);
  const [query, setQuery] = useState("");
  useEffect(() => { if (student?.grade) setGrade(student.grade); }, [student?.grade]);
  useEffect(() => {
    void fetch(`/api/content/formulas?grade=${grade}`)
      .then(r => r.json())
      .then(j => setFormulas(j.success ? (j.data || []) : []))
      .catch(() => setFormulas([]));
  }, [grade]);
  const visible = useMemo(() => formulas.filter(f => !query || `${f.title} ${f.chapter} ${f.topic} ${f.formula} ${f.explanation}`.toLowerCase().includes(query.toLowerCase())), [formulas, query]);

  return (
    <div className="max-w-2xl mx-auto space-y-4 pt-2">
      <h2 className="text-base font-extrabold text-slate-900">Công thức</h2>

      {/* Grade tabs */}
      <div className="flex gap-1 flex-wrap">
        {[6, 7, 8, 9, 10, 11, 12].map(g => (
          <button key={g} onClick={() => setGrade(g as Grade)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${grade === g ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            Khối {g}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm công thức..."
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {/* Formulas */}
      {visible.length === 0 ? (
        <div className="text-center py-16">
          <Calculator className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-sm font-semibold text-slate-500">Chưa có công thức</p>
          <p className="text-xs text-slate-400 mt-1">Giáo viên sẽ thêm công thức khi đến lúc</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map(f => (
            <div key={f.id} className="bg-white border border-slate-200 rounded-xl p-4">
              <h3 className="text-sm font-bold text-slate-900">{f.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{f.chapter}</p>
              <div className="mt-3 p-3 bg-slate-50 rounded-lg text-base font-semibold font-mono text-center">{f.formula}</div>
              {f.explanation && <p className="text-xs text-slate-600 mt-2">{f.explanation}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
