import { useEffect, useState, type FormEvent } from "react";
import { User, ArrowRight, ShieldCheck, GraduationCap, Calendar, Link2, Loader2 } from "lucide-react";
import { AppConfig } from "../../types";

interface StudentClassEntryProps {
  config: AppConfig;
  onEnter: (className: string, studentName: string, dateOfBirth: string, classId?: string) => void;
  onSwitchRole: () => void;
}

interface LinkedClass {
  id: string;
  name: string;
  classCode?: string;
  teacherName: string;
}

export function StudentClassEntry({ config, onEnter, onSwitchRole }: StudentClassEntryProps) {
  const [studentName, setStudentName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [linkedClass, setLinkedClass] = useState<LinkedClass | null>(null);
  const [loadingClass, setLoadingClass] = useState(false);
  const [error, setError] = useState("");

  // Auto-detect classId from URL query ?class=xxx
  useEffect(() => {
    const classId = new URLSearchParams(window.location.search).get("class");
    if (!classId) {
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
      .then((data: LinkedClass) => {
        setLinkedClass(data);
        setError("");
      })
      .catch((err: any) => {
        setLinkedClass(null);
        setError(err?.message || "Không thể kết nối để xác nhận lớp học.");
      })
      .finally(() => setLoadingClass(false));
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanName = studentName.trim();

    if (!linkedClass) {
      setError("Chưa xác định được lớp học. Hãy mở link giáo viên gửi.");
      return;
    }
    if (!cleanName) {
      setError("Vui lòng nhập họ và tên.");
      return;
    }
    if (cleanName.length < 2) {
      setError("Họ và tên quá ngắn.");
      return;
    }
    if (!dateOfBirth) {
      setError("Vui lòng nhập ngày sinh.");
      return;
    }
    onEnter(linkedClass.name, cleanName, dateOfBirth, linkedClass.id);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Vào lớp học</h1>
          <p className="text-sm text-slate-500 mt-1">
            Nhập thông tin để bắt đầu học
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20">
              <User className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold">Đăng nhập học sinh</h2>
            <p className="text-xs text-emerald-100 mt-1">Chỉ cần nhập họ tên và ngày sinh</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Info banner */}
            <div className="bg-emerald-50/80 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-900 flex items-start gap-2.5">
              <Link2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Link lớp đã xác định sẵn lớp học.</p>
                <p className="text-emerald-800 mt-0.5">Học sinh không cần nhập mã lớp.</p>
              </div>
            </div>

            {/* Loading class info */}
            {loadingClass && (
              <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 text-center">
                <Loader2 className="w-5 h-5 text-sky-600 animate-spin mx-auto mb-2" />
                <p className="text-xs text-sky-700 font-semibold">Đang xác nhận lớp học...</p>
              </div>
            )}

            {/* Class info */}
            {linkedClass && !loadingClass && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
                <div className="flex items-center gap-2 font-bold">
                  <Link2 className="w-4 h-4" />
                  <span>Lớp {linkedClass.name}</span>
                </div>
                <div className="mt-1">Giáo viên: {linkedClass.teacherName}</div>
                {linkedClass.classCode && (
                  <div className="mt-0.5 text-emerald-700">Mã lớp: {linkedClass.classCode}</div>
                )}
              </div>
            )}

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl font-medium">
                {error}
              </div>
            )}

            {/* Student name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Họ và tên <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => {
                  setStudentName(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Ví dụ: Nguyễn Văn An"
                autoFocus
                className="w-full px-4 py-3.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900"
              />
            </div>

            {/* Date of birth */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Ngày sinh <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => {
                    setDateOfBirth(e.target.value);
                    if (error) setError("");
                  }}
                  className="w-full px-4 py-3.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingClass || !linkedClass}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loadingClass ? "ĐANG XÁC NHẬN..." : "VÀO HỌC"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onSwitchRole}
              className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              ← Quay lại chọn vai trò
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Không cần mật khẩu</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
