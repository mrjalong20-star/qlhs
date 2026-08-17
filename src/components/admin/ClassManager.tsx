import { useEffect, useState } from "react";
import { BookUser, Copy, Plus, RefreshCw, Link as LinkIcon } from "lucide-react";
import { authService } from "../../services/authService";

interface SchoolClass { id: string; name: string; classCode: string; schoolYear: string; teacherName: string; createdAt: string; studentCount: number; }

export function ClassManager() {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/classes", { headers: authService.headers() });
      const json = await res.json();
      if (res.ok && json.success) setClasses(json.data || []);
      else setMessage(json.message || "Không thể tải danh sách lớp.");
    } catch { setMessage("Không thể kết nối máy chủ."); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function createClass() {
    if (!name.trim()) return setMessage("Vui lòng nhập tên lớp.");
    setLoading(true); setMessage("");
    try {
      const res = await fetch("/api/classes", { method: "POST", headers: { "Content-Type": "application/json", ...authService.headers() }, body: JSON.stringify({ name: name.trim() }) });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Tạo lớp thất bại.");
      setName("");
      await load();
      const url = `${window.location.origin}${json.joinUrl}`;
      await navigator.clipboard?.writeText(url);
      setMessage(`Đã tạo lớp. Link kết nối đã được sao chép: ${url}`);
    } catch (e: any) { setMessage(e?.message || "Không thể tạo lớp."); setLoading(false); }
  }

  return <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
    <div className="flex items-center justify-between gap-3">
      <div><div className="flex items-center gap-2"><BookUser className="w-5 h-5 text-indigo-600"/><h3 className="text-lg font-bold">Lớp học</h3></div><p className="text-xs text-slate-500 mt-1">Tạo lớp và gửi link kết nối cho học sinh.</p></div>
      <button onClick={load} className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5"/> Cập nhật</button>
    </div>
    <div className="flex flex-col sm:flex-row gap-2">
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Ví dụ: 11A1" className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold" />
      <button onClick={createClass} disabled={loading} className="px-5 py-3 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50"><Plus className="w-4 h-4"/> Tạo lớp</button>
    </div>
    {message && <div className="rounded-xl bg-sky-50 border border-sky-100 p-3 text-xs text-sky-800 break-all">{message}</div>}
    <div className="space-y-3">
      {classes.map(c => { const url = `${window.location.origin}/?class=${encodeURIComponent(c.id)}`; return <div key={c.id} className="border border-slate-200 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div><div className="font-bold text-slate-900">Lớp {c.name}</div><div className="text-[11px] text-slate-500 mt-1">{c.studentCount} học sinh • Mã lớp {c.classCode}</div></div>
        <div className="flex flex-wrap gap-2"><button onClick={() => navigator.clipboard?.writeText(url)} className="px-3 py-2 rounded-xl bg-sky-50 text-sky-700 text-xs font-bold flex items-center gap-1.5"><Copy className="w-3.5 h-3.5"/> Sao chép link</button><a href={url} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5"><LinkIcon className="w-3.5 h-3.5"/> Mở link</a></div>
      </div> })}
      {classes.length === 0 && <div className="py-8 text-center text-slate-400 text-sm">Chưa có lớp. Hãy tạo lớp đầu tiên.</div>}
    </div>
  </div>;
}
