import { useEffect, useState, type FormEvent } from "react";
import { User, Sparkles, ArrowRight, ShieldCheck, Link2 } from "lucide-react";
import { StudentProfile, AppConfig } from "../../types";

interface StudentGateModalProps {
  isOpen: boolean;
  onSave: (profile: StudentProfile) => void;
  currentProfile: StudentProfile | null;
  config: AppConfig;
}

export function StudentGateModal({ isOpen, onSave, currentProfile }: StudentGateModalProps) {
  const [name, setName] = useState(currentProfile?.studentName || "");
  const [dateOfBirth, setDateOfBirth] = useState(currentProfile?.dateOfBirth || "");
  const [linkedClass, setLinkedClass] = useState<{ id: string; name: string; classCode?: string; teacherName: string } | null>(null);
  const [loadingClass, setLoadingClass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setName(currentProfile?.studentName || "");
    setDateOfBirth(currentProfile?.dateOfBirth || "");
    setError("");

    const classId = currentProfile?.classId || new URLSearchParams(window.location.search).get("class");
    if (!classId) {
      setLinkedClass(null);
      setError("Hãy mở liên kết lớp học do giáo viên gửi để vào lớp.");
      return;
    }

    setLoadingClass(true);
    fetch(`/api/classes/${encodeURIComponent(classId)}`)
      .then(async (r) => {
        const json = await r.json().catch(() => ({}));
        if (!r.ok || !json.success || !json.data) {
          throw new Error(json.message || "Liên kết lớp học không hợp lệ hoặc lớp đã bị xóa.");
        }
        return json.data;
      })
      .then((data) => {
        setLinkedClass(data);
        setError("");
      })
      .catch((err: any) => {
        setLinkedClass(null);
        setError(err?.message || "Không thể kết nối để xác nhận lớp học.");
      })
      .finally(() => setLoadingClass(false));
  }, [isOpen, currentProfile?.classId, currentProfile?.studentName, currentProfile?.dateOfBirth]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const classId = linkedClass?.id || currentProfile?.classId || new URLSearchParams(window.location.search).get("class");

    if (!classId) return setError("Liên kết lớp học không được tìm thấy. Hãy mở đúng link giáo viên gửi.");
    if (!cleanName) return setError("Vui lòng nhập Họ và tên của bạn.");
    if (cleanName.length < 2) return setError("Họ và tên quá ngắn.");
    if (!dateOfBirth) return setError("Vui lòng nhập ngày tháng năm sinh.");

    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/students/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId, studentName: cleanName, dateOfBirth }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.message || "Thông tin học sinh không hợp lệ.");
      localStorage.setItem("geo11_student_session_id", json.sessionId);
      onSave({ ...json.profile, classId: json.classId, teacherName: json.teacherName });
      window.history.replaceState({}, "", window.location.pathname);
    } catch (err: any) {
      setError(err?.message || "Không thể vào lớp học.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="student-gate-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div id="student-gate-card" className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-700 p-6 text-white text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20">
            <User className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Vào lớp học</h2>
          <p className="text-xs text-sky-100 mt-1 font-medium">Chỉ cần nhập họ tên và ngày sinh</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-sky-50/80 border border-sky-100 rounded-xl p-3 text-xs text-sky-900 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Link lớp đã xác định sẵn lớp học.</p>
              <p className="text-sky-800 mt-0.5">Học sinh không cần chọn hoặc nhập mã lớp.</p>
            </div>
          </div>

          {linkedClass && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
              <div className="flex items-center gap-2 font-bold"><Link2 className="w-4 h-4" /><span>Lớp {linkedClass.name}</span></div>
              <div className="mt-1">Giáo viên: {linkedClass.teacherName}</div>
              {linkedClass.classCode && <div className="mt-0.5 text-emerald-700">Mã lớp: {linkedClass.classCode}</div>}
            </div>
          )}

          {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl font-medium">{error}</div>}

          <div>
            <label htmlFor="input-student-name" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Họ và tên học sinh <span className="text-rose-500">*</span></label>
            <input id="input-student-name" type="text" value={name} onChange={(e) => { setName(e.target.value); if (error) setError(""); }} placeholder="Ví dụ: Nguyễn Văn An" autoFocus autoComplete="name" className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-800" />
          </div>

          <div>
            <label htmlFor="input-student-dob" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Ngày tháng năm sinh <span className="text-rose-500">*</span></label>
            <input id="input-student-dob" type="date" value={dateOfBirth} onChange={(e) => { setDateOfBirth(e.target.value); if (error) setError(""); }} autoComplete="bday" className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-800" />
          </div>

          <button id="btn-submit-student-info" type="submit" disabled={saving || loadingClass || !linkedClass} className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <span>{loadingClass ? "ĐANG XÁC NHẬN LỚP..." : saving ? "ĐANG VÀO LỚP..." : "VÀO LỚP HỌC"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center pt-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /><span>Không yêu cầu mật khẩu</span></div>
        </form>
      </div>
    </div>
  );
}
