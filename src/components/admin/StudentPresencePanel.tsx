import { useEffect, useMemo, useState } from "react";
import { Activity, Clock3, FileCheck2, GraduationCap, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { StudentPresence } from "../../types";
import { telemetryService } from "../../services/telemetryService";

function formatDuration(seconds: number) {
  const totalMinutes = Math.floor(Math.max(0, seconds) / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}p` : `${minutes}p`;
}

export function StudentPresencePanel() {
  const [students, setStudents] = useState<StudentPresence[]>([]);
  const [classFilter, setClassFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await telemetryService.getStudents();
    setStudents(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 15000);
    return () => window.clearInterval(timer);
  }, []);

  const classes = useMemo(() => Array.from(new Set(students.map((s) => s.className))).sort(), [students]);
  const filtered = useMemo(
    () => students.filter((s) => classFilter === "ALL" || s.className === classFilter),
    [students, classFilter]
  );
  const onlineCount = filtered.filter((s) => s.online).length;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">Theo dõi học sinh</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">Trạng thái online và thời gian học/kiểm tra được cập nhật tự động.</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold">
            <option value="ALL">Tất cả lớp</option>
            {classes.map((c) => <option key={c} value={c}>Lớp {c}</option>)}
          </select>
          <button onClick={load} className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Cập nhật
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4"><p className="text-[11px] text-emerald-700 font-bold">ĐANG ONLINE</p><p className="text-2xl font-black text-emerald-800 mt-1">{onlineCount}</p></div>
        <div className="rounded-2xl bg-sky-50 border border-sky-100 p-4"><p className="text-[11px] text-sky-700 font-bold">HỌC BÀI</p><p className="text-2xl font-black text-sky-800 mt-1">{filtered.filter((s) => s.online && s.lastActivity === "LEARNING").length}</p></div>
        <div className="rounded-2xl bg-violet-50 border border-violet-100 p-4"><p className="text-[11px] text-violet-700 font-bold">ĐANG KIỂM TRA</p><p className="text-2xl font-black text-violet-800 mt-1">{filtered.filter((s) => s.online && s.lastActivity === "EXAM").length}</p></div>
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4"><p className="text-[11px] text-slate-600 font-bold">TỔNG HỌC SINH</p><p className="text-2xl font-black text-slate-800 mt-1">{filtered.length}</p></div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="min-w-full text-xs text-left divide-y divide-slate-200">
          <thead className="bg-slate-50 text-slate-700 font-bold"><tr>
            <th className="px-4 py-3">Học sinh</th><th className="px-4 py-3">Lớp</th><th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3">Online gần nhất</th><th className="px-4 py-3">Thời gian online</th><th className="px-4 py-3">Học bài</th><th className="px-4 py-3">Kiểm tra</th><th className="px-4 py-3">Bài đã nộp</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((s) => (
              <tr key={s.sessionId} className="hover:bg-slate-50/70">
                <td className="px-4 py-3 font-bold text-slate-900">{s.studentName}<div className="text-[10px] text-slate-400 font-normal">NS: {s.dateOfBirth || "—"}</div></td>
                <td className="px-4 py-3 font-semibold">{s.className}</td>
                <td className="px-4 py-3">{s.online ? <span className="inline-flex items-center gap-1 text-emerald-700 font-bold"><Wifi className="w-3.5 h-3.5"/> Online</span> : <span className="inline-flex items-center gap-1 text-slate-400 font-bold"><WifiOff className="w-3.5 h-3.5"/> Offline</span>}</td>
                <td className="px-4 py-3 text-slate-500">{new Date(s.lastSeenAt).toLocaleString("vi-VN")}</td>
                <td className="px-4 py-3 font-mono"><span className="inline-flex items-center gap-1"><Clock3 className="w-3.5 h-3.5"/>{formatDuration(s.onlineSeconds)}</span></td>
                <td className="px-4 py-3 font-mono text-sky-700">{formatDuration(s.learningSeconds)}</td>
                <td className="px-4 py-3 font-mono text-violet-700">{formatDuration(s.examSeconds)}</td>
                <td className="px-4 py-3 font-bold"><span className="inline-flex items-center gap-1"><FileCheck2 className="w-3.5 h-3.5"/>{s.examsCompleted}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="py-10 text-center text-slate-400"><Activity className="w-10 h-10 mx-auto mb-2"/><p className="font-semibold">Chưa có phiên học sinh nào được ghi nhận.</p></div>}
      </div>
      <p className="text-[11px] text-slate-400">Thời gian được tính theo heartbeat của trình duyệt, tối đa 90 giây giữa hai lần cập nhật để tránh cộng thời gian khi học sinh rời máy.</p>
    </div>
  );
}
