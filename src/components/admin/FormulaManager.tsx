import { useEffect, useState } from "react";
import { Calculator, Plus, Save, Trash2, X } from "lucide-react";
import { Formula } from "../../types";
import { authService } from "../../services/authService";

const GRADES = [6, 7, 8, 9, 10, 11, 12] as const;

type FormulaForm = Omit<Formula, "id"> & { id?: string };
const emptyForm = (): FormulaForm => ({ grade: 6, chapter: "", topic: "", title: "", formula: "", explanation: "", example: "", imageUrl: "" });

export function FormulaManager() {
  const [grade, setGrade] = useState<number>(6);
  const [items, setItems] = useState<Formula[]>([]);
  const [form, setForm] = useState<FormulaForm>(emptyForm());
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/content/formulas?grade=${grade}`);
      const j = await r.json();
      setItems(j.success ? j.data || [] : []);
    } finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [grade]);

  const save = async () => {
    const token = authService.get()?.token;
    const method = form.id ? "PATCH" : "POST";
    const url = form.id ? `/api/content/formulas/${encodeURIComponent(form.id)}` : "/api/content/formulas";
    const r = await fetch(url, { method, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ ...form, grade }) });
    const j = await r.json();
    if (!r.ok || !j.success) return alert(j.message || "Không thể lưu công thức.");
    setEditing(false); setForm(emptyForm()); await load();
  };

  const remove = async (id: string) => {
    if (!confirm("Xóa công thức này?")) return;
    const token = authService.get()?.token;
    const r = await fetch(`/api/content/formulas/${encodeURIComponent(id)}`, { method: "DELETE", headers: token ? { Authorization: `Bearer ${token}` } : {} });
    const j = await r.json();
    if (!r.ok || !j.success) return alert(j.message || "Không thể xóa công thức.");
    await load();
  };

  return <div className="space-y-5">
    <div className="flex flex-wrap gap-2 items-center justify-between"><div className="flex gap-2 items-center"><Calculator className="w-5 h-5 text-indigo-600"/><h2 className="font-extrabold text-lg">Quản lý công thức</h2></div><button onClick={() => { setForm({ ...emptyForm(), grade }); setEditing(true); }} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-2"><Plus className="w-4 h-4"/>Thêm công thức</button></div>
    <div className="flex flex-wrap gap-2">{GRADES.map(g => <button key={g} onClick={() => setGrade(g)} className={`px-3 py-2 rounded-lg text-xs font-bold ${grade === g ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}>Khối {g}</button>)}</div>
    {editing && <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3"><div className="grid md:grid-cols-2 gap-3">{([['title','Tên công thức'],['chapter','Chương'],['topic','Chuyên đề'],['formula','Công thức'],['explanation','Giải thích'],['example','Ví dụ'],['imageUrl','URL hình minh họa']] as const).map(([key,label]) => <label key={key} className={key === 'formula' || key === 'explanation' || key === 'example' ? 'md:col-span-2 text-xs font-bold text-slate-700' : 'text-xs font-bold text-slate-700'}>{label}<input value={String(form[key] || '')} onChange={e=>setForm({...form,[key]:e.target.value})} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-normal"/></label>)}</div><div className="flex gap-2"><button onClick={save} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-2"><Save className="w-4 h-4"/>Lưu</button><button onClick={()=>{setEditing(false);setForm(emptyForm())}} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-2"><X className="w-4 h-4"/>Hủy</button></div></div>}
    {loading ? <div className="text-sm text-slate-500">Đang tải…</div> : <div className="grid md:grid-cols-2 gap-4">{items.map(item => <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-4"><div className="flex justify-between gap-3"><div><h3 className="font-bold">{item.title}</h3><p className="text-xs text-slate-500">{item.chapter}{item.topic ? ` • ${item.topic}` : ""}</p></div><div className="flex gap-1"><button onClick={()=>{setForm({...item});setEditing(true)}} className="px-2 py-1 rounded-lg bg-slate-100 text-xs font-bold">Sửa</button><button onClick={()=>remove(item.id)} className="p-2 rounded-lg bg-rose-50 text-rose-600"><Trash2 className="w-4 h-4"/></button></div></div><div className="mt-3 p-3 rounded-xl bg-slate-50 text-lg font-semibold overflow-x-auto">{item.formula}</div>{item.imageUrl && <img src={item.imageUrl} alt={item.title} className="mt-3 w-full max-h-56 object-contain rounded-xl border border-slate-200"/>}</div>)}</div>}
  </div>;
}
