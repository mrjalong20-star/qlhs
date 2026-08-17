import { useEffect, useState } from "react";
import { BookUser, Copy, Plus, RefreshCw, Link as LinkIcon, AlertCircle, CheckCircle2 } from "lucide-react";
import { authService } from "../../services/authService";

interface SchoolClass {
  id: string;
  name: string;
  classCode: string;
  schoolYear: string;
  teacherName: string;
  createdAt: string;
  studentCount: number;
}

export function ClassManager() {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");

  async function load() {
    setLoadingList(true);
    try {
      const session = authService.get();
      if (!session?.token) throw new Error("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");

      const res = await fetch("/api/classes", {
        headers: { ...authService.headers(), Accept: "application/json" },
      });
      const raw = await res.text();
      let json: any = {};
      try { json = raw ? JSON.parse(raw) : {}; } catch {}

      if (!res.ok || !json.success) {
        throw new Error(json.message || raw || `Không thể tải danh sách lớp (HTTP ${res.status}).`);
      }
      setClasses(Array.isArray(json.data) ? json.data : []);
    } catch (e: any) {
      setMessage(e?.message || "Không thể kết nối máy chủ.");
      setMessageType("error");
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function copyText(text: string) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {}
    return false;
  }

  async function createClass() {
    const cleanName = name.trim();
    if (!cleanName) {
      setMessage("Vui lòng nhập tên lớp.");
      setMessageType("error");
      return;
    }

    const session = authService.get();
    if (!session?.token) {
      setMessage("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...authService.headers(),
        },
        body: JSON.stringify({ name: cleanName }),
      });

      const raw = await res.text();
      let json: any = {};
      try { json = raw ? JSON.parse(raw) : {}; } catch {}

      if (!res.ok || !json.success) {
        throw new Error(json.message || raw || `Tạo lớp thất bại (HTTP ${res.status}).`);
      }

      const created = json.data as SchoolClass;
      const createdClass: SchoolClass = {
        ...created,
        studentCount: Number(created?.studentCount || 0),
      };

      // Update the UI immediately. Do not make clipboard permissions a dependency of creation.
      setClasses((current) => [createdClass, ...current.filter((c) => c.id !== createdClass.id)]);
      setName("");

      const url = `${window.location.origin}${json.joinUrl || `/?class=${encodeURIComponent(createdClass.id)}`}`;
      const copied = await copyText(url);
      setMessage(
        copied
          ? `Đã tạo lớp "${createdClass.name}" thành công. Link lớp đã được sao chép.`
          : `Đã tạo lớp "${createdClass.name}" thành công. Link lớp: ${url}`
      );
      setMessageType("success");

      // Confirm the server/database state without blocking the successful UI update.
      void load();
    } catch (e: any) {
      setMessage(e?.message || "Không thể tạo lớp.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BookUser className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold">Lớp học</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">Tạo lớp và gửi link kết nối cho học sinh.</p>
        </div>
        <button onClick={() => void load()} disabled={loadingList} className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${loadingList ? "animate-spin" : ""}`} /> Cập nhật
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") void createClass(); }}
          placeholder="Ví dụ: 11A1"
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold"
          disabled={loading}
        />
        <button onClick={() => void createClass()} disabled={loading} className="px-5 py-3 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50">
          <Plus className="w-4 h-4" /> {loading ? "ĐANG TẠO..." : "TẠO LỚP"}
        </button>
      </div>

      {message && (
        <div className={`rounded-xl border p-3 text-xs break-all flex items-start gap-2 ${
          messageType === "error" ? "bg-rose-50 border-rose-200 text-rose-800" :
          messageType === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" :
          "bg-sky-50 border-sky-100 text-sky-800"
        }`}>
          {messageType === "error" ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>{message}</span>
        </div>
      )}

      <div className="space-y-3">
        {loadingList && classes.length === 0 && <div className="py-8 text-center text-slate-400 text-sm">Đang tải danh sách lớp...</div>}
        {!loadingList && classes.length === 0 && <div className="py-8 text-center text-slate-400 text-sm">Chưa có lớp. Hãy tạo lớp đầu tiên.</div>}
        {classes.map((c) => {
          const url = `${window.location.origin}/?class=${encodeURIComponent(c.id)}`;
          return (
            <div key={c.id} className="border border-slate-200 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <div className="font-bold text-slate-900">Lớp {c.name}</div>
                <div className="text-[11px] text-slate-500 mt-1">{c.studentCount || 0} học sinh • Mã lớp {c.classCode}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => void copyText(url)} className="px-3 py-2 rounded-xl bg-sky-50 text-sky-700 text-xs font-bold flex items-center gap-1.5">
                  <Copy className="w-3.5 h-3.5" /> Sao chép link
                </button>
                <a href={url} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5" /> Mở link
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
