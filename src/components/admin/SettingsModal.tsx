import { useState, useRef, type FormEvent, type ChangeEvent } from "react";
import {
  Settings,
  X,
  CheckCircle2,
  AlertTriangle,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Link,
  ShieldAlert,
} from "lucide-react";
import { AppConfig, Question, Lesson, SubmissionResult } from "../../types";
import { apiService } from "../../services/apiService";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  questions: Question[];
  lessons: Lesson[];
  submissions: SubmissionResult[];
  onSaveConfig: (newConfig: AppConfig) => void;
  onRestoreBackup: (data: { questions: Question[]; lessons: Lesson[]; config: AppConfig }) => void;
  onResetFactory: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  config,
  questions,
  lessons,
  submissions,
  onSaveConfig,
  onRestoreBackup,
  onResetFactory,
}: SettingsModalProps) {
  const [schoolName, setSchoolName] = useState(config.schoolName);
  const [subject, setSubject] = useState(config.subject);
  const [teacherName, setTeacherName] = useState(config.teacherName || "");
  const [gasUrl, setGasUrl] = useState(config.googleAppsScriptUrl || "");
  const [allowInstantReview, setAllowInstantReview] = useState(config.allowInstantReview ?? true);

  const [testResult, setTestResult] = useState<{ status: "idle" | "testing" | "success" | "failed"; msg?: string }>({
    status: "idle",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!gasUrl.trim()) {
      setTestResult({ status: "failed", msg: "Chưa nhập URL Google Apps Script" });
      return;
    }
    setTestResult({ status: "testing" });
    const res = await apiService.testConnection(gasUrl.trim());
    if (res.success) {
      setTestResult({ status: "success", msg: "Kết nối thành công tới Google Apps Script!" });
    } else {
      setTestResult({ status: "failed", msg: res.message || "Không thể kết nối" });
    }
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    const updated: AppConfig = {
      ...config,
      schoolName: schoolName.trim(),
      subject: subject.trim() || "Toán 11",
      teacherName: teacherName.trim(),
      googleAppsScriptUrl: gasUrl.trim(),
      allowInstantReview,
    };
    onSaveConfig(updated);
    onClose();
  };

  const handleExportBackup = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      config,
      questions,
      lessons,
      submissions,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup_toan_11_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.questions && Array.isArray(json.questions)) {
          onRestoreBackup({
            questions: json.questions,
            lessons: json.lessons || lessons,
            config: json.config || config,
          });
          alert("Khôi phục sao lưu thành công!");
          onClose();
        } else {
          alert("File sao lưu không hợp lệ.");
        }
      } catch (err: any) {
        alert("Lỗi đọc file JSON: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      id="settings-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold">Cài Đặt Hệ Thống</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* General Information */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase text-slate-900 tracking-wider">
              Thông Tin Trường & Giáo Viên
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên Trường THPT</label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên Giáo Viên Phụ Trách</label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="Ví dụ: Thầy / Cô Nguyễn Thị Mai"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Google Apps Script URL */}
          <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <h3 className="text-xs font-extrabold uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
              <Link className="w-4 h-4 text-sky-600" />
              <span>Google Apps Script Web App URL</span>
            </h3>
            <p className="text-slate-500 text-[11px]">
              Dán URL đã Deploy dạng Web App từ Google Apps Script để nhận bài làm tự động vào Google Sheets.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <input
                type="text"
                value={gasUrl}
                onChange={(e) => {
                  setGasUrl(e.target.value);
                  setTestResult({ status: "idle" });
                }}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-[11px] focus:ring-2 focus:ring-sky-500"
              />
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testResult.status === "testing"}
                className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl cursor-pointer shrink-0 disabled:opacity-50"
              >
                {testResult.status === "testing" ? "Đang kiểm tra..." : "Kiểm tra kết nối"}
              </button>
            </div>

            {testResult.status === "success" && (
              <p className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{testResult.msg}</span>
              </p>
            )}

            {testResult.status === "failed" && (
              <p className="text-rose-700 font-bold text-[11px] flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{testResult.msg}</span>
              </p>
            )}
          </div>

          {/* Backup & Restore */}
          <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <h3 className="text-xs font-extrabold uppercase text-slate-900 tracking-wider">
              Sao Lưu & Khôi Phục Dữ Liệu
            </h3>
            <p className="text-slate-500 text-[11px]">
              Tải toàn bộ ngân hàng câu hỏi, cấu hình và bài nộp về máy dạng file JSON an toàn.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleExportBackup}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-sky-600" />
                <span>Tải file Sao lưu (.json)</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                <span>Khôi phục từ file Sao lưu</span>
              </button>
            </div>
          </div>

          {/* Factory Reset */}
          <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-rose-900 block text-xs">Đặt lại dữ liệu mẫu gốc</span>
              <span className="text-[11px] text-rose-700">
                Xóa toàn bộ câu hỏi tùy chỉnh và đưa về ngân hàng mẫu ban đầu.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                if (confirm("Bạn có chắc chắn muốn đặt lại ngân hàng câu hỏi và bài học về mặc định?")) {
                  onResetFactory();
                  onClose();
                }
              }}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl cursor-pointer"
            >
              Đặt lại
            </button>
          </div>

          {/* Submit buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-200 text-slate-700 font-bold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold cursor-pointer"
            >
              LƯU CÀI ĐẶT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
