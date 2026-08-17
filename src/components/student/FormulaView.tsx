import { useEffect, useMemo, useState } from "react";
import { Calculator, Search } from "lucide-react";
import { Formula, Grade, StudentProfile } from "../../types";

export function FormulaView({ student }: { student: StudentProfile | null }) {
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [grade, setGrade] = useState<Grade>((student?.grade || 6) as Grade);
  const [query, setQuery] = useState("");
  useEffect(() => { if (student?.grade) setGrade(student.grade); }, [student?.grade]);
  useEffect(() => {
    void fetch(`/api/formulas?grade=${grade}`)
      .then(r => r.json())
      .then(j => setFormulas(j.success ? (j.data || []) : []))
      .catch(() => setFormulas([]));
  }, [grade]);
  const visible = useMemo(() => formulas.filter(f => !query || `${f.title} ${f.chapter} ${f.formula}`.toLowerCase().includes(query.toLowerCase())), [formulas, query]);
  return <div className="space-y-6">
    <div className="bg-gradient-to-r from-indigo-700 to-sky-600 rounded-3xl p-7 text-white shadow-lg"><div className="flex items-center gap-3"><Calculator className="w-8 h-8"/><div><h1 className="text-2xl font-extrabold">Công thức Toán</h1><p className="text-sm text-indigo-100">Công thức theo khối 6–12, có ví dụ và hình minh họa.</p></div></div></div>
    <div className="flex flex-wrap gap-2">{[6,7,8,9,10,11,12].map(g => <button key={g} onClick={() => setGrade(g as Grade)} className={`px-4 py-2 rounded-xl text-xs font-bold ${grade === g ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-700"}`}>Khối {g}</button>)}</div>
    <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm công thức, chuyên đề..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white"/></div>
    <div className="grid md:grid-cols-2 gap-5">{visible.map(f => <article key={f.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"><h3 className="font-bold text-lg">{f.title}</h3><p className="text-xs text-slate-500 mt-1">{f.chapter}{f.topic ? ` • ${f.topic}` : ""}</p><div className="mt-4 p-4 bg-slate-50 rounded-xl text-xl font-semibold overflow-x-auto">{f.formula}</div>{f.explanation && <p className="text-sm text-slate-600 mt-3">{f.explanation}</p>}{f.example && <p className="text-sm text-slate-700 mt-2"><b>Ví dụ:</b> {f.example}</p>}{f.imageUrl && <img src={f.imageUrl} alt={f.title} className="mt-4 w-full rounded-xl border border-slate-200 object-contain max-h-72"/>}</article>)}</div>
    {!visible.length && <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-500">Chưa có công thức cho khối này.</div>}
  </div>;
}
