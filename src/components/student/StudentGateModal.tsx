import { useState, useEffect, type FormEvent } from "react";
import { User, School, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { StudentProfile, AppConfig } from "../../types";
import { CLASS_OPTIONS } from "../../config/appConfig";

interface StudentGateModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSave: (profile: StudentProfile) => void;
  currentProfile: StudentProfile | null;
  config: AppConfig;
}

export function StudentGateModal({
  isOpen,
  onClose,
  onSave,
  currentProfile,
  config,
}: StudentGateModalProps) {
  const [name, setName] = useState(currentProfile?.studentName || "");
  const [selectedClass, setSelectedClass] = useState(currentProfile?.className || "11A1");
  const [dateOfBirth, setDateOfBirth] = useState(currentProfile?.dateOfBirth || "");
  const [customClass, setCustomClass] = useState("");
  const [isCustomClass, setIsCustomClass] = useState(false);
  const [error, setError] = useState("");
  const [linkedClass, setLinkedClass] = useState<{id: string; name: string; teacherName: string} | null>(null);
  const [loadingClass, setLoadingClass] = useState(false);

  useEffect(() => {
    const classId = new URLSearchParams(window.location.search).get("class");
    if (!classId) return;
    setLoadingClass(true);
    fetch(`/api/classes/${encodeURIComponent(classId)}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          setLinkedClass(json.data);
          setSelectedClass(json.data.name);
          setIsCustomClass(false);
        } else setError("Liên kết lớp học không hợp lệ hoặc lớp đã bị xóa.");
      })
      .catch(() => setError("Không thể kết nối để xác nhận lớp học."))
      .finally(() => setLoadingClass(false));
  }, [isOpen]);

  useEffect(() => {
    if (currentProfile) {
      setName(currentProfile.studentName);
      setDateOfBirth(currentProfile.dateOfBirth || "");
      if (CLASS_OPTIONS.includes(currentProfile.className)) {
        setSelectedClass(currentProfile.className);
        setIsCustomClass(false);
      } else {
        setSelectedClass("Khác");
        setCustomClass(currentProfile.className);
        setIsCustomClass(true);
      }
    }
  }, [currentProfile]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const finalClass = isCustomClass ? customClass.trim().toUpperCase() : selectedClass;

    if (!cleanName) {
      setError("Vui lòng nhập Họ và tên của bạn");
      return;
    }
    if (cleanName.length < 2) {
      setError("Họ và tên quá ngắn");
      return;
    }
    if (!finalClass) {
      setError("Vui lòng chọn hoặc nhập lớp học");
      return;
    }
    if (!dateOfBirth) {
      setError("Vui lòng nhập ngày tháng năm sinh");
      return;
    }

    setError("");
    const classId = linkedClass?.id || currentProfile?.classId || new URLSearchParams(window.location.search).get("class");
    if (!classId) {
      setError("Hãy mở liên kết lớp học do giáo viên gửi để vào lớp.");
      return;
    }
    try {
      const res = await fetch("/api/students/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId, studentName: cleanName, dateOfBirth }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Thông tin học sinh không hợp lệ.");
      localStorage.setItem("geo11_student_session_id", json.sessionId);
      onSave({ ...json.profile, classId: json.classId, teacherName: json.teacherName });
      window.history.replaceState({}, "", window.location.pathname);
    } catch (err: any) {
      setError(err?.message || "Không thể đăng nhập lớp học.");
    }
  };

  return (
    <div
      id="student-gate-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="student-gate-card"
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-700 p-6 text-white text-center relative">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
            <User className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Thông Tin Học Sinh</h2>
          <p className="text-xs text-sky-100 mt-1 font-medium">
            {config.schoolName} • Môn {config.subject}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-sky-50/80 border border-sky-100 rounded-xl p-3 text-xs text-sky-900 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <span>
              Nhập chính xác thông tin để giáo viên có thể ghi nhận kết quả luyện tập của bạn vào bảng điểm.
            </span>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl font-medium animate-in fade-in">
              {error}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label
              htmlFor="input-student-name"
              className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider"
            >
              Họ và tên học sinh <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="input-student-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Ví dụ: Nguyễn Văn An"
                autoFocus
                className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all font-medium text-slate-800"
              />
            </div>
          </div>

          {/* Date of birth */}
          <div>
            <label htmlFor="input-student-dob" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Ngày tháng năm sinh <span className="text-rose-500">*</span>
            </label>
            <input
              id="input-student-dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => { setDateOfBirth(e.target.value); if (error) setError(""); }}
              className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-medium text-slate-800"
            />
          </div>

          {linkedClass && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 font-semibold">
              Lớp được giáo viên liên kết: <strong>{linkedClass.name}</strong> • Giáo viên: {linkedClass.teacherName}
            </div>
          )}

          {/* Class Select */}
          <div>
            <label
              htmlFor="select-student-class"
              className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider"
            >
              Lớp học <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 gap-2">
              <select
                id="select-student-class"
                value={isCustomClass ? "Khác" : selectedClass}
                disabled={Boolean(linkedClass) || loadingClass}
                onChange={(e) => {
                  if (e.target.value === "Khác") {
                    setIsCustomClass(true);
                  } else {
                    setIsCustomClass(false);
                    setSelectedClass(e.target.value);
                  }
                  if (error) setError("");
                }}
                className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-semibold text-slate-800"
              >
                {CLASS_OPTIONS.map((cls) => (
                  <option key={cls} value={cls}>
                    Lớp {cls}
                  </option>
                ))}
                <option value="Khác">Lớp khác (Nhập tay)...</option>
              </select>

              {isCustomClass && (
                <input
                  id="input-custom-class"
                  type="text"
                  value={customClass}
                  onChange={(e) => setCustomClass(e.target.value)}
                  placeholder="Nhập tên lớp (ví dụ: 11A6)"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-800"
                />
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3">
            <button
              id="btn-submit-student-info"
              type="submit"
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
            >
              <span>{loadingClass ? "ĐANG XÁC NHẬN LỚP..." : "VÀO LỚP HỌC"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Không yêu cầu mật khẩu • Lưu tạm phiên tự động</span>
          </div>
        </form>
      </div>
    </div>
  );
}
